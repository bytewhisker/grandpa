/**
 * Grandpa Hardened Parallel & Sandboxed Verifier
 * 
 * Complies with Grandpa Specification Part 9:
 * 1. Uses Promise.allSettled() for independent checks.
 * 2. Per-check timeout enforcement.
 * 3. Verifier crash classified as VERIFIER_ERROR (never candidate failure).
 * 4. No fail-open behavior (unknown state != PASS).
 * 5. Isolated temp directories & child process sandboxing.
 * 6. Guaranteed process and temporary file cleanup.
 * 7. Capped stdout/stderr with concise diagnostic extraction for repair loops.
 * 8. Standardized status classification:
 *    PASS | TEST_FAILURE | SYNTAX_ERROR | TYPE_ERROR | TIMEOUT | PROCESS_CRASH | VERIFIER_ERROR | HARNESS_ERROR
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { BLOAT_DATABASE } from './scanner.js';

export const VERIFIER_STATUS = {
  PASS: 'PASS',
  TEST_FAILURE: 'TEST_FAILURE',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  TYPE_ERROR: 'TYPE_ERROR',
  TIMEOUT: 'TIMEOUT',
  PROCESS_CRASH: 'PROCESS_CRASH',
  VERIFIER_ERROR: 'VERIFIER_ERROR',
  HARNESS_ERROR: 'HARNESS_ERROR'
};

const MAX_OUTPUT_BYTES = 8192; // 8 KB cap to prevent context explosion

/**
 * Execute an individual asynchronous check with a strict timeout
 */
function withTimeout(promise, timeoutMs = 2000, checkName = 'check') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: ${checkName} exceeded ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Static Parallel Verifier for quick AST/pattern analysis.
 * Uses Promise.allSettled and per-check timeouts.
 */
export async function verifyParallel(code = '', options = {}) {
  const startTime = performance.now();
  const timeoutMs = options.checkTimeoutMs || 500;

  try {
    const checks = [
      withTimeout(checkBloatAsync(code), timeoutMs, 'bloatCheck'),
      withTimeout(checkFragileAsync(code), timeoutMs, 'fragileCheck'),
      withTimeout(checkDefensiveAsync(code), timeoutMs, 'defensiveCheck')
    ];

    const results = await Promise.allSettled(checks);
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

    // Evaluate settled results without fail-open
    const [bloatRes, fragileRes, safetyRes] = results;

    let hasVerifierError = false;
    const errors = [];

    const bloat = bloatRes.status === 'fulfilled' 
      ? bloatRes.value 
      : (hasVerifierError = true, errors.push(`bloatCheck failed: ${bloatRes.reason?.message}`), { passed: false, detected: [] });

    const fragile = fragileRes.status === 'fulfilled'
      ? fragileRes.value
      : (hasVerifierError = true, errors.push(`fragileCheck failed: ${fragileRes.reason?.message}`), { passed: false, issues: [] });

    const safety = safetyRes.status === 'fulfilled'
      ? safetyRes.value
      : (hasVerifierError = true, errors.push(`safetyCheck failed: ${safetyRes.reason?.message}`), { passed: false, issues: [] });

    if (hasVerifierError) {
      return {
        status: VERIFIER_STATUS.VERIFIER_ERROR,
        isClean: false,
        elapsedMs,
        errors,
        bloat,
        fragile,
        safety
      };
    }

    const isClean = bloat.passed && fragile.passed && safety.passed;

    return {
      status: isClean ? VERIFIER_STATUS.PASS : VERIFIER_STATUS.TEST_FAILURE,
      isClean,
      elapsedMs,
      bloat,
      fragile,
      safety
    };
  } catch (err) {
    return {
      status: VERIFIER_STATUS.VERIFIER_ERROR,
      isClean: false,
      elapsedMs: Math.round((performance.now() - startTime) * 100) / 100,
      errors: [err.message]
    };
  }
}

async function checkBloatAsync(code) {
  const detected = [];
  for (const [pkg, info] of Object.entries(BLOAT_DATABASE)) {
    const regex = new RegExp(`(from\\s+['"]${pkg}['"]|require\\(['"]${pkg}['"]\\)|import\\s+.*['"]${pkg}['"])`, 'i');
    if (regex.test(code)) {
      detected.push({ pkg, native: info.native });
    }
  }
  return {
    passed: detected.length === 0,
    detected
  };
}

async function checkFragileAsync(code) {
  const issues = [];
  if (/fetch\([^)]+\)\.then\(\s*\w+\s*=>\s*\w+\.json\(\)\s*\)/.test(code)) {
    issues.push('Unguarded fetch .json() chain detected.');
  }
  if (/structuredClone\([^)]*\b(callback|handler|fn|func|Component)\b[^)]*\)/i.test(code)) {
    issues.push('structuredClone called on potential function/handler object.');
  }
  return {
    passed: issues.length === 0,
    issues
  };
}

async function checkDefensiveAsync(code) {
  const issues = [];
  if (code.includes('fetch(')) {
    const hasTimeout = /AbortSignal\.timeout|signal\s*:|setTimeout/i.test(code);
    const hasStatus = /\.ok|status\s*[!=]==?\s*2|statusCode/i.test(code);
    if (!hasTimeout) issues.push('Missing AbortSignal.timeout(ms) in network call.');
    if (!hasStatus) issues.push('Missing response status assertion (res.ok).');
  }
  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Sandboxed Candidate Execution in an isolated temporary directory and child process.
 * 
 * @param {object} params
 * @param {string} params.candidateCode - Code generated by strategy
 * @param {string} params.testCode - Test runner code with assertions
 * @param {number} [params.timeoutMs=5000] - Hard execution timeout
 * @param {string} [params.cwd] - Optional working directory
 * @param {object} [params.env] - Optional environment variables
 * @returns {Promise<object>} Detailed test outcome with standardized status
 */
export async function executeCandidateSandboxed({
  candidateCode = '',
  testCode = '',
  timeoutMs = 5000,
  cwd = null,
  env = {}
}) {
  const start = performance.now();
  let tempDir = null;

  try {
    // 1. Create isolated temp directory
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'grandpa-run-'));

    // Write minimal package.json so Node treats runner.js as ESM
    const pkgFile = path.join(tempDir, 'package.json');
    await fs.promises.writeFile(pkgFile, JSON.stringify({ type: 'module' }), 'utf-8');

    // Write candidate module and test execution script
    const candidateFile = path.join(tempDir, 'candidate.js');
    const runnerFile = path.join(tempDir, 'runner.js');

    await fs.promises.writeFile(candidateFile, candidateCode, 'utf-8');

    // Build the runner wrapping the candidate and executing tests with top-level ESM
    const runnerContent = `
import { performance } from 'node:perf_hooks';
import * as candidateModule from './candidate.js';

process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason && (reason.stack || reason.message || reason));
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(err && (err.stack || err.message || err));
  process.exit(1);
});

// User test assertions
${testCode}
`;
    await fs.promises.writeFile(runnerFile, runnerContent, 'utf-8');

    // 2. Spawn sandboxed child process
    const outcome = await runProcessSandboxed({
      command: process.execPath,
      args: ['--no-warnings', runnerFile],
      cwd: tempDir,
      timeoutMs,
      env: { ...process.env, ...env, NODE_ENV: 'test' }
    });

    const elapsedMs = Math.round(performance.now() - start);

    // 3. Classify execution status
    const classified = classifyOutcome(outcome, elapsedMs);
    return classified;

  } catch (err) {
    return {
      status: VERIFIER_STATUS.VERIFIER_ERROR,
      passed: false,
      durationMs: Math.round(performance.now() - start),
      summary: `Verifier runtime error: ${err.message}`,
      diagnostic: `Verifier error: ${err.message}`,
      stdout: '',
      stderr: err.stack || err.message,
      testsPassed: 0,
      testsTotal: 1
    };
  } finally {
    // 4. Guaranteed cleanup of temporary files and directory
    if (tempDir) {
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Silently ignore cleanup error to prevent masking primary test results
      }
    }
  }
}

/**
 * Execute child process with strict output capping and timeout killing
 */
function runProcessSandboxed({ command, args, cwd, timeoutMs, env }) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let killedByTimeout = false;

    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    const timer = setTimeout(() => {
      killedByTimeout = true;
      try {
        child.kill('SIGKILL');
      } catch {}
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += chunk.toString('utf-8');
      }
    });

    child.stderr.on('data', (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += chunk.toString('utf-8');
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        error: err,
        code: 1,
        signal: null,
        stdout,
        stderr: stderr + `\nProcess spawn error: ${err.message}`,
        killedByTimeout: false
      });
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({
        error: null,
        code,
        signal,
        stdout,
        stderr,
        killedByTimeout
      });
    });
  });
}

/**
 * Classify process results into standardized statuses and extract concise repair diagnostics
 */
function classifyOutcome(outcome, durationMs) {
  const { code, signal, stdout, stderr, killedByTimeout, error } = outcome;

  if (killedByTimeout) {
    return {
      status: VERIFIER_STATUS.TIMEOUT,
      passed: false,
      durationMs,
      summary: `Execution timed out after ${durationMs}ms`,
      diagnostic: `TIMEOUT: Task execution exceeded timeout limit (${durationMs}ms). Ensure asynchronous operations resolve or specify timeouts.`,
      stdout,
      stderr,
      testsPassed: 0,
      testsTotal: 1
    };
  }

  if (error) {
    return {
      status: VERIFIER_STATUS.HARNESS_ERROR,
      passed: false,
      durationMs,
      summary: `Harness error spawning runner: ${error.message}`,
      diagnostic: `HARNESS_ERROR: ${error.message}`,
      stdout,
      stderr,
      testsPassed: 0,
      testsTotal: 1
    };
  }

  if (code === 0) {
    return {
      status: VERIFIER_STATUS.PASS,
      passed: true,
      durationMs,
      summary: 'All checks passed',
      diagnostic: '',
      stdout,
      stderr,
      testsPassed: 1,
      testsTotal: 1
    };
  }

  // Analyze stderr for exact error category
  const errorText = (stderr || stdout || 'Unknown error').trim();
  const firstErrorLine = errorText.split('\n')[0] || '';

  let status = VERIFIER_STATUS.TEST_FAILURE;
  if (/SyntaxError/i.test(errorText)) {
    status = VERIFIER_STATUS.SYNTAX_ERROR;
  } else if (/TypeError/i.test(errorText)) {
    status = VERIFIER_STATUS.TYPE_ERROR;
  } else if (signal && signal !== 'SIGTERM') {
    status = VERIFIER_STATUS.PROCESS_CRASH;
  }

  // Extract concise diagnostic for repair feedback (keep lines focused on failure)
  const diagnostic = extractConciseDiagnostic(errorText);

  return {
    status,
    passed: false,
    durationMs,
    summary: firstErrorLine,
    diagnostic,
    stdout,
    stderr,
    testsPassed: 0,
    testsTotal: 1
  };
}

/**
 * Extracts a concise diagnostic snippet for the repair loop.
 * Strips internal node stack traces and caps line length.
 */
export function extractConciseDiagnostic(errorText = '') {
  if (!errorText) return 'Unknown error occurred.';

  const lines = errorText.split('\n');
  const relevant = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Filter out internal node modules and runner noise
    if (trimmed.includes('node:internal') || trimmed.includes('runner.js:')) {
      continue;
    }
    relevant.push(line);
    if (relevant.length >= 8) {
      break; // Cap to 8 concise lines max
    }
  }

  return relevant.join('\n').trim() || errorText.substring(0, 300);
}
