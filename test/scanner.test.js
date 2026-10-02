import assert from 'node:assert';
import path from 'node:path';
import { scanProject } from '../src/scanner.js';

console.log('Running Grandpa scanner unit tests...');

// 1. Scan our own codebase (should be clean!)
const result = scanProject(process.cwd());

assert.strictEqual(typeof result.score, 'number', 'Score must be a number');
assert(result.score >= 90, `Grandpa repository itself should score high, got ${result.score}`);
assert.strictEqual(Array.isArray(result.bloatFound), true, 'bloatFound should be an array');
assert.strictEqual(Array.isArray(result.fragileCodeFound), true, 'fragileCodeFound should be an array');

console.log(`Scanner test passed with codebase score: ${result.score}/100!`);
