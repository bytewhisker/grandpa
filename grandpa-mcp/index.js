#!/usr/bin/env node

/**
 * Grandpa MCP Server
 * Zero-dependency Model Context Protocol (MCP) server running on standard I/O.
 * Exposes Grandpa architecture scanning, auditing, guarding, and migration tools to AI agents.
 */

const readline = require('node:readline');
const { GOLDEN_REPLACEMENTS, getSystemInstructions } = require('./instructions.js');
const { scanProject } = require('../src/scanner.js');

const TOOLS = [
  {
    name: 'grandpa_scan',
    description: 'Scans the current codebase for dependency bloat, fragile patterns, and missing native replacements.',
    inputSchema: {
      type: 'object',
      properties: {
        dir: { type: 'string', description: 'Directory path to scan (defaults to current working directory)' }
      }
    }
  },
  {
    name: 'grandpa_audit',
    description: 'Generates a scored architectural audit (A+ to F) with estimated bundle and dependency savings.',
    inputSchema: {
      type: 'object',
      properties: {
        dir: { type: 'string', description: 'Directory path to audit' }
      }
    }
  },
  {
    name: 'grandpa_guard',
    description: 'Inspects a code snippet or proposed command for fragile patterns or banned bloated dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code snippet to inspect' },
        command: { type: 'string', description: 'Shell command to inspect' }
      }
    }
  },
  {
    name: 'grandpa_migrate',
    description: 'Returns standard library replacement code and guidance for a given bloated library (e.g. axios, moment, lodash, uuid).',
    inputSchema: {
      type: 'object',
      properties: {
        package: { type: 'string', description: 'Name of the package to replace' }
      },
      required: ['package']
    }
  },
  {
    name: 'grandpa_rules',
    description: 'Retrieves current Grandpa architecture rules and system prompt for a specified intensity level.',
    inputSchema: {
      type: 'object',
      properties: {
        intensity: { type: 'string', enum: ['soft', 'balanced', 'hardcore'], description: 'Grandpa intensity level' }
      }
    }
  }
];

function handleToolCall(name, args = {}) {
  switch (name) {
    case 'grandpa_scan':
    case 'grandpa_audit': {
      const dir = args.dir || process.cwd();
      const report = scanProject(dir);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(report, null, 2)
          }
        ]
      };
    }
    case 'grandpa_guard': {
      const findings = [];
      const code = args.code || '';
      const cmd = args.command || '';

      if (cmd) {
        for (const pkg of Object.keys(GOLDEN_REPLACEMENTS)) {
          if (cmd.includes(pkg)) {
            findings.push(`[BLOCKED COMMAND] Installation/usage of "${pkg}" detected. Use native alternative: ${GOLDEN_REPLACEMENTS[pkg].replacement}`);
          }
        }
      }

      if (code) {
        if (code.includes('fetch(') && !code.includes('catch') && !code.includes('try') && !code.includes('.ok')) {
          findings.push('[ADVISORY] Unguarded fetch() call detected. Error boundary or .ok check missing.');
        }
        for (const pkg of Object.keys(GOLDEN_REPLACEMENTS)) {
          if (new RegExp(`require\\(['"]${pkg}['"]\\)|from\\s+['"]${pkg}['"]`).test(code)) {
            findings.push(`[BLOCKED IMPORT] Import of "${pkg}" detected. Replace with: ${GOLDEN_REPLACEMENTS[pkg].replacement}`);
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: findings.length > 0 ? findings.join('\n') : 'Safety check passed: Zero bloat, zero fragile patterns detected.'
          }
        ]
      };
    }
    case 'grandpa_migrate': {
      const pkg = (args.package || '').toLowerCase().trim();
      const match = GOLDEN_REPLACEMENTS[pkg];
      if (match) {
        return {
          content: [
            {
              type: 'text',
              text: `Package: ${pkg}\nNative Replacement: ${match.replacement}\nExample:\n${match.example}\nNote: ${match.note}`
            }
          ]
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: `No automated stdlib migration template found for "${pkg}". Ensure you check if modern Node.js or ECMAScript has a built-in standard library primitive.`
          }
        ]
      };
    }
    case 'grandpa_rules': {
      const intensity = args.intensity || 'balanced';
      return {
        content: [
          {
            type: 'text',
            text: getSystemInstructions(intensity)
          }
        ]
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC 2.0 Handler
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    const { id, method, params } = msg;

    if (method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'grandpa-mcp',
            version: '1.0.0'
          },
          capabilities: {
            tools: {}
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } else if (method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } else if (method === 'tools/call') {
      try {
        const result = handleToolCall(params.name, params.arguments);
        const response = {
          jsonrpc: '2.0',
          id,
          result
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (err) {
        const response = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: err.message
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } else if (method === 'notifications/initialized') {
      // no response required
    } else {
      if (id !== undefined) {
        const response = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    }
  } catch (err) {
    // Malformed JSON
  }
});
