---
description: Apply Grandpa architecture rules to remove bloat, enforce standard library, and maintain zero-defect code.
---

Read and apply the Grandpa architecture doctrine:
1. Identify unnecessary third-party dependencies and replace them with standard library primitives.
2. Maintain all production error handling, type definitions, and edge case resilience (never cut the bone).
3. Record architectural receipts for necessary exceptions with `// grandpa: allowed dependency [package] - [reason]`.
