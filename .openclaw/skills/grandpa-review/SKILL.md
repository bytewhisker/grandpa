---
name: grandpa-review
description: Review a diff or PR for removable complexity, unnecessary dependencies, fragile patterns, and missed native alternatives. Produces a structured review with specific line-level feedback.
---

# Grandpa Review: PR and Diff Architecture Review

Review the provided diff, PR, or set of changed files. For each change, evaluate:

## Review Criteria

1. **New Dependencies Added**
   - Was a package added that has a native stdlib alternative?
   - Does the new dependency duplicate functionality already in the project?
   - What is the package's maintenance status and dependency tree depth?

2. **Fragile Patterns Introduced**
   - Any `fetch` call missing `res.ok` check or `AbortSignal.timeout`?
   - Any empty catch blocks or swallowed errors?
   - Any unvalidated external input being used directly?

3. **Unnecessary Complexity**
   - Any new abstraction layers (interfaces, factories, base classes) with a single implementation?
   - Any new config files for values that are used in exactly one place?
   - Any wrapper functions that pass through to another function without adding logic?

4. **Missed Native Alternatives**
   - Could a `<dialog>` replace a modal library?
   - Could `<input type="date">` replace a date picker?
   - Could `structuredClone()` replace a deep clone library?
   - Could `crypto.randomUUID()` replace a UUID library?

5. **Framework Safety**
   - React 19: Any `useEffect` + `setState` that could be a Server Component?
   - Next.js: Any `'use client'` on a component that uses no client APIs?
   - Hydration safety: Any imperative DOM manipulation in server-rendered code?

## Output Format

For each file in the diff, provide:

```
FILE: <path>

  Line <n>: [BLOAT] Added `uuid` package -- use `crypto.randomUUID()` instead.
  Line <n>: [FRAGILE] fetch() without AbortSignal.timeout -- add timeout guard.
  Line <n>: [SMELL] New interface with single implementation -- remove interface, use class directly.
  Line <n>: [OK] Clean, minimal, production-safe.

VERDICT: <APPROVE | REQUEST_CHANGES | COMMENT>
```

Keep feedback actionable. Every objection must include a specific fix. No vague "consider simplifying" -- say exactly what to change and why.
