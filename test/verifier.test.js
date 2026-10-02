import assert from 'node:assert';
import { executeCandidateSandboxed, VERIFIER_STATUS, verifyParallel } from '../src/verifier.js';

console.log('Running Grandpa Hardened Verifier Unit Tests...');

// 1. Clean code execution passing test
const passingCode = `
export function add(a, b) {
  return a + b;
}
`;
const passingTest = `
import assert from 'node:assert';
import { add } from './candidate.js';
assert.strictEqual(add(2, 3), 5);
`;

const res1 = await executeCandidateSandboxed({
  candidateCode: passingCode,
  testCode: passingTest,
  timeoutMs: 2000
});
assert.strictEqual(res1.status, VERIFIER_STATUS.PASS);
assert.strictEqual(res1.passed, true);

// 2. Test assertion failure
const failingTest = `
import assert from 'node:assert';
import { add } from './candidate.js';
assert.strictEqual(add(2, 3), 99);
`;
const res2 = await executeCandidateSandboxed({
  candidateCode: passingCode,
  testCode: failingTest,
  timeoutMs: 2000
});
assert.strictEqual(res2.status, VERIFIER_STATUS.TEST_FAILURE);
assert.strictEqual(res2.passed, false);
assert(res2.diagnostic.includes('AssertionError') || res2.diagnostic.includes('99'));

// 3. Syntax Error in candidate
const syntaxErrorCode = `
export function add(a, b { return a + b; }
`;
const res3 = await executeCandidateSandboxed({
  candidateCode: syntaxErrorCode,
  testCode: passingTest,
  timeoutMs: 2000
});
assert.strictEqual(res3.status, VERIFIER_STATUS.SYNTAX_ERROR);
assert.strictEqual(res3.passed, false);

// 4. Timeout detection
const infiniteLoopCode = `
export function loop() {
  while(true) {}
}
`;
const timeoutTest = `
import { loop } from './candidate.js';
loop();
`;
const res4 = await executeCandidateSandboxed({
  candidateCode: infiniteLoopCode,
  testCode: timeoutTest,
  timeoutMs: 600
});
assert.strictEqual(res4.status, VERIFIER_STATUS.TIMEOUT);
assert.strictEqual(res4.passed, false);

// 5. verifyParallel Promise.allSettled verification
const parallelRes = await verifyParallel(`export const x = 10;`);
assert.strictEqual(parallelRes.status, VERIFIER_STATUS.PASS);
assert.strictEqual(parallelRes.isClean, true);

console.log('Verifier unit tests passed successfully!');
