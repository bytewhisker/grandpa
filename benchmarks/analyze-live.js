import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawDir = path.join(__dirname, 'results', 'raw-live', '2026-10-02T13-13-37-294Z');

const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
console.log(`Found ${files.length} recorded runs in ${rawDir}`);

const records = files.map(f => JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf-8')));

// Let's filter runs from Repetitions 1, 2, and 3 (which completed all 10 tasks across all 4 strategies)
const cleanRuns = records.filter(r => r.run <= 3);
console.log(`Analyzing ${cleanRuns.length} complete runs across Repetitions 1, 2, and 3 (10 tasks * 3 reps * 4 strategies = 120 runs)\n`);

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

const summary = {};
for (const strat of ['grandpa', 'ponytail', 'caveman', 'bare']) {
  const stratRuns = cleanRuns.filter(r => r.strategy === strat);
  const successes = stratRuns.filter(r => r.success);
  const firstPasses = stratRuns.filter(r => r.firstPass);

  const totalTokens = stratRuns.reduce((sum, r) => sum + r.totalTCS, 0);
  const tasksSolved = successes.length;
  const tokensPerSolvedTask = tasksSolved > 0 ? Math.round(totalTokens / tasksSolved) : Infinity;

  const tcsStats = calculateStats(successes.map(r => r.totalTCS));
  const ttcsStats = calculateStats(successes.map(r => r.ttcsMs).filter(Boolean));

  summary[strat] = {
    totalRuns: stratRuns.length,
    successCount: successes.length,
    successRate: Math.round((successes.length / stratRuns.length) * 100),
    firstPassCount: firstPasses.length,
    firstPassRate: Math.round((firstPasses.length / stratRuns.length) * 100),
    totalTokens,
    tokensPerSolvedTask,
    tcs: tcsStats,
    ttcs: ttcsStats
  };
}

console.log('='.repeat(110));
console.log('  OPTIMIZED GRANDPA QUICK LIVE REAL-LLM BENCHMARK RESULTS (120 RUNS)');
console.log('='.repeat(110));
console.log(`${'Strategy'.padEnd(12)} | ${'Success'.padEnd(9)} | ${'1st-Pass'.padEnd(9)} | ${'Median TCS'.padEnd(12)} | ${'p75 TCS'.padEnd(10)} | ${'Tokens/Solved Task*'.padEnd(20)} | ${'Median TTCS'.padEnd(12)}`);
console.log('-'.repeat(110));

for (const strat of ['grandpa', 'ponytail', 'caveman', 'bare']) {
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
console.log('='.repeat(110));
console.log('* Tokens/Solved Task: Total tokens consumed across complete workflow divided by number of tasks successfully solved.\n');

// Write updated live summary JSON
fs.writeFileSync(path.join(__dirname, 'results', 'live-summary.json'), JSON.stringify({
  timestamp: '2026-10-02T13-13-37-294Z',
  provider: 'gemini',
  model: 'models/gemini-3.5-flash-lite',
  runsAnalyzed: cleanRuns.length,
  summary
}, null, 2), 'utf-8');
