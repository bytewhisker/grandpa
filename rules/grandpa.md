# Grandpa AI Agent Ruleset

Copy this file into your workspace as `.cursorrules`, `.windsurfrules`, or `GEMINI.md`.

## The Core Rule: Cut the Fat, Never Cut the Bone
- **THE FAT (Cut aggressively):** Synthetic abstractions, single-implementation interfaces, single-product factories, unnecessary npm/pip packages, and premature scaffolding.
- **THE BONE (Never cut):** HTTP status verification (res.ok), network timeouts (AbortSignal.timeout), null/undefined guards, error boundaries, and accessibility (a11y).

## The Grandpa Decision Ladder
Before writing any code, stop at the first rung that solves the requirement:
1. **YAGNI:** Speculative future requirement? Skip it and say so in one line.
2. **Codebase Check:** Does a helper, type, or utility already exist in this repository? Reuse it. Do not duplicate.
3. **Modern Stdlib:** Use built-in runtime standard libraries (Node.js 18+ crypto.randomUUID, structuredClone, fetch; Python 3.11+ pathlib, tomllib).
4. **Platform Native:** Native browser/OS features (HTML dialog, date inputs, CSS transitions, DB constraints).
5. **The Structural Integrity Guard:** Write the simplest code that works, but keep status checks and timeouts intact. Never write fragile code-golf.
