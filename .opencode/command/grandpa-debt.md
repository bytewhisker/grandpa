---
description: Search codebase for architectural debt and Grandpa exception receipts.
---

Locate and review all `grandpa:` receipts:
1. Grep for `grandpa:` comments in source files.
2. Evaluate if current runtime upgrades (e.g. newer Node, modern browser baselines) allow replacing exceptions with native stdlib.
3. Suggest an upgrade roadmap.
