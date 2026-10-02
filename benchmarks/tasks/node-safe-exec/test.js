import assert from 'node:assert';
import { executeCommand } from './candidate.js';

const res = await executeCommand(process.execPath, ['-e', 'console.log("hello node")']);
assert.strictEqual(res.code, 0);
assert.strictEqual(res.stdout.trim(), 'hello node');
assert.strictEqual(res.timedOut, false);
