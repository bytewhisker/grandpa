import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeJsonAtomic } from './candidate.js';

const tmpFile = path.join(os.tmpdir(), `atomic-test-${Date.now()}.json`);
try {
  await writeJsonAtomic(tmpFile, { status: 'ready' });
  const read = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
  assert.deepStrictEqual(read, { status: 'ready' });
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
