import assert from 'node:assert';
import { fetchJson } from './candidate.js';

// Case 1: 200 Success
globalThis.fetch = async (url, opts) => ({
  ok: true,
  status: 200,
  json: async () => ({ hello: 'world' })
});
const data = await fetchJson('https://api.test/ok');
assert.deepStrictEqual(data, { hello: 'world' });

// Case 2: 500 HTML body
globalThis.fetch = async (url, opts) => ({
  ok: false,
  status: 500,
  statusText: 'Server Error',
  json: async () => { throw new SyntaxError("Unexpected token '<'"); },
  text: async () => '<html>Error</html>'
});
await assert.rejects(
  async () => await fetchJson('https://api.test/error'),
  (err) => err.message.includes('500') || !err.message.includes('Unexpected token')
);

// Case 3: Stalled network without signal
let receivedSignal = false;
globalThis.fetch = async (url, opts) => {
  receivedSignal = Boolean(opts?.signal);
  return { ok: true, status: 200, json: async () => ({}) };
};
await fetchJson('https://api.test/timeout', { timeoutMs: 1000 });
assert.strictEqual(receivedSignal, true, 'fetch must receive an AbortSignal');
