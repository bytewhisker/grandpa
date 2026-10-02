---
description: Audit current codebase for dependency bloat, fragile patterns, and missing native alternatives.
---

Perform a deep architectural audit:
1. Scan `package.json`, `requirements.txt`, or module files for replaceable third-party dependencies.
2. Search for fragile patterns (e.g., unguarded fetch chains, missing error boundaries, manual deep clones).
3. Generate a structured report with remediation steps and estimated bundle/LOC savings.
