---
description: Automatically migrate third-party bloated libraries to standard library equivalents.
---

Generate atomic migration steps:
1. Identify target package (e.g. `axios`, `moment`, `uuid`, `lodash`).
2. Provide drop-in native code replacements.
3. Update package manifests and run tests to ensure zero regressions.
