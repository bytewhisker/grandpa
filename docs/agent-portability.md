# Grandpa Agent Portability Guide

Grandpa is engineered to operate seamlessly across **25+ AI coding environments and agents** without requiring changes to agent-specific runtimes.

---

## Supported Ecosystems & File Locations

| Ecosystem / Agent | Integration File | Mechanism |
|:---|:---|:---|
| **Antigravity / Gemini CLI** | `.agents/rules/grandpa.md`, `gemini-extension.json` | Rules & Skill extension |
| **Claude Code** | `.claude-plugin/plugin.json`, `CLAUDE.md`, `commands/*.toml` | Plugin, Slash commands, Hooks |
| **Cursor** | `.cursor/rules/grandpa.mdc` | MDC Context Rules |
| **Windsurf Cascade** | `.windsurf/rules/grandpa.md` | Cascade System Rules |
| **Cline** | `.clinerules/grandpa.md` | System prompt injection |
| **OpenAI Codex** | `.codex-plugin/plugin.json` | Plugin rules |
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/plugin/` | Workspace instructions |
| **Devin** | `.devin-plugin/plugin.json` | Policy engine |
| **Grok** | `.grok-plugin/marketplace.json` | System prompt configuration |
| **Kiro** | `.kiro/steering/grandpa.md` | Steering profile |
| **OpenClaw** | `.openclaw/skills/grandpa*` | Agent skills |
| **OpenCode** | `.opencode/command/*`, `.opencode/plugins/grandpa.mjs` | Plugin & commands |
| **Qoder** | `.qoder/rules/grandpa.md`, `.qoder-plugin/plugin.json` | Workspace rules |
| **Roo Code** | `.roomodes`, `.roo/rules/grandpa.md` | Custom Architect Mode |
| **Aider** | `.aider.conf.yml` | Auto-conventions config |
| **Zed** | `.zed/settings.json` | Assistant system prompt |
| **Continue.dev** | `.continue/config.json` | Custom slash command & prompt |
| **Universal / Fallback** | `AGENTS.md` | Standard markdown instructions |

---

## One-Command Synchronization

To initialize or refresh Grandpa rules across all installed agents in your project:
```bash
npx @bytewhisker/grandpa init
```
