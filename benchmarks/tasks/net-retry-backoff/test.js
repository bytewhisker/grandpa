import assert from 'node:assert';
import { fetchWithRetry } from './candidate.js';

let attempts = 0;
const succeedOnThird = async () => {
  attempts++;
  if (attempts < 3) throw new Error('Transient error');
  return 'success';
};

const res = await fetchWithRetry(succeedOnThird, { maxRetries: 3, baseDelayMs: 10 });
assert.strictEqual(res, 'success');
assert.strictEqual(attempts, 3);

// Exhaust retries
const alwaysFail = async () => { throw new Error('Permanent failure'); };
await assert.rejects(
  () => fetchWithRetry(alwaysFail, { maxRetries: 2, baseDelayMs: 10 }),
  /Permanent failure/
);
