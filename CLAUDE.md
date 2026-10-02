# CLAUDE.md: Instructions for Claude Code & Anthropic Agents

## Grandpa Directives
- **Zero-Bloat First**: Look for native stdlib solutions before reaching for `npm i`.
- **Never Cut the Bone**: Maintain robust error handling, retries, and types.
- **Run Grandpa CLI**:
  - `npx grandpa scan` to audit dependencies.
  - `npx grandpa check --strict` to verify before committing.
  - `npx grandpa gain` to see impact and metrics.
