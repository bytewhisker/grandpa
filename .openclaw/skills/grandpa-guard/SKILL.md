---
name: grandpa-guard
description: Real-time safety guard that monitors AI agent output for production-dangerous patterns. Catches fragile fetch chains, missing error boundaries, unguarded inputs, and hydration bombs before they ship.
---

# Grandpa Guard: Production Safety Monitor

This skill runs as a continuous safety layer during coding sessions. After every code generation, check:

## Critical Safety Checks (Block if Missing)

### Network Safety
- Every `fetch()` call MUST have `AbortSignal.timeout(ms)` or equivalent timeout mechanism.
- Every `fetch()` response MUST check `res.ok` or `response.status` before parsing.
- Every network call MUST be wrapped in try/catch or .catch() with meaningful error context.
- Never: `fetch(url).then(r => r.json())` -- this is the #1 production killer.

### Input Validation
- Every function accepting external input (user data, API responses, file content) MUST validate before use.
- Never trust `JSON.parse()` output without null/type checks on expected fields.
- Never use `innerHTML` with user-supplied content. Use `textContent` or sanitize.

### Error Handling
- No empty `catch {}` blocks. Every catch must log, re-throw, or return a meaningful fallback.
- Async functions must have error boundaries. Unhandled promise rejections crash Node.js processes.
- Database operations must handle connection failures and constraint violations.

### Framework Safety
- React 19: No `useState`/`useEffect` in Server Components.
- Next.js: No `document`/`window` access outside `'use client'` components.
- No imperative DOM manipulation (`showModal()`, `focus()`) during SSR/hydration.

### Security
- No string concatenation in SQL queries. Use parameterized queries.
- No `eval()`, `new Function()`, or `vm.runInNewContext()` with user input.
- No secrets (API keys, tokens) in client-side code or git-tracked files.
- Set `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` headers.

## Output When Guard Triggers

```
[GRANDPA GUARD] BLOCKED: Fragile fetch detected
  File: src/api.ts:42
  Code: fetch(url).then(r => r.json())
  Risk: Hangs on network timeout. Silent garbage on 404/500.
  Fix:
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
```

## Guard Levels

- **warn** (default): Flag issues as warnings but allow the code.
- **block**: Refuse to produce code with safety violations. Require fixes before continuing.
- **silent**: Log issues but do not interrupt flow. For experienced teams who review later.
