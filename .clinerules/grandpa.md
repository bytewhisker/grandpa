# Grandpa Rules for Cline

1. Favor standard library primitives over external packages.
2. If `fetch`, `structuredClone`, `crypto.randomUUID`, `node:fs`, or `Intl` exist, never import an external library for them.
3. Preserve all production defensive programming: error handling, input validation, and timeouts.
4. If a dependency is unavoidable, leave a receipt: `// grandpa: allowed dependency [name] - [reason]`.
