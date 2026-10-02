import assert from 'node:assert';
import { TokenBucketLimiter } from './candidate.js';

const limiter = new TokenBucketLimiter(2, 10);
assert.strictEqual(limiter.tryConsume(1), true);
assert.strictEqual(limiter.tryConsume(1), true);
assert.strictEqual(limiter.tryConsume(1), false, 'Bucket exhausted');
