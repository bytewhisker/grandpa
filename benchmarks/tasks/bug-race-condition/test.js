import assert from 'node:assert';
import { AsyncLock } from './candidate.js';

const lock = new AsyncLock();
let counter = 0;

const increment = async () => {
  await lock.runExclusive(async () => {
    const current = counter;
    await new Promise(r => setTimeout(r, 10));
    counter = current + 1;
  });
};

await Promise.all([increment(), increment(), increment()]);
assert.strictEqual(counter, 3, 'Counter must be exactly 3 without race condition lost updates');
