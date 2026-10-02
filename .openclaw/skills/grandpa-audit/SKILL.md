---
name: grandpa-audit
description: Audit an entire repository for bloat, fragile patterns, unnecessary dependencies, and architecture debt. Produces a scored report with actionable fixes.
---

# Grandpa Audit: Full Repository Architecture Review

Scan the entire repository and produce a structured report covering:

## Audit Checklist

1. **Dependency Bloat Scan**
   - List every dependency in package.json / requirements.txt / go.mod / Cargo.toml.
   - For each, check: does a native stdlib replacement exist?
   - Flag: `uuid`, `lodash.clonedeep`, `rimraf`, `mkdirp`, `node-fetch`, `cross-fetch`, `isomorphic-fetch`, `left-pad`, `is-odd`, `is-even`, `is-number`, `object-assign`, `array-flatten`, `querystring`, `moment`, `dayjs` (when `Intl.DateTimeFormat` suffices), `classnames`/`clsx` (when template literals suffice), `dotenv` (when `--env-file` suffices), `axios` (when `fetch` suffices).

2. **Fragile Code Patterns**
   - Unguarded fetch: `fetch(url).then(r => r.json())` without `res.ok` check.
   - Missing timeouts: `fetch()` calls without `AbortSignal.timeout()`.
   - Silent error swallowing: empty `catch {}` blocks.
   - Unvalidated external input: parsing user/API data without null checks.

3. **Architecture Smells**
   - Single-implementation interfaces or abstract classes.
   - Factory patterns producing exactly one product.
   - Config files for values that never change.
   - Wrapper functions that add zero logic over the wrapped API.
   - Over-layered service/repository/controller stacks for simple CRUD.

4. **Framework Misuse**
   - React: `useEffect` + `fetch` in components that could be Server Components.
   - Next.js: Client components that use no client-only APIs.
   - Python: `os.path` usage where `pathlib` would be cleaner.
   - Go: `gorilla/mux` where `net/http.ServeMux` (Go 1.22+) suffices.

## Output Format

```
GRANDPA AUDIT REPORT
====================
Repository: <name>
Date: <date>
Score: <0-100>/100
Rating: <A+ through F>

DEPENDENCY BLOAT (<count> replaceable)
  - <package> -> <native replacement>

FRAGILE PATTERNS (<count> found)
  - <file>:<line> -- <description> -> <fix>

ARCHITECTURE SMELLS (<count> found)
  - <file> -- <description>

FRAMEWORK MISUSE (<count> found)
  - <file>:<line> -- <description>

RECOMMENDATIONS
  1. <action>
  2. <action>
```
