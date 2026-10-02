import assert from 'node:assert';
import { preToolExecution } from '../hooks/grandpa-guard-hook.js';
import { getGrandpaInstructions } from '../hooks/grandpa-instructions.js';
import { setMode, getMode } from '../hooks/grandpa-mode-tracker.js';

console.log('Running Grandpa hooks unit tests...');

// 1. Guard hook catches bloat package install
const blocked = preToolExecution('run_command', { CommandLine: 'npm install axios' });
assert.strictEqual(blocked.allowed, false, 'Guard hook should block axios installation');
assert(blocked.message.includes('axios'), 'Message should reference axios');

// 2. Guard hook passes clean command
const allowed = preToolExecution('run_command', { CommandLine: 'npm test' });
assert.strictEqual(allowed.allowed, true, 'Guard hook should allow clean test commands');

// 3. Mode tracker
setMode('hardcore');
assert.strictEqual(getMode(), 'hardcore', 'Mode should update to hardcore');
const instr = getGrandpaInstructions();
assert(instr.includes('HARDCORE'), 'Instructions should reflect hardcore mode');

console.log('Hooks unit tests passed successfully!');
