import assert from 'node:assert';
import { postJson } from './candidate.js';

let capturedOpts = null;
globalThis.fetch = async (url, opts) => {
  capturedOpts = opts;
  return { ok: true, status: 201, json: async () => ({ id: '123' }) };
};

const result = await postJson('https://api.test/items', { name: 'Item 1' }, { headers: { 'X-Custom': 'yes' } });
assert.deepStrictEqual(result, { id: '123' });
assert.strictEqual(capturedOpts.method, 'POST');
assert.strictEqual(capturedOpts.headers['Content-Type'], 'application/json');
assert.strictEqual(capturedOpts.headers['X-Custom'], 'yes');
assert.strictEqual(capturedOpts.body, JSON.stringify({ name: 'Item 1' }));
assert(Boolean(capturedOpts.signal), 'Must include abort signal');
