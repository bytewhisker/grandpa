---
name: grandpa-help
description: Quick reference, cheat sheet, and rule lookup for Grandpa architecture rules, intensity modes, and native stdlib replacements.
---

# Grandpa Help: Architecture Quick Reference & Cheat Sheet

Grandpa is the zero-bloat, battle-tested architecture standard and safety engine for AI coding agents.

---

## 1. Quick Syntax & Intensity Modes

Grandpa operates in three intensity modes:

| Mode | Flag / Command | Behavior |
|:---|:---|:---|
| **Soft** | `--intensity=soft` or `/grandpa soft` | Suggests native alternatives, warns on heavy packages, permits exceptions with minimal friction. |
| **Balanced** (Default) | `--intensity=balanced` or `/grandpa balanced` | Requires `--save-exact` or justifications for new dependencies. Demands native fetch, native crypto, native Date. |
| **Hardcore** | `--intensity=hardcore` or `/grandpa hardcore` | Zero new runtime dependencies permitted without architectural receipt. Active pre-commit guard halts execution. |

---

## 2. The Golden Replacement Table

| Bloat Package | Native Alternative | Since | One-Liner Replacement |
|:---|:---|:---|:---|
| `axios` | `fetch` / `Response` | Node 18+ / Browsers | `const res = await fetch(url); const data = await res.json();` |
| `moment` / `dayjs` | `Intl.DateTimeFormat` / `Date` | Modern JS | `new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(d)` |
| `lodash.get` | Optional Chaining | ES2020 | `user?.profile?.address?.city ?? 'Unknown'` |
| `lodash.clonedeep` | `structuredClone` | Node 17+ / All Browsers | `const copy = structuredClone(original);` |
| `uuid` | `crypto.randomUUID()` | Node 15+ / All Browsers | `const id = crypto.randomUUID();` |
| `classnames` / `clsx` | Template Literals / Array Filter | Any JS | `[base, active && 'active', error && 'err'].filter(Boolean).join(' ')` |
| `rimraf` | `fs.rmSync(path, { recursive: true, force: true })` | Node 14.14+ | Standard library `node:fs` |
| `mkdirp` | `fs.mkdirSync(path, { recursive: true })` | Node 10.12+ | Standard library `node:fs` |
| `dotenv` | `node --env-file=.env` | Node 20.6+ | Native flag without imports |
| `chalk` / `kleur` | ANSI escape codes | Modern terminals | `\x1b[32m${text}\x1b[0m` |
| `glob` | `fs.readdir(path, { recursive: true })` | Node 20.1+ | Standard library `node:fs/promises` |
| `is-promise` | `Promise.resolve(val) === val` or `typeof val?.then === 'function'` | Any JS | Pure JavaScript |
| `ms` | Pure JS arithmetic | Any JS | `60 * 1000 // 1 minute` |

---

## 3. The Grandpa Doctrine: 4 Rules

1. **Rule 1: Cut the Fat, Never Cut the Bone**
   Never remove error boundaries, input validation, authentication guards, or retry safety just to reduce LOC. Minimal code with broken edge cases is amateur, not senior.
2. **Rule 2: Built-in Over Built-out**
   If the language runtime (Node, Deno, Bun, Python, Go, Rust) or standard browser platform has the capability built in, third-party libraries are banned.
3. **Rule 3: Single Responsibility Scripts Over Enterprise Micro-Frameworks**
   Do not introduce heavy scaffolding for simple utilities. Write readable, testable, dependency-free functions.
4. **Rule 4: Explicit Receipts for Exceptions**
   If a library is truly needed (e.g., complex cryptographic math, WebGL, high-performance parsers), leave an architectural receipt:
   ```javascript
   // grandpa: allowed dependency [zod] - runtime schema parsing required for untrusted user webhook
   ```

---

## 4. Grandpa CLI Commands

```bash
# Scan working directory for bloated dependencies & fragile patterns
npx grandpa scan

# Run pre-commit safety check with strict CI exit code (fails on bloat)
npx grandpa check --strict

# Launch the interactive audit report
npx grandpa audit

# View quantified dependency, LOC, and bundle savings
npx grandpa gain

# Start the MCP server for AI editor integration
npx grandpa mcp
```
