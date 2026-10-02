import assert from 'node:assert';
import { deepMerge } from './candidate.js';

const target = { a: 1, b: { c: 2, d: 3 } };
const source = { b: { d: 4, e: 5 } };
const merged = deepMerge(target, source);

assert.deepStrictEqual(merged, { a: 1, b: { c: 2, d: 4, e: 5 } });
assert.strictEqual(target.b.d, 3, 'Original target must not be mutated');
