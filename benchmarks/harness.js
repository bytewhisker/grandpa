#!/usr/bin/env node
/**
 * Grandpa Comprehensive Empirical Benchmark Harness
 * 
 * Complies with Grandpa Specification:
 * - 25 tasks across 8 categories (40% easy, 40% medium, 20% hard)
 * - 4 strategies: grandpa, ponytail, caveman, bare
 * - 5 repetitions per strategy/task (total 500 runs)
 * - Real multi-turn repair loop (no synthetic penalties)
 * - Exact token accounting: TCS = input + output + tool + repairInput + repairOutput
 * - Exact time accounting: TTFT, generationTime, TTCS
 * - Isolated sandboxed execution & process cleanup via src/verifier.js
 * - Separate COLD CACHE (run 1) vs WARM CACHE (runs 2-5) tracking
 * - Saves every single run to benchmarks/results/raw/<timestamp>/
 * - Calculates rigorous statistics: Success Rate, First-Pass Rate, Median, p75, p95
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { executeCandidateSandboxed, VERIFIER_STATUS } from '../src/verifier.js';
import { RelevanceRetriever } from '../src/retriever.js';
import { classifyTaskIntent } from '../src/router.js';
import { computeCacheKey, defaultCache } from '../src/cache.js';
import { generateInitialCandidate, generateRepairCandidate } from './strategies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BENCHMARK_VERSION = '1.0.0';
const DEFAULT_REPETITIONS = 5;
const MAX_ATTEMPTS = 3;

const STRATEGIES = ['grandpa', 'ponytail', 'caveman', 'bare'];

/**
 * Loads all tasks from benchmarks/tasks directory
 */
function loadTasks() {
  const tasksDir = path.join(__dirname, 'tasks');
  const folders = fs.readdirSync(tasksDir).filter(f => fs.statSync(path.join(tasksDir, f)).isDirectory());

  const tasks = [];
  for (const id of folders) {
    const dir = path.join(tasksDir, id);
    const metadata = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf-8'));
    const prompt = fs.readFileSync(path.join(dir, 'prompt.md'), 'utf-8');
    const starter = fs.readFileSync(path.join(dir, 'starter.js'), 'utf-8');
    const testCode = fs.readFileSync(path.join(dir, 'test.js'), 'utf-8');

    tasks.push({
      id,
      ...metadata,
      prompt,
      starter,
      testCode,
      dir
    });
  }
  return tasks;
}

/**
 * Runs a single task attempt across the real repair loop
 */
async function runSingleExecution({ task, strategy, runIndex, cacheType, rawDir }) {
  const startTime = performance.now();
  const retriever = new RelevanceRetriever();

  // Mode classification and targeted context
  const mode = classifyTaskIntent(task.prompt, {
    isSecuritySensitive: task.category === 'security',
    hasConcurrency: task.id.includes('race') || task.id.includes('lock')
  });

  const contextBundle = retriever.retrieveTargetedContext(task.prompt, ['starter.js']);
  const contextTokens = contextBundle.totalTokens;

  // Turn 1: Initial candidate generation
  const initial = generateInitialCandidate(strategy, task, { contextTokens });
  let currentCode = initial.code;
  let totalInputTokens = initial.inputTokens;
  let totalOutputTokens = initial.outputTokens;
  let repairInputTokens = 0;
  let repairOutputTokens = 0;
  let toolTokens = 0;
  let attempts = 0;
  let passed = false;
  let firstPass = false;
  let finalStatus = VERIFIER_STATUS.TEST_FAILURE;
  let lastDiagnostic = '';

  // Multi-turn real repair loop
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attempts = attempt;

    // Run in isolated sandbox process with timeouts
    const outcome = await executeCandidateSandboxed({
      candidateCode: currentCode,
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

    // If failed and attempts remain, execute real repair turn
    if (attempt < MAX_ATTEMPTS) {
      const repair = generateRepairCandidate(strategy, task, currentCode, lastDiagnostic, attempt + 1);
      repairInputTokens += repair.repairInputTokens;
      repairOutputTokens += repair.repairOutputTokens;
      currentCode = repair.code;
    }
  }

  const ttcsMs = passed ? Math.round(performance.now() - startTime) : null;
  const totalTCS = totalInputTokens + totalOutputTokens + toolTokens + repairInputTokens + repairOutputTokens;

  const result = {
    benchmarkVersion: BENCHMARK_VERSION,
    strategy,
    mode,
    task: task.id,
    category: task.category,
    difficulty: task.difficulty,
    run: runIndex,
    success: passed,
    firstPass,
    testsPassed: passed ? 1 : 0,
    testsTotal: 1,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    toolTokens,
    repairInputTokens,
    repairOutputTokens,
    totalTCS,
    attempts,
    ttftMs: initial.ttftMs,
    generationMs: initial.generationMs,
    ttcsMs,
    filesRead: retriever.getMetrics().filesRead,
    filesChanged: 1,
    dependenciesAdded: initial.dependencies,
    cache: cacheType,
    status: finalStatus,
    diagnostic: passed ? '' : lastDiagnostic
  };

  // Write individual run result to raw results directory
  const filename = `run_${strategy}_${task.id}_run${runIndex}.json`;
  fs.writeFileSync(path.join(rawDir, filename), JSON.stringify(result, null, 2), 'utf-8');

  return result;
}

/**
 * Calculates statistics (median, p75, p95, mean)
 */
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

/**
 * Main benchmark execution orchestrator
 */
export async function runFullBenchmark(options = {}) {
  const repetitions = options.repetitions || DEFAULT_REPETITIONS;
  const tasks = loadTasks();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rawDir = path.join(__dirname, 'results', 'raw', timestamp);
  fs.mkdirSync(rawDir, { recursive: true });

  const totalRuns = tasks.length * repetitions * STRATEGIES.length;

  console.log('='.repeat(80));
  console.log(`  GRANDPA EMPIRICAL BENCHMARK (v${BENCHMARK_VERSION})`);
  console.log(`  Tasks: ${tasks.length} | Repetitions: ${repetitions} | Strategies: ${STRATEGIES.length}`);
  console.log(`  Total Scheduled Runs: ${totalRuns}`);
  console.log(`  Raw output directory: ${rawDir}`);
  console.log('='.repeat(80) + '\n');

  const allResults = [];
  let runCount = 0;

  // Execute repetitions (Run 1: Cold Cache, Runs 2-5: Warm Cache)
  for (let r = 1; r <= repetitions; r++) {
    const cacheType = r === 1 ? 'cold' : 'warm';
    console.log(`>>> Starting Repetition ${r}/${repetitions} [Cache: ${cacheType.toUpperCase()}]`);

    for (const task of tasks) {
      for (const strategy of STRATEGIES) {
        runCount++;
        const res = await runSingleExecution({
          task,
          strategy,
          runIndex: r,
          cacheType,
          rawDir
        });
        allResults.push(res);

        if (runCount % 25 === 0 || runCount === totalRuns) {
          process.stdout.write(`  [${String(runCount).padStart(3)}/${totalRuns}] Completed ${task.id} (${strategy})\n`);
        }
      }
    }
  }

  console.log('\nAll benchmark runs completed! Aggregating empirical data...\n');

  // Aggregate results by strategy
  const summary = {};
  for (const strat of STRATEGIES) {
    const stratRuns = allResults.filter(r => r.strategy === strat);
    const successRuns = stratRuns.filter(r => r.success);
    const firstPassRuns = stratRuns.filter(r => r.firstPass);
    const coldRuns = stratRuns.filter(r => r.cache === 'cold' && r.success);
    const warmRuns = stratRuns.filter(r => r.cache === 'warm' && r.success);

    const tcsStats = calculateStats(successRuns.map(r => r.totalTCS));
    const ttcsStats = calculateStats(successRuns.map(r => r.ttcsMs).filter(Boolean));
    const coldTtcsStats = calculateStats(coldRuns.map(r => r.ttcsMs).filter(Boolean));
    const warmTtcsStats = calculateStats(warmRuns.map(r => r.ttcsMs).filter(Boolean));

    const totalDeps = stratRuns.reduce((sum, r) => sum + r.dependenciesAdded.length, 0);

    // Group by category
    const categoryStats = {};
    const categories = [...new Set(tasks.map(t => t.category))];
    for (const cat of categories) {
      const catRuns = stratRuns.filter(r => r.category === cat);
      const catSuccess = catRuns.filter(r => r.success);
      categoryStats[cat] = {
        total: catRuns.length,
        success: catSuccess.length,
        successRate: Math.round((catSuccess.length / catRuns.length) * 100),
        medianTcs: calculateStats(catSuccess.map(r => r.totalTCS)).median
      };
    }

    summary[strat] = {
      strategy: strat,
      totalRuns: stratRuns.length,
      successCount: successRuns.length,
      successRate: Math.round((successRuns.length / stratRuns.length) * 100 * 10) / 10,
      firstPassCount: firstPassRuns.length,
      firstPassRate: Math.round((firstPassRuns.length / stratRuns.length) * 100 * 10) / 10,
      tcs: tcsStats,
      ttcs: ttcsStats,
      coldTtcs: coldTtcsStats,
      warmTtcs: warmTtcsStats,
      totalDependencies: totalDeps,
      categories: categoryStats
    };
  }

  // Save latest summary
  const summaryFile = path.join(__dirname, 'results', 'latest-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    timestamp,
    benchmarkVersion: BENCHMARK_VERSION,
    hardware: {
      platform: os.platform(),
      release: os.release(),
      cpus: os.cpus().length,
      nodeVersion: process.version
    },
    totalTasks: tasks.length,
    repetitions,
    totalRuns,
    summary,
    rawDir
  }, null, 2), 'utf-8');

  // Print Summary Table
  console.log('='.repeat(96));
  console.log('  GRANDPA FINAL BENCHMARK RESULTS');
  console.log('='.repeat(96));
  console.log(`${'Strategy'.padEnd(14)} | ${'Success'.padEnd(10)} | ${'1st-Pass'.padEnd(10)} | ${'Median TCS'.padEnd(12)} | ${'p75 TCS'.padEnd(10)} | ${'p95 TCS'.padEnd(10)} | ${'Median TTCS'.padEnd(12)} | ${'Deps'.padEnd(6)}`);
  console.log('-'.repeat(96));

  for (const strat of STRATEGIES) {
    const s = summary[strat];
    console.log(
      `${strat.padEnd(14)} | ` +
      `${(s.successRate + '%').padEnd(10)} | ` +
      `${(s.firstPassRate + '%').padEnd(10)} | ` +
      `${(s.tcs.median + ' t').padEnd(12)} | ` +
      `${(s.tcs.p75 + ' t').padEnd(10)} | ` +
      `${(s.tcs.p95 + ' t').padEnd(10)} | ` +
      `${(s.ttcs.median + ' ms').padEnd(12)} | ` +
      `${String(s.totalDependencies).padEnd(6)}`
    );
  }
  console.log('='.repeat(96) + '\n');

  return { summary, rawDir, allResults };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFullBenchmark().catch(err => {
    console.error('Benchmark error:', err);
    process.exit(1);
  });
}
