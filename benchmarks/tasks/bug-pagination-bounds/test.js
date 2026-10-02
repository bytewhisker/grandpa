import assert from 'node:assert';
import { paginate } from './candidate.js';

// Normal
const p1 = paginate({ totalItems: 95, pageSize: 10, currentPage: 2 });
assert.strictEqual(p1.totalPages, 10);
assert.strictEqual(p1.offset, 10);
assert.strictEqual(p1.validPage, 2);

// Edge: 0 items
const p2 = paginate({ totalItems: 0, pageSize: 10, currentPage: 1 });
assert.strictEqual(p2.totalPages, 1);
assert.strictEqual(p2.offset, 0);

// Edge: currentPage out of bounds clamped
const p3 = paginate({ totalItems: 20, pageSize: 10, currentPage: 99 });
assert.strictEqual(p3.validPage, 2);
