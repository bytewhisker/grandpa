import assert from 'node:assert';
import { Ok, Err, isOk, unwrapOr } from './candidate.js';

const s = Ok(42);
const f = Err('Invalid input');

assert.strictEqual(isOk(s), true);
assert.strictEqual(isOk(f), false);
assert.strictEqual(unwrapOr(s, 0), 42);
assert.strictEqual(unwrapOr(f, 0), 0);
