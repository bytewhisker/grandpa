import fs from 'node:fs';
import path from 'node:path';

export const GRANDPA_CORE_SPEC = `# Grandpa: Battle-Tested, Zero-Bloat Engineering for AI Agents

You channel a veteran principal engineer with decades of production experience.
You have been paged at 3:00 AM for fragile one-liners and broken dependencies.
Your philosophy: "Back in my day, we didn't install 500MB of dependencies for what 5 lines of standard library can do."

## The Core Rule: Cut the Fat, Never Cut the Bone
- THE FAT (Cut aggressively): Synthetic abstractions, single-implementation interfaces, single-product factories, unnecessary npm/pip packages, and premature scaffolding.
- THE BONE (Never cut): HTTP status verification (res.ok), network timeouts (AbortSignal.timeout), null/undefined guards, error boundaries, and accessibility (a11y).

## The Grandpa Decision Ladder
Before writing any code, stop at the first rung that solves the requirement:
1. YAGNI: Speculative future requirement? Skip it and say so in one line.
2. Codebase Check: Does a helper, type, or utility already exist in this repository? Reuse it. Do not duplicate.
3. Modern Stdlib: Use built-in runtime standard libraries:
   - Node.js 18+: Native fetch(), crypto.randomUUID(), structuredClone(), URLSearchParams, fs.rmSync({ recursive: true }).
   - Python 3.11+: pathlib.Path, tomllib, asyncio.
4. Platform Native: Native browser/OS features:
   - Built-in HTML elements (<dialog>, <input type="date">, <details>) over heavy component libraries.
   - CSS over JS animations where possible.
   - Database constraints over duplicate application-level boilerplate.
5. The Structural Integrity Guard: Write the simplest code that works, but keep status checks and timeouts intact. Never write fragile code-golf.

## Bug Fixes: Root Cause Over Superficial Band-Aids
A bug report describes a symptom. Before editing, trace callers of the affected function.
One guard at the common root is a cleaner diff than patching 5 individual call sites.

## The 1-Line Trade-Off Receipt
When choosing a simple native alternative over a complex package, leave a concise 1-line note explaining the trade-off:
// grandpa: using native <dialog>; upgrade if nested popovers required.
`;

export function installRules(targetDir = process.cwd(), format = 'all') {
  const installed = [];

  // 1. Cursor MDC format (.cursor/rules/grandpa.mdc)
  if (format === 'all' || format === 'cursor') {
    const cursorDir = path.join(targetDir, '.cursor', 'rules');
    fs.mkdirSync(cursorDir, { recursive: true });
    const cursorFile = path.join(cursorDir, 'grandpa.mdc');
    const content = `---
description: "Grandpa - Zero-bloat, battle-tested engineering standard"
alwaysApply: true
---
${GRANDPA_CORE_SPEC}`;
    fs.writeFileSync(cursorFile, content);
    installed.push('.cursor/rules/grandpa.mdc');
  }

  // 2. Windsurf rules (.windsurfrules and .windsurf/rules/grandpa.md)
  if (format === 'all' || format === 'windsurf') {
    const windsurfFile = path.join(targetDir, '.windsurfrules');
    fs.writeFileSync(windsurfFile, GRANDPA_CORE_SPEC);
    installed.push('.windsurfrules');

    const windsurfRulesDir = path.join(targetDir, '.windsurf', 'rules');
    fs.mkdirSync(windsurfRulesDir, { recursive: true });
    fs.writeFileSync(path.join(windsurfRulesDir, 'grandpa.md'), GRANDPA_CORE_SPEC);
    installed.push('.windsurf/rules/grandpa.md');
  }

  // 3. Claude Code (CLAUDE.md)
  if (format === 'all' || format === 'claude') {
    const claudeFile = path.join(targetDir, 'CLAUDE.md');
    const content = `# CLAUDE.md: Instructions for Claude Code & Anthropic Agents\n\n${GRANDPA_CORE_SPEC}`;
    fs.writeFileSync(claudeFile, content);
    installed.push('CLAUDE.md');
  }

  // 4. Universal Agents / OpenCode / Devin / Antigravity (AGENTS.md)
  if (format === 'all' || format === 'agents' || format === 'opencode') {
    const agentsFile = path.join(targetDir, 'AGENTS.md');
    fs.writeFileSync(agentsFile, GRANDPA_CORE_SPEC);
    installed.push('AGENTS.md');
  }

  // 5. Cline (.clinerules/grandpa.md)
  if (format === 'all' || format === 'cline') {
    const clineDir = path.join(targetDir, '.clinerules');
    fs.mkdirSync(clineDir, { recursive: true });
    const clineFile = path.join(clineDir, 'grandpa.md');
    fs.writeFileSync(clineFile, GRANDPA_CORE_SPEC);
    installed.push('.clinerules/grandpa.md');
  }

  // 6. GitHub Copilot (.github/copilot-instructions.md)
  if (format === 'all' || format === 'copilot') {
    const copilotDir = path.join(targetDir, '.github');
    fs.mkdirSync(copilotDir, { recursive: true });
    const copilotFile = path.join(copilotDir, 'copilot-instructions.md');
    fs.writeFileSync(copilotFile, GRANDPA_CORE_SPEC);
    installed.push('.github/copilot-instructions.md');
  }

  return installed;
}

/**
 * Diagnostic helper: Checks whether Grandpa rules and hooks are active
 * across all major AI agent ecosystems in the target project.
 */
export function checkAgentStatus(targetDir = process.cwd()) {
  const agentChecks = [
    {
      id: 'claude',
      name: 'Claude Code',
      category: 'CLI Agent',
      file: 'CLAUDE.md',
      installed: fs.existsSync(path.join(targetDir, 'CLAUDE.md')),
      details: 'Claude Code instructions and zero-bloat prompt'
    },
    {
      id: 'cursor',
      name: 'Cursor AI',
      category: 'IDE Rules',
      file: '.cursor/rules/grandpa.mdc',
      installed: fs.existsSync(path.join(targetDir, '.cursor', 'rules', 'grandpa.mdc')),
      details: 'Cursor MDC rules and automated steering'
    },
    {
      id: 'windsurf',
      name: 'Windsurf (Codeium)',
      category: 'Cascade Rules',
      file: '.windsurfrules',
      installed: fs.existsSync(path.join(targetDir, '.windsurfrules')) || 
                 fs.existsSync(path.join(targetDir, '.windsurf', 'rules', 'grandpa.md')),
      details: 'Windsurf Cascade instructions'
    },
    {
      id: 'agents',
      name: 'OpenCode & Universal Agents',
      category: 'Universal Spec',
      file: 'AGENTS.md',
      installed: fs.existsSync(path.join(targetDir, 'AGENTS.md')),
      details: 'AGENTS.md standard for OpenCode, Devin & Antigravity'
    },
    {
      id: 'cline',
      name: 'Cline Autonomous CLI',
      category: 'CLI Agent',
      file: '.clinerules',
      installed: fs.existsSync(path.join(targetDir, '.clinerules')) || 
                 fs.existsSync(path.join(targetDir, '.clinerules', 'grandpa.md')),
      details: 'Cline autonomous agent system prompt'
    },
    {
      id: 'copilot',
      name: 'GitHub Copilot',
      category: 'IDE Assistant',
      file: '.github/copilot-instructions.md',
      installed: fs.existsSync(path.join(targetDir, '.github', 'copilot-instructions.md')),
      details: 'GitHub Copilot repository custom instructions'
    },
    {
      id: 'git-hook',
      name: 'Git Pre-Commit Guard',
      category: 'Security Hook',
      file: '.git/hooks/pre-commit',
      installed: fs.existsSync(path.join(targetDir, '.git', 'hooks', 'pre-commit')),
      details: 'Active blocker against unvetted npm/pip packages'
    }
  ];

  const total = agentChecks.length;
  const activeCount = agentChecks.filter(a => a.installed).length;
  const score = Math.round((activeCount / total) * 100);

  return {
    agents: agentChecks,
    total,
    activeCount,
    score,
    isFullyProtected: activeCount >= 4
  };
}
