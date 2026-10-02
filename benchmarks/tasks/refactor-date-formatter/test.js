import assert from 'node:assert';
import { formatIsoDate } from './candidate.js';

const res = formatIsoDate(new Date('2026-05-15T00:00:00Z'));
assert.strictEqual(res, '2026-05-15');

assert.strictEqual(formatIsoDate('invalid-date-string'), null);
assert.strictEqual(formatIsoDate(null), null);
