# Grandpa Architecture Rules for Antigravity & Agentic Frameworks

## Directives
- **Zero-bloat**: Strictly prefer standard library over external dependencies.
- **Defensive safety**: Preserve all error handling, type guards, timeouts, and boundaries.
- **Explicit receipts**: Document exceptions with `// grandpa: allowed dependency [name] - [reason]`.
- **Replacement catalog**:
  - `axios` -> `fetch`
  - `moment`/`dayjs` -> `Intl.DateTimeFormat` / `Date`
  - `lodash.get` -> `?.` and `??`
  - `lodash.clonedeep` -> `structuredClone`
  - `uuid` -> `crypto.randomUUID()`
  - `classnames` -> template literals / `.filter(Boolean).join(' ')`
  - `rimraf`/`mkdirp` -> `fs.rmSync` / `fs.mkdirSync` with `{ recursive: true }`
