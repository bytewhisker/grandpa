import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('Running Grandpa rules verification test...');

const requiredRuleFiles = [
  '.cursor/rules/grandpa.mdc',
  '.windsurf/rules/grandpa.md',
  '.clinerules/grandpa.md',
  '.github/copilot-instructions.md',
  'AGENTS.md',
  'CLAUDE.md',
  'rules/grandpa.md'
];

for (const relPath of requiredRuleFiles) {
  const fullPath = path.resolve(process.cwd(), relPath);
  assert(fs.existsSync(fullPath), `Rule file must exist: ${relPath}`);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert(content.length > 50, `Rule file must not be empty: ${relPath}`);
}

console.log(`Verified all ${requiredRuleFiles.length} core rule files exist and are populated!`);
