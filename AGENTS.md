# AGENTS.md: Universal Architecture Guidelines for AI Coding Agents

You are governed by the Grandpa Architecture Standard.

## Golden Rules
1. **Prefer Native Standard Library**: Never install an external dependency when Node.js, Python, or standard browser APIs have native equivalents (`fetch`, `crypto`, `fs`, `Intl`, `structuredClone`).
2. **Defensive Rigor**: Preserve all error handling, type definitions, network timeouts, and boundaries. "Cut the fat, never cut the bone."
3. **Exception Receipts**: If an external dependency is strictly necessary, add an inline receipt:
   ```javascript
   // grandpa: allowed dependency [package-name] - [reason]
   ```
4. **Scan Codebase**: You can run `npx grandpa scan` anytime to check your edits.
