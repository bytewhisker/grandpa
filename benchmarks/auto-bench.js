// Grandpa vs Ponytail -- Automated Benchmark
// Runs all 12 tasks across all 4 arms using the Anthropic API
// then scores and generates a comparison report.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-xxx node benchmarks/auto-bench.js
//   (or set the env var in your shell)
//
// Requires: an Anthropic API key (uses Claude Haiku for cost efficiency)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TASKS, ARMS, scoreResponse } from './run.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────

const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.BENCH_MODEL || 'claude-sonnet-4-20250514';
const RUNS_PER_TASK = parseInt(process.env.BENCH_RUNS || '3', 10);
const API_URL = 'https://api.anthropic.com/v1/messages';

if (!API_KEY) {
  console.error(`
ERROR: Set ANTHROPIC_API_KEY environment variable.

  $env:ANTHROPIC_API_KEY = "sk-ant-..."
  node benchmarks/auto-bench.js

Or for a cheaper run with Haiku:
  $env:BENCH_MODEL = "claude-haiku-4-20250514"
  node benchmarks/auto-bench.js
`);
  process.exit(1);
}

// ─── API Caller ──────────────────────────────────────────────────────────

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    }),
    signal: AbortSignal.timeout(60000)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content.map(c => c.text).join('');
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;

  return { text, inputTokens, outputTokens };
}

// ─── Runner ──────────────────────────────────────────────────────────────

async function runBenchmark() {
  const armNames = Object.keys(ARMS);
  const allResults = {};

  console.log(`
==========================================================
  GRANDPA vs PONYTAIL -- AUTOMATED BENCHMARK
  Model: ${MODEL}
  Runs per task: ${RUNS_PER_TASK}
  Tasks: ${TASKS.length}
  Arms: ${armNames.join(', ')}
  Total API calls: ${TASKS.length * armNames.length * RUNS_PER_TASK}
==========================================================
`);

  for (const armName of armNames) {
    allResults[armName] = [];
    const systemPrompt = ARMS[armName];

    console.log(`\n--- ARM: ${armName} ---`);

    for (const task of TASKS) {
      const taskResults = [];

      for (let run = 0; run < RUNS_PER_TASK; run++) {
        process.stdout.write(`  ${task.id} (run ${run + 1}/${RUNS_PER_TASK})... `);

        try {
          const startTime = Date.now();
          const response = await callClaude(systemPrompt, task.prompt);
          const elapsed = Date.now() - startTime;

          const score = scoreResponse(response.text, task);
          score.inputTokens = response.inputTokens;
          score.outputTokens = response.outputTokens;
          score.totalTokens = response.inputTokens + response.outputTokens;
          score.timeMs = elapsed;
          score.run = run + 1;

          taskResults.push(score);

          // Save raw response
          const respDir = path.join(__dirname, 'responses', armName);
          fs.mkdirSync(respDir, { recursive: true });
          fs.writeFileSync(
            path.join(respDir, `${task.id}-run${run + 1}.md`),
            response.text
          );

          console.log(`LOC=${score.loc} Safety=${score.safetyScore}% Deps=${score.dependencyCount} Native=${score.usedNative} Tokens=${score.totalTokens} Time=${elapsed}ms`);

          // Rate limiting -- small pause between calls
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.log(`ERROR: ${err.message}`);
          taskResults.push({
            task: task.id,
            taskName: task.name,
            error: err.message,
            loc: 0,
            safetyScore: 0,
            dependencyCount: 0,
            fragileCount: 0,
            usedNative: false,
            totalTokens: 0,
            timeMs: 0,
            run: run + 1
          });
        }
      }

      // Take median result for this task (by LOC)
      taskResults.sort((a, b) => a.loc - b.loc);
      const median = taskResults[Math.floor(taskResults.length / 2)];
      allResults[armName].push(median);
    }

    // Save arm results
    const resultsDir = path.join(__dirname, 'results');
    fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(
      path.join(resultsDir, `${armName}.json`),
      JSON.stringify(allResults[armName], null, 2)
    );
  }

  // ─── Generate Report ───────────────────────────────────────────────────

  console.log('\n\n==========================================================');
  console.log('  RESULTS SUMMARY');
  console.log('==========================================================\n');

  const header = ['Metric', ...armNames];
  const rows = [];

  // Average LOC
  const locRow = ['Avg Lines of Code'];
  for (const arm of armNames) {
    const avg = allResults[arm].reduce((s, r) => s + r.loc, 0) / allResults[arm].length;
    locRow.push(avg.toFixed(1));
  }
  rows.push(locRow);

  // Average Safety
  const safetyRow = ['Avg Safety Score'];
  for (const arm of armNames) {
    const avg = allResults[arm].reduce((s, r) => s + r.safetyScore, 0) / allResults[arm].length;
    safetyRow.push(avg.toFixed(0) + '%');
  }
  rows.push(safetyRow);

  // Total Dependencies
  const depRow = ['Total Dependencies'];
  for (const arm of armNames) {
    depRow.push(allResults[arm].reduce((s, r) => s + r.dependencyCount, 0).toString());
  }
  rows.push(depRow);

  // Native Usage Rate
  const nativeRow = ['Native Usage Rate'];
  for (const arm of armNames) {
    const used = allResults[arm].filter(r => r.usedNative).length;
    nativeRow.push(`${used}/${allResults[arm].length}`);
  }
  rows.push(nativeRow);

  // Total Tokens
  const tokenRow = ['Avg Tokens'];
  for (const arm of armNames) {
    const avg = allResults[arm].reduce((s, r) => s + (r.totalTokens || 0), 0) / allResults[arm].length;
    tokenRow.push(avg.toFixed(0));
  }
  rows.push(tokenRow);

  // Fragile Patterns
  const fragileRow = ['Total Fragile Patterns'];
  for (const arm of armNames) {
    fragileRow.push(allResults[arm].reduce((s, r) => s + r.fragileCount, 0).toString());
  }
  rows.push(fragileRow);

  // Print table
  const colWidths = header.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
  console.log(header.map((h, i) => h.padEnd(colWidths[i])).join(' | '));
  console.log(colWidths.map(w => '-'.repeat(w)).join('-+-'));
  for (const row of rows) {
    console.log(row.map((c, i) => String(c).padEnd(colWidths[i])).join(' | '));
  }

  // Generate markdown report
  let report = `# Grandpa Benchmark Results\n\n`;
  report += `**Model:** ${MODEL}\n`;
  report += `**Runs per task:** ${RUNS_PER_TASK} (median reported)\n`;
  report += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  report += '## Summary\n\n';
  report += '| ' + header.join(' | ') + ' |\n';
  report += '|:---|' + armNames.map(() => '--:').join('|') + '|\n';
  for (const row of rows) {
    report += '| ' + row.join(' | ') + ' |\n';
  }
  report += '\n## Per-Task Breakdown\n\n';

  for (const task of TASKS) {
    report += `### ${task.name}\n\n`;
    report += `> Trap: \`${task.traps.dependency || '-'}\` -> \`${task.traps.native || '-'}\`\n\n`;
    report += '| Arm | LOC | Safety | Deps | Native | Tokens |\n';
    report += '|:---|--:|--:|--:|:---:|--:|\n';
    for (const arm of armNames) {
      const r = allResults[arm].find(x => x.task === task.id);
      if (r) {
        report += `| ${arm} | ${r.loc} | ${r.safetyScore}% | ${r.dependencyCount} | ${r.usedNative ? 'Yes' : 'No'} | ${r.totalTokens || '-'} |\n`;
      }
    }
    report += '\n';
  }

  const reportPath = path.join(__dirname, 'results', `report-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(reportPath, report);
  console.log(`\nFull report saved to: ${reportPath}`);
}

runBenchmark().catch(console.error);
