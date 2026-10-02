import assert from 'node:assert';
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
