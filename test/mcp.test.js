import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running Grandpa MCP Server Unit Tests...');

const serverScript = path.resolve(__dirname, '../grandpa-mcp/index.js');
const child = spawn(process.execPath, [serverScript], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';
const responses = [];

function checkDone() {
  if (responses.length >= 3) {
    clearTimeout(safetyTimeout);
    child.kill();

    const initRes = responses[0];
    assert.strictEqual(initRes.id, 1);
    assert.strictEqual(initRes.result?.serverInfo?.name, 'grandpa-mcp');

    const toolsRes = responses[1];
    assert.strictEqual(toolsRes.id, 2);
    assert(Array.isArray(toolsRes.result?.tools));
    assert.strictEqual(toolsRes.result?.tools?.length, 5);

    const callRes = responses[2];
    assert.strictEqual(callRes.id, 3);
    assert(callRes.result?.content?.[0]?.text?.includes('Native Replacement: fetch'));

    console.log('Grandpa MCP server passed all JSON-RPC verification checks successfully!');
    process.exit(0);
  }
}

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      try {
        responses.push(JSON.parse(trimmed));
        checkDone();
      } catch {}
    }
  }
});

const safetyTimeout = setTimeout(() => {
  child.kill();
  assert.fail(`Timed out waiting for MCP responses. Received ${responses.length}/3 responses.`);
}, 3000);

function sendRpc(msg) {
  child.stdin.write(JSON.stringify(msg) + '\n');
}

// 1. Initialize
sendRpc({ jsonrpc: '2.0', id: 1, method: 'initialize' });

// 2. List tools
sendRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });

// 3. Call tool: grandpa_migrate
sendRpc({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'grandpa_migrate',
    arguments: { package: 'axios' }
  }
});

