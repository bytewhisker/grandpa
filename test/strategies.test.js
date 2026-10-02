import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateInitialCandidate, generateRepairCandidate } from '../benchmarks/strategies.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(__dirname, '..', 'benchmarks', 'tasks');
const taskFolders = fs.readdirSync(tasksDir).filter(f => fs.statSync(path.join(tasksDir, f)).isDirectory());

console.log(`Checking strategies against ${taskFolders.length} tasks...`);
assert.strictEqual(taskFolders.length, 25, 'Must have exactly 25 tasks');

const strategies = ['bare', 'ponytail', 'caveman', 'grandpa'];

for (const taskId of taskFolders) {
  const metadata = JSON.parse(fs.readFileSync(path.join(tasksDir, taskId, 'metadata.json'), 'utf-8'));
  const prompt = fs.readFileSync(path.join(tasksDir, taskId, 'prompt.md'), 'utf-8');
  const taskObj = { id: taskId, prompt, metadata };

  for (const strat of strategies) {
    const candidate = generateInitialCandidate(strat, taskObj);
    assert(candidate.code && candidate.code.length > 0, `Missing code for ${taskId} under ${strat}`);
    assert(candidate.inputTokens > 0);
    assert(candidate.outputTokens > 0);
  }
}

// Check repair generator
const repair = generateRepairCandidate('ponytail', { id: 'net-fetch-timeout', prompt: 'test' }, 'dummy code', 'missing signal', 2);
assert(repair.code.includes('AbortSignal'));
assert(repair.repairInputTokens > 0);
assert(repair.repairOutputTokens > 0);

console.log('All 25 tasks verified across all 4 strategies!');
