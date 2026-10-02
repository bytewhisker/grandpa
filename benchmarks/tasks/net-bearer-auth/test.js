import assert from 'node:assert';
import { createAuthClient } from './candidate.js';

let token = 'token-1';
let refreshCount = 0;
let callCount = 0;

const client = createAuthClient({
  getAccessToken: () => token,
  refreshAccessToken: async () => {
    refreshCount++;
    token = 'token-2';
    return token;
  },
  fetchFn: async (url, opts) => {
    callCount++;
    const authHeader = opts.headers?.Authorization;
    if (authHeader === 'Bearer token-1') {
      return { ok: false, status: 401, statusText: 'Unauthorized' };
    }
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  }
});

const res = await client.request('https://api.test/data');
assert.strictEqual(refreshCount, 1);
assert.strictEqual(callCount, 2);
assert.strictEqual(res.status, 200);
