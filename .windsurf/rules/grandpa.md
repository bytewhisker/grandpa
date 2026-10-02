# Grandpa Architecture Rules for Windsurf Cascade

Enforce battle-tested, zero-bloat architecture rules across all file edits and generation.

## Directives
- **Zero unnecessary dependencies**: Use Node/Browser/Python standard libraries before considering 3rd-party dependencies.
- **Safety first**: Keep error boundaries, null checks, timeouts, and validation intact.
- **Receipts**: Leave a comment for required dependencies: `// grandpa: allowed dependency [name] - [reason]`.
- **Drop-in replacements**:
  - `axios` -> `fetch`
  - `moment` -> `Intl.DateTimeFormat` / `Date`
  - `lodash` -> ES6 Array / Object methods / `structuredClone`
  - `uuid` -> `crypto.randomUUID()`
  - `classnames` -> template literals or `.filter(Boolean).join(' ')`
