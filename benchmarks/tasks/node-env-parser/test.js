import assert from 'node:assert';
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
