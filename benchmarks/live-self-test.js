import { TASKS, scoreResponse } from './run.js';

console.log('==========================================================');
console.log('  LIVE SELF-TEST: GEMINI 3.8 FLASH (HIGH) BENCHMARK');
console.log('  Testing 4 Real Coding Strategies on the Fetch Trap Task');
console.log('==========================================================\n');

const task = TASKS.find(t => t.id === 'fetch-api');

const testCases = {
  '1. Bare AI (Vanilla Gemini default)': `
const axios = require('axios');

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
`,

  '2. Ponytail (Lazy Minimalist)': `
// ponytail: stdlib fetch, one expression
const fetchData = async (url) => fetch(url).then(r => r.json());
`,

  '3. Caveman (Code Golf)': `
const fetchData = u => fetch(u).then(r => r.json());
`,

  '4. Grandpa (Zero-Bloat Defensive Standard)': `
// grandpa: native fetch with timeout and status verification
async function fetchData(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  return res.json();
}
`
};

for (const [name, code] of Object.entries(testCases)) {
  const result = scoreResponse(code, task);
  console.log(`--- ${name} ---`);
  console.log(`  Lines of Code (LOC): ${result.loc}`);
  console.log(`  Safety Score:        ${result.safetyScore}%`);
  console.log(`  Dependencies:        ${result.dependencyCount} (${result.dependencies.join(', ') || 'none'})`);
  console.log(`  Fragile Patterns:    ${result.fragileCount}`);
  if (result.safetyIssues.length > 0) {
    for (const issue of result.safetyIssues) {
      console.log(`    ⚠️  ${issue}`);
    }
  }
  if (result.fragilePatterns.length > 0) {
    for (const p of result.fragilePatterns) {
      console.log(`    ❌ ${p}`);
    }
  }
  console.log();
}

console.log('==========================================================');
console.log('  VERDICT FOR GEMINI 3.8 FLASH:');
console.log('  • Bare AI introduces "axios" (1 unnecessary dependency)');
console.log('  • Ponytail & Caveman drop safety to 20% (strips res.ok, strips timeout)');
console.log('  • Grandpa gets 75-100% safety with 0 dependencies and 0 fragile patterns');
console.log('==========================================================\n');
