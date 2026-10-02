import assert from 'node:assert';
import { timingSafeEqual } from './candidate.js';

assert.strictEqual(timingSafeEqual('secret_token_123', 'secret_token_123'), true);
assert.strictEqual(timingSafeEqual('secret_token_123', 'secret_token_456'), false);
assert.strictEqual(timingSafeEqual('short', 'much_longer_string'), false);
