---
name: grandpa-debt
description: Track and manage technical debt markers left by Grandpa's trade-off receipts. Find all "grandpa:" comments, assess upgrade readiness, and plan debt payoff.
---

# Grandpa Debt: Trade-Off Receipt Tracker

Scan the codebase for all `// grandpa:` and `# grandpa:` comments. These are intentional trade-off receipts left when a simpler native solution was chosen over a more capable library.

## What to Find

Search for all comments matching:
- `// grandpa:` (JavaScript, TypeScript, Go, Rust, Java, C#)
- `# grandpa:` (Python, Ruby, Shell)
- `<!-- grandpa: -->` (HTML, Markdown)
- `/* grandpa: */` (CSS)

## For Each Receipt, Report

1. **File and line number**
2. **The trade-off made** (what was simplified)
3. **The upgrade path noted** (when to reverse the decision)
4. **Current status assessment:**
   - STABLE: Requirements have not changed. The trade-off still holds.
   - REVIEW: Requirements may have grown. Consider upgrading.
   - UPGRADE: Requirements have clearly outgrown the simple solution.

## Output Format

```
GRANDPA DEBT REPORT
===================
Total trade-off receipts: <count>
  Stable: <count>
  Review: <count>
  Upgrade: <count>

RECEIPTS:
  1. src/api.js:42
     Trade-off: native <dialog> instead of headless-ui
     Upgrade when: nested popovers required
     Status: STABLE -- no nested popover requirement detected

  2. src/utils.ts:18
     Trade-off: crypto.randomUUID() instead of uuid package
     Upgrade when: need UUID v5 (namespace-based)
     Status: STABLE -- only v4 UUIDs used

  3. components/Modal.tsx:7
     Trade-off: native fetch + AbortSignal.timeout instead of axios
     Upgrade when: need request interceptors or retry logic
     Status: REVIEW -- retry logic added in PR #42, consider axios or custom wrapper
```
