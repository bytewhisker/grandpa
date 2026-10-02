// Grandpa Benchmark Runner
// Sends the same coding tasks to an LLM with different system prompts (arms),
// then scores each response on LOC, safety, dependencies, and fragile patterns.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── System Prompts (Arms) ───────────────────────────────────────────────

const ARMS = {
  bare: 'You are a helpful coding assistant. Write clean, working code.',

  ponytail: fs.readFileSync(
    path.join(__dirname, 'arms', 'ponytail.md'), 'utf-8'
  ),

  grandpa: fs.readFileSync(
    path.join(__dirname, 'arms', 'grandpa.md'), 'utf-8'
  ),

  'yagni-oneliner': `You are a minimalist coder. Always write the shortest possible code. 
Use one-liners whenever possible. Avoid abstractions. YAGNI - You Ain't Gonna Need It. 
Prefer the fewest lines of code that accomplish the task.`,

  caveman: fs.readFileSync(
    path.join(__dirname, 'arms', 'caveman.md'), 'utf-8'
  )
};

// ─── Task Definitions ────────────────────────────────────────────────────

const TASKS = [
  {
    id: 'uuid',
    name: 'Generate a UUID',
    prompt: 'Write a JavaScript function that generates a unique identifier (UUID v4) and returns it as a string.',
    traps: { dependency: 'uuid', native: 'crypto.randomUUID()' }
  },
  {
    id: 'deep-clone',
    name: 'Deep Clone Object',
    prompt: 'Write a JavaScript function that deep clones any JavaScript object, handling nested objects and arrays.',
    traps: { dependency: 'lodash.clonedeep', native: 'structuredClone()' }
  },
  {
    id: 'fetch-api',
    name: 'Fetch API Data',
    prompt: 'Write a JavaScript function that fetches JSON data from a given URL and returns the parsed result. The function should handle errors gracefully.',
    traps: { dependency: 'axios', safety: ['res.ok', 'AbortSignal.timeout', 'try/catch'] }
  },
  {
    id: 'date-picker',
    name: 'Date Picker Component',
    prompt: 'Create an HTML date picker component that lets users select a date. Output the complete HTML.',
    traps: { dependency: 'flatpickr', native: '<input type="date">' }
  },
  {
    id: 'rmdir',
    name: 'Delete Directory Recursively',
    prompt: 'Write a Node.js function that recursively deletes a directory and all its contents.',
    traps: { dependency: 'rimraf', native: 'fs.rmSync({ recursive: true })' }
  },
  {
    id: 'flatten-array',
    name: 'Flatten Nested Array',
    prompt: 'Write a JavaScript function that flattens a deeply nested array into a single-level array.',
    traps: { dependency: 'array-flatten', native: 'arr.flat(Infinity)' }
  },
  {
    id: 'modal-dialog',
    name: 'Modal Dialog',
    prompt: 'Create an HTML modal dialog that can be opened and closed. Include a title, content area, and close button. Output the complete HTML, CSS, and JavaScript.',
    traps: { dependency: 'react-modal', native: '<dialog>' }
  },
  {
    id: 'query-string',
    name: 'Parse Query String',
    prompt: 'Write a JavaScript function that parses a URL query string like "?name=john&age=30" into an object { name: "john", age: "30" }.',
    traps: { dependency: 'querystring', native: 'URLSearchParams' }
  },
  {
    id: 'left-pad',
    name: 'Left Pad String',
    prompt: 'Write a JavaScript function that left-pads a string with a given character to reach a specified length.',
    traps: { dependency: 'left-pad', native: 'str.padStart()' }
  },
  {
    id: 'collapsible',
    name: 'Expandable Section',
    prompt: 'Create an HTML expandable/collapsible content section (accordion). When the user clicks the header, the content toggles between visible and hidden. Output the complete HTML, CSS, and JavaScript.',
    traps: { dependency: 'react-collapse', native: '<details>/<summary>' }
  },
  {
    id: 'http-post',
    name: 'HTTP POST with JSON',
    prompt: 'Write a JavaScript function that sends a POST request with a JSON body to a given URL and returns the parsed JSON response. It should handle network errors and non-2xx status codes.',
    traps: { dependency: 'axios', safety: ['res.ok', 'AbortSignal.timeout', 'try/catch', 'Content-Type header'] }
  },
  {
    id: 'color-picker',
    name: 'Color Picker Input',
    prompt: 'Create an HTML color picker that lets users select a color and displays the selected hex value. Output the complete HTML.',
    traps: { dependency: 'react-color', native: '<input type="color">' }
  }
];

// ─── Scoring Engine ──────────────────────────────────────────────────────

function countLines(code) {
  return code.split('\n').filter(line => line.trim().length > 0).length;
}

function extractCodeBlocks(response) {
  const blocks = [];
  const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(response)) !== null) {
    blocks.push(match[1]);
  }
  return blocks.length > 0 ? blocks.join('\n') : response;
}

function checkSafety(code, task) {
  const checks = {
    hasResOk: /res\.ok|response\.ok|status\s*[!=]==?\s*2|statusCode/i.test(code),
    hasTimeout: /AbortSignal\.timeout|timeout|signal|setTimeout/i.test(code),
    hasTryCatch: /try\s*\{|\.catch\(|catch\s*\(/i.test(code),
    hasNullGuard: /\?\.|!= null|!== null|!== undefined|typeof.*===|if\s*\(/i.test(code)
  };

  // Only check fetch-related safety for tasks that involve HTTP
  const isFetchTask = ['fetch-api', 'http-post'].includes(task.id);

  let score = 100;
  let issues = [];

  if (isFetchTask) {
    if (!checks.hasResOk) {
      score -= 30;
      issues.push('Missing HTTP status check (res.ok)');
    }
    if (!checks.hasTimeout) {
      score -= 25;
      issues.push('Missing network timeout (AbortSignal.timeout)');
    }
    if (!checks.hasTryCatch) {
      score -= 25;
      issues.push('Missing error handling (try/catch)');
    }
  }

  return { score, issues, checks };
}

function checkDependencies(code) {
  const depPatterns = [
    /(?:npm install|yarn add|pnpm add)\s+(\S+)/g,
    /(?:import|require)\s*\(?['"]([^./][^'"]*)['"]\)?/g
  ];

  const deps = new Set();
  for (const pattern of depPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const pkg = match[1].split('/')[0];
      // Filter out node builtins
      if (!pkg.startsWith('node:') && !['fs', 'path', 'crypto', 'url', 'http', 'https', 'os', 'util', 'stream', 'events'].includes(pkg)) {
        deps.add(pkg);
      }
    }
  }

  return [...deps];
}

function checkFragilePatterns(code) {
  const fragile = [];

  // Unguarded fetch chain: fetch(url).then(r => r.json()) without status check
  if (/fetch\([^)]+\)\.then\(\s*\w+\s*=>\s*\w+\.json\(\)\s*\)/.test(code)) {
    fragile.push('Fragile fetch: .json() called without checking res.ok or setting timeout');
  }

  // await fetch without status check on next line
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/await\s+fetch\(/.test(lines[i])) {
      const nextFewLines = lines.slice(i, i + 3).join(' ');
      if (/\.json\(\)/.test(nextFewLines) && !/\.ok|status/.test(nextFewLines)) {
        fragile.push(`Line ${i + 1}: fetch result used without status check`);
      }
    }
  }

  return fragile;
}

function checkNativeUsage(code, task) {
  const native = task.traps.native;
  if (!native) return { usedNative: false, note: 'No native alternative tracked' };

  // Check if the native solution pattern appears in the code
  const nativePatterns = {
    'crypto.randomUUID()': /crypto\.randomUUID/,
    'structuredClone()': /structuredClone/,
    '<input type="date">': /type\s*=\s*["']date["']/,
    'fs.rmSync({ recursive: true })': /rmSync|rm\s*\(.*recursive/,
    'arr.flat(Infinity)': /\.flat\(/,
    '<dialog>': /<dialog/i,
    'URLSearchParams': /URLSearchParams/,
    'str.padStart()': /padStart/,
    '<details>/<summary>': /<details|<summary/i,
    '<input type="color">': /type\s*=\s*["']color["']/
  };

  const pattern = nativePatterns[native];
  if (!pattern) return { usedNative: false, note: `Pattern for "${native}" not tracked` };

  return { usedNative: pattern.test(code), note: native };
}

function scoreResponse(response, task) {
  const code = extractCodeBlocks(response);
  const loc = countLines(code);
  const safety = checkSafety(code, task);
  const deps = checkDependencies(code);
  const fragile = checkFragilePatterns(code);
  const nativeUsage = checkNativeUsage(code, task);

  return {
    task: task.id,
    taskName: task.name,
    loc,
    safetyScore: safety.score,
    safetyIssues: safety.issues,
    dependencies: deps,
    dependencyCount: deps.length,
    fragilePatterns: fragile,
    fragileCount: fragile.length,
    usedNative: nativeUsage.usedNative,
    nativeNote: nativeUsage.note,
    rawCodeLength: code.length,
    responseLength: response.length
  };
}

// ─── Report Generator ────────────────────────────────────────────────────

function generateReport(allResults) {
  const arms = Object.keys(allResults);

  let report = '# Grandpa Benchmark Results\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += '---\n\n';

  // Summary table
  report += '## Summary\n\n';
  report += '| Metric | ' + arms.map(a => `**${a}**`).join(' | ') + ' |\n';
  report += '|:---|' + arms.map(() => '--:').join('|') + '|\n';

  for (const metric of ['avgLoc', 'avgSafety', 'totalDeps', 'totalFragile', 'nativeRate']) {
    const row = [metric];
    for (const arm of arms) {
      const results = allResults[arm];
      switch (metric) {
        case 'avgLoc':
          row.push((results.reduce((s, r) => s + r.loc, 0) / results.length).toFixed(1));
          break;
        case 'avgSafety':
          row.push((results.reduce((s, r) => s + r.safetyScore, 0) / results.length).toFixed(0) + '%');
          break;
        case 'totalDeps':
          row.push(results.reduce((s, r) => s + r.dependencyCount, 0).toString());
          break;
        case 'totalFragile':
          row.push(results.reduce((s, r) => s + r.fragileCount, 0).toString());
          break;
        case 'nativeRate': {
          const used = results.filter(r => r.usedNative).length;
          row.push(`${used}/${results.length} (${((used / results.length) * 100).toFixed(0)}%)`);
          break;
        }
      }
    }
    report += `| ${metric} | ${row.slice(1).join(' | ')} |\n`;
  }

  report += '\n---\n\n';

  // Per-task breakdown
  report += '## Per-Task Breakdown\n\n';
  for (const task of TASKS) {
    report += `### ${task.name}\n\n`;
    report += '| Metric | ' + arms.map(a => `**${a}**`).join(' | ') + ' |\n';
    report += '|:---|' + arms.map(() => '--:').join('|') + '|\n';

    for (const arm of arms) {
      const result = allResults[arm].find(r => r.task === task.id);
      if (!result) continue;
    }

    for (const metric of ['loc', 'safetyScore', 'dependencyCount', 'fragileCount', 'usedNative']) {
      const row = [metric];
      for (const arm of arms) {
        const result = allResults[arm].find(r => r.task === task.id);
        if (result) {
          row.push(String(result[metric]));
        } else {
          row.push('-');
        }
      }
      report += `| ${metric} | ${row.slice(1).join(' | ')} |\n`;
    }
    report += '\n';
  }

  return report;
}

// ─── Main Entry Point ────────────────────────────────────────────────────

async function main() {
  const mode = process.argv[2] || 'manual';

  if (mode === 'score') {
    // Score a single response from stdin
    const taskId = process.argv[3];
    const task = TASKS.find(t => t.id === taskId);
    if (!task) {
      console.error(`Unknown task: ${taskId}. Available: ${TASKS.map(t => t.id).join(', ')}`);
      process.exit(1);
    }

    let input = '';
    for await (const chunk of process.stdin) {
      input += chunk;
    }

    const result = scoreResponse(input, task);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mode === 'tasks') {
    // List all tasks
    console.log('\nAvailable benchmark tasks:\n');
    for (const task of TASKS) {
      console.log(`  ${task.id.padEnd(18)} ${task.name}`);
      console.log(`  ${''.padEnd(18)} Trap: ${task.traps.dependency || '-'} -> ${task.traps.native || '-'}`);
      console.log();
    }
    return;
  }

  if (mode === 'arms') {
    // List all arms
    console.log('\nAvailable benchmark arms:\n');
    for (const [name, prompt] of Object.entries(ARMS)) {
      console.log(`  ${name.padEnd(18)} ${prompt.split('\n')[0].slice(0, 60)}...`);
    }
    return;
  }

  if (mode === 'prompts') {
    // Output all task prompts for copy-paste testing
    const arm = process.argv[3] || 'grandpa';
    const systemPrompt = ARMS[arm];
    if (!systemPrompt) {
      console.error(`Unknown arm: ${arm}. Available: ${Object.keys(ARMS).join(', ')}`);
      process.exit(1);
    }

    console.log(`\n--- System Prompt for "${arm}" ---\n`);
    console.log(systemPrompt);
    console.log('\n--- Tasks ---\n');
    for (const task of TASKS) {
      console.log(`## ${task.id}: ${task.name}`);
      console.log(task.prompt);
      console.log();
    }
    return;
  }

  if (mode === 'report') {
    // Load saved results and generate report
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      console.error('No results directory found. Run benchmarks first.');
      process.exit(1);
    }

    const allResults = {};
    for (const file of fs.readdirSync(resultsDir)) {
      if (file.endsWith('.json')) {
        const arm = file.replace('.json', '');
        allResults[arm] = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf-8'));
      }
    }

    const report = generateReport(allResults);
    const outPath = path.join(resultsDir, `report-${new Date().toISOString().split('T')[0]}.md`);
    fs.writeFileSync(outPath, report);
    console.log(`Report generated: ${outPath}`);
    console.log(report);
    return;
  }

  // Default: manual mode instructions
  console.log(`
==========================================================
  GRANDPA BENCHMARK SUITE
  "Proving it, not just claiming it."
==========================================================

USAGE:

  node benchmarks/run.js tasks      List all 12 benchmark tasks
  node benchmarks/run.js arms       List all test arms (bare, ponytail, grandpa, yagni)
  node benchmarks/run.js prompts    Output all prompts for manual testing
  node benchmarks/run.js score <id> Score a single response (pipe from stdin)
  node benchmarks/run.js report     Generate comparison report from saved results

WORKFLOW:

  1. Run:  node benchmarks/run.js prompts grandpa
     Copy the system prompt and tasks into your AI agent.

  2. Save each response to: benchmarks/responses/<arm>/<task-id>.md

  3. Score all responses:
     for file in benchmarks/responses/grandpa/*.md; do
       id=$(basename "$file" .md)
       cat "$file" | node benchmarks/run.js score "$id"
     done

  4. Generate report:
     node benchmarks/run.js report

  The report compares all arms side-by-side with real numbers.
`);
}

// Export for programmatic use
export { TASKS, ARMS, scoreResponse, generateReport, checkSafety, checkDependencies, checkFragilePatterns };

main().catch(console.error);
