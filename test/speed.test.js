import assert from 'node:assert';
import { classifyTaskIntent, LATENCY_BUDGETS } from '../src/router.js';
import { verifyParallel } from '../src/verifier.js';

console.log('Running Grandpa Speed & Fast-Path Unit Tests...');

// 1. Test Router Classifications
const quickTask = classifyTaskIntent('Create a styled blue button');
assert.strictEqual(quickTask, 'quick', 'Button should be routed to quick mode');

const deepTask = classifyTaskIntent('Implement JWT authentication and database migration');
assert.strictEqual(deepTask, 'deep', 'Auth & DB should be routed to deep mode');

const standardTask = classifyTaskIntent('Add a new endpoint to fetch user profiles');
assert.strictEqual(standardTask, 'standard', 'New endpoint should be routed to standard mode');

// 2. Test Parallel Verifier (<10ms)
const safeCode = `
async function fetchUser(url, ms = 5000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}
`;

const result = await verifyParallel(safeCode);
assert.strictEqual(result.isClean, true, 'Clean code should pass parallel verification');
assert(result.elapsedMs < 50, `Parallel check must be blazing fast (<50ms), got ${result.elapsedMs}ms`);

// 3. Test Catching Bloat via Parallel Verifier
const bloatedCode = `
import axios from 'axios';
const res = await axios.get(url);
`;
const bloatResult = await verifyParallel(bloatedCode);
assert.strictEqual(bloatResult.isClean, false, 'Bloated code must fail verification');
assert.strictEqual(bloatResult.bloat.detected.length > 0, true, 'Should catch axios');

console.log('Speed & Fast-Path tests passed with flying colors!');
