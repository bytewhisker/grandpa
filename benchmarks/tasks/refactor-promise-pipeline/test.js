import assert from 'node:assert';
import { processPipeline } from './candidate.js';

const steps = [
  async (v) => v + 1,
  async (v) => v * 2,
  async (v) => v - 3
];

const res1 = await processPipeline(5, steps);
assert.deepStrictEqual(res1, { success: true, value: 9 });

const failingSteps = [
  async (v) => v + 1,
  async () => { throw new Error('Step 2 boom'); }
];
const res2 = await processPipeline(5, failingSteps);
assert.strictEqual(res2.success, false);
assert.strictEqual(res2.stepIndex, 1);
assert.strictEqual(res2.error, 'Step 2 boom');
