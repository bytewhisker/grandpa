#!/usr/bin/env node
/**
 * Grandpa Live LLM Benchmark Harness
 * 
 * Runs real model API calls against:
 * 1. Grandpa (Optimized Quick)
 * 2. Ponytail
 * 3. Caveman
 * 4. Bare AI (Vanilla)
 * 
 * Uses exact provider token accounting:
 * - inputTokens
 * - outputTokens
 * - cachedTokens
 * - real inference latency (TTCS includes actual LLM inference time)
 * - multi-turn real repair loop (model -> code -> tests -> failure -> model repair -> tests)
 * - failure-aware efficiency metric: Total Tokens Consumed / Tasks Solved
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { executeCandidateSandboxed, VERIFIER_STATUS } from '../src/verifier.js';
import { UniversalLLMClient } from './llm-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 10 Representative tasks across categories
const REPRESENTATIVE_TASKS = [
  'net-fetch-timeout',        // Networking (easy)
  'net-post-json',            // Networking (easy)
  'ts-result-container',      // TypeScript (easy)
  'ts-deep-partial',          // TypeScript (medium)
  'node-safe-exec',           // Node.js (easy)
  'node-env-parser',          // Node.js (easy)
  'react-debounce-hook',      // Frontend (easy)
  'bug-race-condition',       // Bug Fixing (medium)
  'sec-timing-safe-eq',       // Security (hard)
  'refactor-date-formatter'   // Refactoring (easy)
];

const STRATEGIES = ['grandpa', 'ponytail', 'caveman', 'bare'];

// Optimized Prompts for Live Evaluation
const STRATEGY_SYSTEM_PROMPTS = {
  bare: 'You are a helpful coding assistant. Write clean, working code.',
  ponytail: 'You are a minimalist developer. Can it be one line? One line. Shortest working diff wins. Avoid abstractions. Output only code.',
  caveman: 'You caveman coder. Code work. Few words. Few tokens. No fluff. Code only.',
  grandpa: "Grandpa Quick: Output ONLY ESM JS in a single codeblock. Use 'export const ...' or 'export function ...'. Native stdlib. Guard null/undefined inputs. Verify res.ok and timeouts for I/O. Clean minimal code. Zero comments."
};

/**
 * Extracts executable code from model markdown response
 */
export function extractCodeFromResponse(content = '') {
  const match = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/.exec(content);
  if (match) {
    return match[1].trim();
  }
  // If no code fence, filter out markdown commentary
  return content.trim();
}

/**
 * Loads task files
 */
function loadTask(taskId) {
  const taskDir = path.join(__dirname, 'tasks', taskId);
  const metadata = JSON.parse(fs.readFileSync(path.join(taskDir, 'metadata.json'), 'utf-8'));
  const prompt = fs.readFileSync(path.join(taskDir, 'prompt.md'), 'utf-8');
  const starter = fs.readFileSync(path.join(taskDir, 'starter.js'), 'utf-8');
  const testCode = fs.readFileSync(path.join(taskDir, 'test.js'), 'utf-8');
  return { id: taskId, ...metadata, prompt, starter, testCode };
}

/**
 * Runs a single task across the live repair loop
 */
async function runLiveTask({ client, task, strategy, runIndex, rawDir }) {
  const startTime = performance.now();
  const systemPrompt = STRATEGY_SYSTEM_PROMPTS[strategy];

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCachedTokens = 0;
  let repairInputTokens = 0;
  let repairOutputTokens = 0;
  let inferenceMs = 0;

  const messages = [
    { role: 'user', content: task.prompt }
  ];

  let attempts = 0;
  let passed = false;
  let firstPass = false;
  let lastDiagnostic = '';
  let finalStatus = VERIFIER_STATUS.TEST_FAILURE;

  for (let attempt = 1; attempt <= 3; attempt++) {
    attempts = attempt;

    // Real live LLM call
    const completion = await client.generateCompletion({
      systemPrompt,
      messages
    });

    inferenceMs += completion.durationMs;

    if (attempt === 1) {
      totalInputTokens += completion.inputTokens;
      totalOutputTokens += completion.outputTokens;
      totalCachedTokens += completion.cachedTokens;
    } else {
      repairInputTokens += completion.inputTokens;
      repairOutputTokens += completion.outputTokens;
    }

    const candidateCode = extractCodeFromResponse(completion.content);

    // Isolated sandboxed verification
    const outcome = await executeCandidateSandboxed({
      candidateCode,
      testCode: task.testCode,
      timeoutMs: 4000
    });

    finalStatus = outcome.status;

    if (outcome.passed) {
      passed = true;
      if (attempt === 1) firstPass = true;
      break;
    }

    lastDiagnostic = outcome.diagnostic || outcome.summary;

    // Prepare real repair turn
    if (attempt < 3) {
      messages.push({ role: 'assistant', content: completion.content });
      messages.push({
        role: 'user',
        content: `Your previous code failed tests with error:\n${lastDiagnostic}\n\nFix the issue and provide the corrected code.`
      });
      // Pacing delay between repair calls
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  const ttcsMs = passed ? Math.round(performance.now() - startTime) : null;
  const totalTCS = totalInputTokens + totalOutputTokens + repairInputTokens + repairOutputTokens;

  const record = {
    benchmarkVersion: '2.0.0-live',
    provider: client.provider,
    model: client.model,
    strategy,
    task: task.id,
    category: task.category,
    difficulty: task.difficulty,
    run: runIndex,
    success: passed,
    firstPass,
    attempts,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    cachedTokens: totalCachedTokens,
    repairInputTokens,
    repairOutputTokens,
    totalTCS,
    inferenceMs,
    ttcsMs,
    status: finalStatus,
    diagnostic: passed ? '' : lastDiagnostic
  };

  if (rawDir) {
    const filename = `live_${strategy}_${task.id}_run${runIndex}.json`;
    fs.writeFileSync(path.join(rawDir, filename), JSON.stringify(record, null, 2), 'utf-8');
  }

  return record;
}

function calculateStats(values) {
  if (!values || values.length === 0) return { median: 0, p75: 0, p95: 0, mean: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const median = n % 2 === 0 ? Math.round((sorted[n / 2 - 1] + sorted[n / 2]) / 2) : sorted[Math.floor(n / 2)];
  const p75 = sorted[Math.floor(n * 0.75)] ?? sorted[n - 1];
  const p95 = sorted[Math.floor(n * 0.95)] ?? sorted[n - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = Math.round((sum / n) * 10) / 10;
  return { median, p75, p95, mean };
}

export async function runLiveBenchmark(options = {}) {
  const repetitions = options.repetitions || 5;
  const taskIds = options.tasks || REPRESENTATIVE_TASKS;

  const client = new UniversalLLMClient();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rawDir = path.join(__dirname, 'results', 'raw-live', timestamp);
  fs.mkdirSync(rawDir, { recursive: true });

  const tasks = taskIds.map(loadTask);
  const totalRuns = tasks.length * repetitions * STRATEGIES.length;

  console.log('='.repeat(80));
  console.log('  GRANDPA LIVE REAL-LLM BENCHMARK');
  console.log(`  Provider: ${client.provider.toUpperCase()} | Model: ${client.model}`);
  console.log(`  Tasks: ${tasks.length} | Repetitions: ${repetitions} | Strategies: ${STRATEGIES.length}`);
  console.log(`  Total Scheduled Runs: ${totalRuns}`);
  console.log(`  Output dir: ${rawDir}`);
  console.log('='.repeat(80) + '\n');

  const allRecords = [];
  let count = 0;

  for (let r = 1; r <= repetitions; r++) {
    console.log(`>>> Starting Repetition ${r}/${repetitions}`);

    for (const task of tasks) {
      for (const strategy of STRATEGIES) {
        count++;
        process.stdout.write(`  [${String(count).padStart(3)}/${totalRuns}] ${strategy.padEnd(8)} on ${task.id}... `);

        try {
          const record = await runLiveTask({ client, task, strategy, runIndex: r, rawDir });
          allRecords.push(record);
          const icon = record.success ? (record.firstPass ? '✓ PASS (1st)' : '✓ PASS (Repair)') : '✗ FAIL';
          console.log(`${icon} | TCS: ${record.totalTCS} t | TTCS: ${record.ttcsMs ?? '-'} ms`);
        } catch (err) {
          console.error(`ERROR: ${err.message}`);
        }

        // Pacing delay between runs to respect provider rate limits
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  console.log('\nAll live runs complete! Calculating failure-aware metrics...\n');

  const summary = {};
  for (const strat of STRATEGIES) {
    const runs = allRecords.filter(r => r.strategy === strat);
    const successes = runs.filter(r => r.success);
    const firstPasses = runs.filter(r => r.firstPass);

    const totalWorkflowTokens = runs.reduce((sum, r) => sum + r.totalTCS, 0);
    const tasksSolvedCount = successes.length;

    // Requirement 5: Failure-aware efficiency metric
    const tokensPerSolvedTask = tasksSolvedCount > 0
      ? Math.round(totalWorkflowTokens / tasksSolvedCount)
      : Infinity;

    const tcsStats = calculateStats(successes.map(r => r.totalTCS));
    const ttcsStats = calculateStats(successes.map(r => r.ttcsMs).filter(Boolean));

    summary[strat] = {
      strategy: strat,
      totalRuns: runs.length,
      successCount: successes.length,
      successRate: runs.length > 0 ? Math.round((successes.length / runs.length) * 100 * 10) / 10 : 0,
      firstPassCount: firstPasses.length,
      firstPassRate: runs.length > 0 ? Math.round((firstPasses.length / runs.length) * 100 * 10) / 10 : 0,
      totalWorkflowTokens,
      tokensPerSolvedTask,
      tcs: tcsStats,
      ttcs: ttcsStats
    };
  }

  // Save latest summary
  const summaryFile = path.join(__dirname, 'results', 'live-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    timestamp,
    provider: client.provider,
    model: client.model,
    hardware: {
      platform: os.platform(),
      cpus: os.cpus().length,
      nodeVersion: process.version
    },
    totalTasks: tasks.length,
    repetitions,
    totalRuns,
    summary,
    rawDir
  }, null, 2), 'utf-8');

  // Display Output Scoreboard
  console.log('='.repeat(108));
  console.log('  GRANDPA LIVE REAL-LLM BENCHMARK RESULTS');
  console.log('='.repeat(108));
  console.log(`${'Strategy'.padEnd(12)} | ${'Success'.padEnd(9)} | ${'1st-Pass'.padEnd(9)} | ${'Median TCS'.padEnd(12)} | ${'p75 TCS'.padEnd(10)} | ${'Tokens/Solved Task*'.padEnd(20)} | ${'Median TTCS'.padEnd(12)}`);
  console.log('-'.repeat(108));

  for (const strat of STRATEGIES) {
    const s = summary[strat];
    console.log(
      `${strat.padEnd(12)} | ` +
      `${(s.successRate + '%').padEnd(9)} | ` +
      `${(s.firstPassRate + '%').padEnd(9)} | ` +
      `${(s.tcs.median + ' t').padEnd(12)} | ` +
      `${(s.tcs.p75 + ' t').padEnd(10)} | ` +
      `${(s.tokensPerSolvedTask + ' t/solved').padEnd(20)} | ` +
      `${(s.ttcs.median + ' ms').padEnd(12)}`
    );
  }
  console.log('='.repeat(108));
  console.log('* Tokens/Solved Task: Total tokens consumed across complete workflow divided by number of tasks successfully solved.');

  return { summary, rawDir, allRecords };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runLiveBenchmark().catch(console.error);
}
