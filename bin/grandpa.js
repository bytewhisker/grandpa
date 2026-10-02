#!/usr/bin/env node

import { scanProject } from '../src/scanner.js';
import { installRules } from '../src/rules.js';
import { installPreCommitHook } from '../src/hook.js';

const args = process.argv.slice(2);
const command = args[0] || 'scan';

// ANSI color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function printBanner() {
  console.log(`
${c.cyan}${c.bold}   ____                          _             
  / ___|_ __ __ _ _ __   __| |_ __   __ _ 
 | |  _| '__/ _\` | '_ \\ / _\` | '_ \\ / _\` |
 | |_| | | | (_| | | | | (_| | |_) | (_| |
  \\____|_|  \\__,_|_| |_|\\__,_| .__/ \\__,_|
                             |_|          ${c.reset}
${c.dim}  "Back in my day, we didn't install 500MB of node_modules."${c.reset}
${c.dim}  Battle-Tested, Zero-Bloat Architecture for AI Agents${c.reset}
======================================================`);
}

if (command === 'help' || args.includes('--help') || args.includes('-h')) {
  printBanner();
  console.log(`
${c.bold}USAGE:${c.reset}
  npx @bytewhisker/grandpa <command> [options]

${c.bold}COMMANDS:${c.reset}
  ${c.green}scan${c.reset}        Scan current project for dependency & code bloat (default)
  ${c.green}init${c.reset}        Install Grandpa rules (.cursor, .windsurf, AGENTS.md)
  ${c.green}hook${c.reset}        Install git pre-commit guard to block AI dependency injection
  ${c.green}help${c.reset}        Display this guide

${c.bold}OPTIONS:${c.reset}
  --strict    Exit with non-zero code if any bloat or fragile code is detected
  --json      Output raw JSON results for CI/CD automation
`);
  process.exit(0);
}

if (command === 'init') {
  printBanner();
  console.log(`\n${c.bold}Installing Grandpa AI Agent Rules...${c.reset}`);
  const installed = installRules(process.cwd());
  for (const file of installed) {
    console.log(`  ${c.green}✓${c.reset} Created ${c.cyan}${file}${c.reset}`);
  }
  console.log(`\n${c.green}${c.bold}Success:${c.reset} Cursor, Windsurf, and Claude/Antigravity will now enforce zero-bloat architecture.\n`);
  process.exit(0);
}

if (command === 'hook') {
  printBanner();
  try {
    const hookPath = installPreCommitHook(process.cwd());
    console.log(`\n  ${c.green}✓${c.reset} Pre-commit hook installed at ${c.cyan}${hookPath}${c.reset}`);
    console.log(`  ${c.dim}Grandpa will now intercept unvetted AI package installations before commit.${c.reset}\n`);
  } catch (err) {
    console.error(`\n  ${c.red}Error:${c.reset} ${err.message}\n`);
    process.exit(1);
  }
  process.exit(0);
}

// Default: scan
const results = scanProject(process.cwd());

if (args.includes('--json')) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.bloatFound.length > 0 && args.includes('--strict') ? 1 : 0);
}

printBanner();
console.log(`\n${c.bold}Target Directory:${c.reset} ${results.projectDir}`);

if (!results.hasPackageJson) {
  console.log(`${c.yellow}[!] No package.json found in this directory.${c.reset}`);
}

console.log(`\n${c.bold}--- DEPENDENCY AUDIT ---${c.reset}`);
if (results.bloatFound.length === 0) {
  console.log(`  ${c.green}✓ Zero replaceable dependency bloat detected!${c.reset}`);
} else {
  console.log(`  ${c.yellow}Found ${results.bloatFound.length} package(s) that can be replaced with native built-ins:${c.reset}\n`);
  for (const item of results.bloatFound) {
    console.log(`  ${c.red}${c.bold}• ${item.package}${c.reset} ${c.dim}(v${item.version})${c.reset}`);
    console.log(`    ${c.bold}Grandpa's Native Fix:${c.reset} ${c.green}${c.bold}${item.native}${c.reset}`);
    console.log(`    ${c.dim}${item.reason} (Supported in Node ${item.minNode})${c.reset}\n`);
  }
}

if (results.fragileCodeFound.length > 0) {
  console.log(`${c.bold}--- FRAGILE CODE AUDIT (The Ponytail Trap) ---${c.reset}`);
  console.log(`  ${c.red}Found ${results.fragileCodeFound.length} fragile pattern(s) that risk production crashes:${c.reset}\n`);
  for (const item of results.fragileCodeFound) {
    console.log(`  ${c.red}• ${item.file}:${item.line}${c.reset}`);
    console.log(`    ${c.dim}${item.issue}${c.reset}`);
    console.log(`    ${c.green}Hardened Fix:${c.reset} ${item.fix}\n`);
  }
}

console.log(`${c.bold}======================================================${c.reset}`);
console.log(`  ${c.bold}Grandpa's Codebase Score:${c.reset} ${results.score}/100`);
console.log(`  ${c.bold}Rating:${c.reset}                  ${results.score >= 80 ? c.green : c.red}${results.rating}${c.reset}`);
console.log(`${c.bold}======================================================${c.reset}\n`);

if (args.includes('--strict') && (results.bloatFound.length > 0 || results.fragileCodeFound.length > 0)) {
  console.log(`${c.red}CI Failure: Codebase violates Grandpa zero-bloat standards.${c.reset}\n`);
  process.exit(1);
}

process.exit(0);
