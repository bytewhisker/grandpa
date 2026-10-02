#!/usr/bin/env node
/**
 * Grandpa Benchmark 25-Task Generator
 * Generates tasks compliant with Parts 13, 15:
 * - 5 Networking
 * - 4 TypeScript
 * - 4 Node.js
 * - 3 Frontend/React
 * - 3 Bug Fixing
 * - 2 Security
 * - 2 Refactoring
 * - 2 Data/Filesystem
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_DIR = path.join(__dirname, 'tasks');

const TASK_DEFINITIONS = [
  // ─── 1. NETWORKING (5 tasks) ────────────────────────────────────────────────
  {
    id: 'net-fetch-timeout',
    category: 'networking',
    difficulty: 'easy',
    title: 'Fetch JSON with Timeout and Status Check',
    prompt: `Write an exported function \`fetchJson(url, options = {})\` that:
1. Performs an HTTP GET to \`url\` using native \`fetch\`.
2. Supports a \`timeoutMs\` option (default: 5000) using \`AbortSignal.timeout\`.
3. Validates \`res.ok\`. If status is not 2xx, throws an Error with the HTTP status.
4. Returns the parsed JSON data.`,
    starter: `export async function fetchJson(url, options = {}) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
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
`,
    expectedBehavior: ['HTTP 200 success', 'Reject on HTTP non-2xx', 'Pass AbortSignal for timeouts']
  },

  {
    id: 'net-post-json',
    category: 'networking',
    difficulty: 'easy',
    title: 'HTTP POST with JSON Body and Headers',
    prompt: `Write an exported function \`postJson(url, body, options = {})\` that:
1. Sends a POST request with JSON-serialized \`body\`.
2. Sets 'Content-Type': 'application/json' in headers (merging any custom headers).
3. Supports a \`timeoutMs\` option (default: 5000).
4. Asserts \`res.ok\` and returns parsed response JSON.`,
    starter: `export async function postJson(url, body, options = {}) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
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
`,
    expectedBehavior: ['POST method', 'JSON Content-Type', 'Merge headers', 'AbortSignal']
  },

  {
    id: 'net-retry-backoff',
    category: 'networking',
    difficulty: 'medium',
    title: 'Fetch with Exponential Backoff Retry',
    prompt: `Write an exported function \`fetchWithRetry(fn, { maxRetries = 3, baseDelayMs = 50 } = {})\` that:
1. Calls async function \`fn()\`.
2. If \`fn()\` resolves, returns the result immediately.
3. If \`fn()\` rejects, waits \`baseDelayMs * 2^(attempt - 1)\` and retries up to \`maxRetries\` times.
4. If retries are exhausted, throws the last error.`,
    starter: `export async function fetchWithRetry(fn, options = {}) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { fetchWithRetry } from './candidate.js';

let attempts = 0;
const succeedOnThird = async () => {
  attempts++;
  if (attempts < 3) throw new Error('Transient error');
  return 'success';
};

const res = await fetchWithRetry(succeedOnThird, { maxRetries: 3, baseDelayMs: 10 });
assert.strictEqual(res, 'success');
assert.strictEqual(attempts, 3);

// Exhaust retries
const alwaysFail = async () => { throw new Error('Permanent failure'); };
await assert.rejects(
  () => fetchWithRetry(alwaysFail, { maxRetries: 2, baseDelayMs: 10 }),
  /Permanent failure/
);
`,
    expectedBehavior: ['Resolve on success', 'Exponential retry delay', 'Throw on exhausted retries']
  },

  {
    id: 'net-stream-download',
    category: 'networking',
    difficulty: 'medium',
    title: 'Consume ReadableStream to Buffer/String',
    prompt: `Write an exported function \`consumeStream(readableStream, encoding = 'utf-8')\` that:
1. Reads all chunks from a \`ReadableStream\` using a reader.
2. Concatenates string or Uint8Array chunks.
3. Returns the complete accumulated string.
4. Cleans up reader on error or completion.`,
    starter: `export async function consumeStream(stream, encoding = 'utf-8') {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { consumeStream } from './candidate.js';

// Create a mock stream with 3 chunks
const chunks = ['Hello', ' ', 'World!'];
const stream = new ReadableStream({
  start(controller) {
    for (const c of chunks) {
      controller.enqueue(new TextEncoder().encode(c));
    }
    controller.close();
  }
});

const result = await consumeStream(stream);
assert.strictEqual(result, 'Hello World!');
`,
    expectedBehavior: ['Reads all stream chunks', 'Text decoding', 'Proper reader release']
  },

  {
    id: 'net-bearer-auth',
    category: 'networking',
    difficulty: 'hard',
    title: 'API Client with 401 Token Refresh',
    prompt: `Write an exported function \`createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch })\` returning an object with:
\`request(url, options = {})\`:
1. Attaches 'Authorization: Bearer <token>' from \`getAccessToken()\`.
2. Sends the request.
3. If response status is 401, calls \`refreshAccessToken()\` exactly once, updates header with new token, and retries the request.
4. If retry also returns 401, returns response or throws error without infinite loop.`,
    starter: `export function createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch }) {
  return {
    async request(url, options = {}) {
      // TODO: implement
    }
  };
}`,
    test: `import assert from 'node:assert';
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
`,
    expectedBehavior: ['Bearer header attach', 'Automatic 401 token refresh', 'Single retry attempt']
  },

  // ─── 2. TYPESCRIPT (4 tasks) ────────────────────────────────────────────────
  {
    id: 'ts-result-container',
    category: 'typescript',
    difficulty: 'easy',
    title: 'Type-Safe Result<T, E> Pattern',
    prompt: `Write exported helper functions for Result type handling:
- \`Ok(value)\`: returns \`{ ok: true, value }\`
- \`Err(error)\`: returns \`{ ok: false, error }\`
- \`isOk(result)\`: type guard returning \`result.ok === true\`
- \`unwrapOr(result, fallback)\`: returns value if Ok, else fallback.`,
    starter: `export function Ok(value) { /* TODO */ }
export function Err(error) { /* TODO */ }
export function isOk(result) { /* TODO */ }
export function unwrapOr(result, fallback) { /* TODO */ }`,
    test: `import assert from 'node:assert';
import { Ok, Err, isOk, unwrapOr } from './candidate.js';

const s = Ok(42);
const f = Err('Invalid input');

assert.strictEqual(isOk(s), true);
assert.strictEqual(isOk(f), false);
assert.strictEqual(unwrapOr(s, 0), 42);
assert.strictEqual(unwrapOr(f, 0), 0);
`,
    expectedBehavior: ['Ok container', 'Err container', 'isOk guard', 'unwrapOr default']
  },

  {
    id: 'ts-deep-partial',
    category: 'typescript',
    difficulty: 'medium',
    title: 'Deep Object Merger Utility',
    prompt: `Write an exported function \`deepMerge(target, source)\` that:
1. Recursively merges properties of \`source\` into a clone of \`target\`.
2. Preserves unchanged nested objects.
3. Overwrites primitives.
4. Returns a new object without mutating input objects.`,
    starter: `export function deepMerge(target, source) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { deepMerge } from './candidate.js';

const target = { a: 1, b: { c: 2, d: 3 } };
const source = { b: { d: 4, e: 5 } };
const merged = deepMerge(target, source);

assert.deepStrictEqual(merged, { a: 1, b: { c: 2, d: 4, e: 5 } });
assert.strictEqual(target.b.d, 3, 'Original target must not be mutated');
`,
    expectedBehavior: ['Recursive merge', 'No input mutation', 'Nested preservation']
  },

  {
    id: 'ts-typed-emitter',
    category: 'typescript',
    difficulty: 'medium',
    title: 'Type-Safe Event Emitter',
    prompt: `Write an exported class \`TypedEventEmitter\` that implements:
- \`on(event, handler)\`: registers listener, returns unsubscribe function.
- \`emit(event, payload)\`: calls all registered listeners with payload.
- \`off(event, handler)\`: unregisters handler.`,
    starter: `export class TypedEventEmitter {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { TypedEventEmitter } from './candidate.js';

const ee = new TypedEventEmitter();
let received = null;
const unsubscribe = ee.on('userLogin', (data) => { received = data; });

ee.emit('userLogin', { id: 101 });
assert.deepStrictEqual(received, { id: 101 });

unsubscribe();
ee.emit('userLogin', { id: 999 });
assert.deepStrictEqual(received, { id: 101 }, 'Unsubscribed listener must not be called');
`,
    expectedBehavior: ['Listener registration', 'Payload broadcast', 'Clean unsubscription']
  },

  {
    id: 'ts-schema-validator',
    category: 'typescript',
    difficulty: 'hard',
    title: 'Lightweight Schema Validator Guard',
    prompt: `Write an exported function \`validateSchema(data, schema)\` that:
- \`schema\` is an object where keys are field names and values are type strings ('string', 'number', 'boolean', 'array').
- Returns \`{ valid: true, errors: [] }\` if all fields match.
- If invalid or missing, returns \`{ valid: false, errors: ['Field <name> is missing or not a <type>'] }\`.
- Handles null/undefined data safely.`,
    starter: `export function validateSchema(data, schema) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { validateSchema } from './candidate.js';

const schema = { name: 'string', age: 'number', tags: 'array' };
assert.strictEqual(validateSchema({ name: 'Alice', age: 30, tags: ['a'] }, schema).valid, true);

const invalid = validateSchema({ name: 'Bob', age: 'thirty' }, schema);
assert.strictEqual(invalid.valid, false);
assert(invalid.errors.length > 0);

// Null safety
assert.strictEqual(validateSchema(null, schema).valid, false);
assert.strictEqual(validateSchema(undefined, schema).valid, false);
`,
    expectedBehavior: ['Type checking', 'Array validation', 'Null/undefined guard', 'Error listing']
  },

  // ─── 3. NODE.JS (4 tasks) ──────────────────────────────────────────────────
  {
    id: 'node-safe-exec',
    category: 'nodejs',
    difficulty: 'easy',
    title: 'Safe Command Execution with Timeout',
    prompt: `Write an exported function \`executeCommand(cmd, args = [], options = {})\` that:
1. Spawns child process using \`child_process.spawn\`.
2. Supports \`timeoutMs\` (default: 5000), killing the process if exceeded.
3. Caps stdout/stderr to \`maxBuffer\` (default: 64KB) to avoid memory explosion.
4. Returns Promise resolving with \`{ code, stdout, stderr, timedOut }\`.`,
    starter: `export async function executeCommand(cmd, args = [], options = {}) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { executeCommand } from './candidate.js';

const res = await executeCommand(process.execPath, ['-e', 'console.log("hello node")']);
assert.strictEqual(res.code, 0);
assert.strictEqual(res.stdout.trim(), 'hello node');
assert.strictEqual(res.timedOut, false);
`,
    expectedBehavior: ['Child process spawn', 'Stdout capture', 'Timeout handling']
  },

  {
    id: 'node-atomic-file',
    category: 'nodejs',
    difficulty: 'medium',
    title: 'Atomic JSON File Writer',
    prompt: `Write an exported function \`writeJsonAtomic(filePath, data)\` that:
1. Serializes \`data\` to JSON.
2. Writes to a temporary file in the same directory (e.g. \`\${filePath}.tmp.\${Date.now()}\`).
3. Renames the temporary file to \`filePath\` using \`fs.promises.rename\` (guaranteeing atomic POSIX/Windows write).
4. Cleans up temp file on failure.`,
    starter: `export async function writeJsonAtomic(filePath, data) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeJsonAtomic } from './candidate.js';

const tmpFile = path.join(os.tmpdir(), \`atomic-test-\${Date.now()}.json\`);
try {
  await writeJsonAtomic(tmpFile, { status: 'ready' });
  const read = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
  assert.deepStrictEqual(read, { status: 'ready' });
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
`,
    expectedBehavior: ['Atomic rename', 'JSON formatting', 'Cleanup on error']
  },

  {
    id: 'node-env-parser',
    category: 'nodejs',
    difficulty: 'easy',
    title: 'Type-Coercing Environment Config Loader',
    prompt: `Write an exported function \`loadEnvConfig(envObj, schema)\` that:
- \`schema\` specifies keys with \`{ type: 'string' | 'number' | 'boolean', required?: boolean, default?: any }\`.
- Throws Error listing missing required variables.
- Coerces strings: 'true'/'false' to boolean, numeric strings to number.
- Applies defaults for missing optional variables.`,
    starter: `export function loadEnvConfig(envObj, schema) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { loadEnvConfig } from './candidate.js';

const schema = {
  PORT: { type: 'number', default: 3000 },
  DEBUG: { type: 'boolean', default: false },
  API_KEY: { type: 'string', required: true }
};

const config = loadEnvConfig({ API_KEY: 'secret123', PORT: '8080', DEBUG: 'true' }, schema);
assert.strictEqual(config.PORT, 8080);
assert.strictEqual(config.DEBUG, true);
assert.strictEqual(config.API_KEY, 'secret123');

// Missing required throws
assert.throws(() => loadEnvConfig({}, schema), /API_KEY/);
`,
    expectedBehavior: ['Type coercion', 'Default fallback', 'Required validation']
  },

  {
    id: 'node-rate-limiter',
    category: 'nodejs',
    difficulty: 'hard',
    title: 'Sliding Window Token Bucket Rate Limiter',
    prompt: `Write an exported class \`TokenBucketLimiter\` with:
- \`constructor(capacity, refillRatePerSec)\`
- \`tryConsume(tokens = 1)\`: returns \`true\` if tokens were deducted, else \`false\`.
- Refills tokens continuously based on elapsed time without background timers.`,
    starter: `export class TokenBucketLimiter {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { TokenBucketLimiter } from './candidate.js';

const limiter = new TokenBucketLimiter(2, 10);
assert.strictEqual(limiter.tryConsume(1), true);
assert.strictEqual(limiter.tryConsume(1), true);
assert.strictEqual(limiter.tryConsume(1), false, 'Bucket exhausted');
`,
    expectedBehavior: ['Token consumption', 'Capacity ceiling', 'Continuous refill']
  },

  // ─── 4. FRONTEND / REACT (3 tasks) ──────────────────────────────────────────
  {
    id: 'react-debounce-hook',
    category: 'frontend',
    difficulty: 'easy',
    title: 'Debounce Function with Cancel & Flush',
    prompt: `Write an exported function \`debounce(fn, waitMs)\` that:
1. Returns a debounced function delaying execution.
2. Exposes \`.cancel()\` to abort pending invocation.
3. Exposes \`.flush()\` to invoke immediately if pending.`,
    starter: `export function debounce(fn, waitMs) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { debounce } from './candidate.js';

let count = 0;
const increment = () => { count++; };
const debounced = debounce(increment, 50);

debounced();
debounced();
debounced();
assert.strictEqual(count, 0);

debounced.flush();
assert.strictEqual(count, 1, 'Flush must trigger pending execution');
`,
    expectedBehavior: ['Delayed execution', 'Cancel support', 'Flush support']
  },

  {
    id: 'react-previous-hook',
    category: 'frontend',
    difficulty: 'easy',
    title: 'Previous Value Tracker',
    prompt: `Write an exported function \`createPreviousTracker()\` that returns an object with:
- \`update(value)\`: records new value and returns the PREVIOUS value (returns \`undefined\` on first call).
- \`getPrevious()\`: returns last observed previous value.`,
    starter: `export function createPreviousTracker() {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { createPreviousTracker } from './candidate.js';

const tracker = createPreviousTracker();
assert.strictEqual(tracker.update(10), undefined);
assert.strictEqual(tracker.update(20), 10);
assert.strictEqual(tracker.getPrevious(), 10);
assert.strictEqual(tracker.update(30), 20);
`,
    expectedBehavior: ['Initial undefined', 'Returns previous on update', 'getPrevious access']
  },

  {
    id: 'react-dialog-trap',
    category: 'frontend',
    difficulty: 'medium',
    title: 'Modal Dialog State & Escape Key Controller',
    prompt: `Write an exported function \`createDialogController(initialOpen = false)\` that returns:
- \`isOpen()\`: returns boolean.
- \`open()\`: opens dialog.
- \`close()\`: closes dialog.
- \`handleKeyDown(event)\`: closes dialog if \`event.key === 'Escape'\` and dialog is open.`,
    starter: `export function createDialogController(initialOpen = false) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { createDialogController } from './candidate.js';

const ctrl = createDialogController();
assert.strictEqual(ctrl.isOpen(), false);
ctrl.open();
assert.strictEqual(ctrl.isOpen(), true);

ctrl.handleKeyDown({ key: 'Escape' });
assert.strictEqual(ctrl.isOpen(), false, 'Escape key must close dialog');
`,
    expectedBehavior: ['Open/close state', 'Escape key close', 'No-op on other keys']
  },

  // ─── 5. BUG FIXING (3 tasks) ───────────────────────────────────────────────
  {
    id: 'bug-race-condition',
    category: 'bugfixing',
    difficulty: 'medium',
    title: 'Async Lock / Mutex for Race Conditions',
    prompt: `Write an exported class \`AsyncLock\` that provides:
- \`acquire()\`: returns Promise resolving to release function.
- \`runExclusive(fn)\`: executes async \`fn\` under mutual exclusion, ensuring sequential execution without interleaved concurrency.`,
    starter: `export class AsyncLock {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { AsyncLock } from './candidate.js';

const lock = new AsyncLock();
let counter = 0;

const increment = async () => {
  await lock.runExclusive(async () => {
    const current = counter;
    await new Promise(r => setTimeout(r, 10));
    counter = current + 1;
  });
};

await Promise.all([increment(), increment(), increment()]);
assert.strictEqual(counter, 3, 'Counter must be exactly 3 without race condition lost updates');
`,
    expectedBehavior: ['Mutual exclusion', 'Sequential queueing', 'Guaranteed lock release']
  },

  {
    id: 'bug-event-leak',
    category: 'bugfixing',
    difficulty: 'easy',
    title: 'Pub-Sub Hub with Leak-Proof Disposer',
    prompt: `Write an exported class \`SubscriptionHub\` that provides:
- \`subscribe(topic, handler)\`: returns disposer object with \`dispose()\`.
- \`publish(topic, data)\`: sends data to active handlers.
- \`getListenerCount(topic)\`: returns count of active listeners. Calling \`dispose()\` must decrement count and prevent listener leaks.`,
    starter: `export class SubscriptionHub {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { SubscriptionHub } from './candidate.js';

const hub = new SubscriptionHub();
const sub1 = hub.subscribe('news', () => {});
const sub2 = hub.subscribe('news', () => {});
assert.strictEqual(hub.getListenerCount('news'), 2);

sub1.dispose();
assert.strictEqual(hub.getListenerCount('news'), 1);
sub2.dispose();
assert.strictEqual(hub.getListenerCount('news'), 0);
`,
    expectedBehavior: ['Listener counting', 'Clean disposal', 'Zero leaks on dispose']
  },

  {
    id: 'bug-pagination-bounds',
    category: 'bugfixing',
    difficulty: 'easy',
    title: 'Defensive Pagination Bounds Calculation',
    prompt: `Write an exported function \`paginate({ totalItems, pageSize, currentPage })\` that:
- Calculates \`{ totalPages, offset, limit, hasPrev, hasNext, validPage }\`.
- Handles edge cases: totalItems <= 0 returns 1 totalPage and offset 0.
- Clamps currentPage between 1 and totalPages.
- Never returns negative offset.`,
    starter: `export function paginate(options) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
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
`,
    expectedBehavior: ['Offset clamping', '0 items handling', 'Page boundary normalization']
  },

  // ─── 6. SECURITY & VALIDATION (2 tasks) ────────────────────────────────────
  {
    id: 'sec-redirect-sanitizer',
    category: 'security',
    difficulty: 'medium',
    title: 'Open Redirect Attack Sanitizer',
    prompt: `Write an exported function \`sanitizeRedirectUrl(targetUrl, allowedHosts = ['example.com'])\` that:
1. Validates that URL is either relative path (e.g. \`/dashboard\`) or matches \`allowedHosts\`.
2. Blocks protocol-relative URLs (\`//evil.com\`).
3. Blocks \`javascript:\` and \`data:\` URI schemes.
4. Returns sanitized URL string, or fallback path \`'/'\` if target is malicious/invalid.`,
    starter: `export function sanitizeRedirectUrl(targetUrl, allowedHosts = ['example.com']) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { sanitizeRedirectUrl } from './candidate.js';

// Safe relative
assert.strictEqual(sanitizeRedirectUrl('/dashboard'), '/dashboard');

// Safe allowed host
assert.strictEqual(sanitizeRedirectUrl('https://example.com/welcome'), 'https://example.com/welcome');

// Attack vectors
assert.strictEqual(sanitizeRedirectUrl('//attacker.com'), '/');
assert.strictEqual(sanitizeRedirectUrl('javascript:alert(1)'), '/');
assert.strictEqual(sanitizeRedirectUrl('data:text/html,evil'), '/');
assert.strictEqual(sanitizeRedirectUrl('https://evil.com/phish'), '/');
`,
    expectedBehavior: ['Allow safe paths', 'Block protocol-relative', 'Block javascript URI', 'Enforce host whitelist']
  },

  {
    id: 'sec-timing-safe-eq',
    category: 'security',
    difficulty: 'hard',
    title: 'Constant-Time String Comparison',
    prompt: `Write an exported function \`timingSafeEqual(strA, strB)\` that:
1. Returns \`true\` if strings are identical, else \`false\`.
2. Compares bytes in constant time using \`crypto.timingSafeEqual\` to prevent side-channel timing attacks.
3. Handles unequal string lengths safely without throwing or leaking timing info.`,
    starter: `export function timingSafeEqual(strA, strB) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { timingSafeEqual } from './candidate.js';

assert.strictEqual(timingSafeEqual('secret_token_123', 'secret_token_123'), true);
assert.strictEqual(timingSafeEqual('secret_token_123', 'secret_token_456'), false);
assert.strictEqual(timingSafeEqual('short', 'much_longer_string'), false);
`,
    expectedBehavior: ['Equality match', 'Mismatch detection', 'Different length safety', 'Native crypto']
  },

  // ─── 7. REFACTORING (2 tasks) ──────────────────────────────────────────────
  {
    id: 'refactor-date-formatter',
    category: 'refactoring',
    difficulty: 'easy',
    title: 'Native Intl Date Formatter (Drop Moment/Dayjs)',
    prompt: `Write an exported function \`formatIsoDate(dateInput, locale = 'en-US')\` that:
1. Accepts Date, timestamp number, or ISO string.
2. Uses native \`Intl.DateTimeFormat\` to format date as 'YYYY-MM-DD'.
3. Returns null for invalid date inputs.`,
    starter: `export function formatIsoDate(dateInput, locale = 'en-US') {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { formatIsoDate } from './candidate.js';

const res = formatIsoDate(new Date('2026-05-15T00:00:00Z'));
assert.strictEqual(res, '2026-05-15');

assert.strictEqual(formatIsoDate('invalid-date-string'), null);
assert.strictEqual(formatIsoDate(null), null);
`,
    expectedBehavior: ['Intl formatting', 'YYYY-MM-DD output', 'Null on invalid input']
  },

  {
    id: 'refactor-promise-pipeline',
    category: 'refactoring',
    difficulty: 'medium',
    title: 'Transform Callback / Promise Hell to Async Pipeline',
    prompt: `Write an exported function \`processPipeline(initialValue, steps = [])\` that:
1. Runs sequential async operations \`steps = [async (val) => nextVal, ...]\`.
2. Passes accumulated value from each step to the next.
3. If any step fails, catches the error and returns \`{ success: false, error: err.message, stepIndex }\`.
4. Returns \`{ success: true, value: finalValue }\` on completion.`,
    starter: `export async function processPipeline(initialValue, steps = []) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { processPipeline } from './candidate.js';

const steps = [
  async (v) => v + 1,
  async (v) => v * 2,
  async (v) => v - 3
];

const res1 = await processPipeline(5, steps);
assert.deepStrictEqual(res1, { success: true, value: 9 });

const failingSteps = [
  async (v) => v + 1,
  async () => { throw new Error('Step 2 boom'); }
];
const res2 = await processPipeline(5, failingSteps);
assert.strictEqual(res2.success, false);
assert.strictEqual(res2.stepIndex, 1);
assert.strictEqual(res2.error, 'Step 2 boom');
`,
    expectedBehavior: ['Sequential execution', 'Value pipe', 'Structured error capture']
  },

  // ─── 8. DATA & FILESYSTEM (2 tasks) ────────────────────────────────────────
  {
    id: 'fs-csv-parser',
    category: 'data_filesystem',
    difficulty: 'medium',
    title: 'Zero-Dependency Quoted CSV Row Parser',
    prompt: `Write an exported function \`parseCsvRow(rowString)\` that:
1. Parses a single CSV line into an array of string values.
2. Handles comma delimiters outside quotes.
3. Correctly handles values enclosed in double quotes containing commas (\`"hello, world"\`).
4. Handles escaped quotes (\`"say \\"hello\\""\` or \`"say ""hello"""\`).`,
    starter: `export function parseCsvRow(rowString) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import { parseCsvRow } from './candidate.js';

const simple = parseCsvRow('a,b,c');
assert.deepStrictEqual(simple, ['a', 'b', 'c']);

const quoted = parseCsvRow('1,"hello, world",3');
assert.deepStrictEqual(quoted, ['1', 'hello, world', '3']);
`,
    expectedBehavior: ['Basic comma split', 'Quoted field support', 'Escaped quote support']
  },

  {
    id: 'fs-walk-dir',
    category: 'data_filesystem',
    difficulty: 'hard',
    title: 'Recursive Directory File Collector with Depth Guard',
    prompt: `Write an exported function \`walkDir(dirPath, { maxDepth = 3, extension = null } = {})\` that:
1. Recursively traverses files using \`fs.promises.readdir\` with \`withFileTypes: true\`.
2. Respects \`maxDepth\` limit.
3. Filters files by \`extension\` (e.g. \`.js\`) if provided.
4. Returns Array of relative paths.`,
    starter: `export async function walkDir(dirPath, options = {}) {
  // TODO: implement
}`,
    test: `import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { walkDir } from './candidate.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'walk-test-'));
try {
  fs.writeFileSync(path.join(tmp, 'root.js'), '// root');
  fs.mkdirSync(path.join(tmp, 'sub'));
  fs.writeFileSync(path.join(tmp, 'sub', 'nested.js'), '// nested');
  fs.writeFileSync(path.join(tmp, 'sub', 'ignore.txt'), '// txt');

  const jsFiles = await walkDir(tmp, { maxDepth: 2, extension: '.js' });
  assert.strictEqual(jsFiles.length, 2);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
`,
    expectedBehavior: ['Recursive directory read', 'Extension filtering', 'Depth limitation']
  }
];

export function generateAllTasks() {
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
  }

  for (const def of TASK_DEFINITIONS) {
    const taskDir = path.join(TASKS_DIR, def.id);
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    // 1. metadata.json
    const metadata = {
      id: def.id,
      title: def.title,
      category: def.category,
      difficulty: def.difficulty,
      runtime: 'node >= 18.0.0',
      expectedBehavior: def.expectedBehavior,
      maxAttempts: 3
    };
    fs.writeFileSync(path.join(taskDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');

    // 2. prompt.md
    fs.writeFileSync(path.join(taskDir, 'prompt.md'), `# ${def.title}\n\n${def.prompt}\n`, 'utf-8');

    // 3. starter.js
    fs.writeFileSync(path.join(taskDir, 'starter.js'), def.starter, 'utf-8');

    // 4. test.js
    fs.writeFileSync(path.join(taskDir, 'test.js'), def.test, 'utf-8');
  }

  console.log(`Generated ${TASK_DEFINITIONS.length} benchmark tasks under ${TASKS_DIR}`);
}

generateAllTasks();
