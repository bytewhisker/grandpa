import assert from 'node:assert';
import { validateSchema } from './candidate.js';

const schema = { name: 'string', age: 'number', tags: 'array' };
assert.strictEqual(validateSchema({ name: 'Alice', age: 30, tags: ['a'] }, schema).valid, true);

const invalid = validateSchema({ name: 'Bob', age: 'thirty' }, schema);
assert.strictEqual(invalid.valid, false);
assert(invalid.errors.length > 0);

// Null safety
assert.strictEqual(validateSchema(null, schema).valid, false);
assert.strictEqual(validateSchema(undefined, schema).valid, false);
