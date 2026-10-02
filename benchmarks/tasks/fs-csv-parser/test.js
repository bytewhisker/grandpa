import assert from 'node:assert';
import { parseCsvRow } from './candidate.js';

const simple = parseCsvRow('a,b,c');
assert.deepStrictEqual(simple, ['a', 'b', 'c']);

const quoted = parseCsvRow('1,"hello, world",3');
assert.deepStrictEqual(quoted, ['1', 'hello, world', '3']);
