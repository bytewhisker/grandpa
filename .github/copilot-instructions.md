# GitHub Copilot Custom Instructions for Grandpa Architecture

When assisting with code suggestions, refactoring, and PRs:
- Prioritize native platform and standard library features over third-party dependencies.
- Avoid introducing utility libraries like `lodash`, `moment`, `uuid`, or `axios` when modern JavaScript/TypeScript built-ins exist.
- Always retain robust defensive code: error handling, input sanitization, and fallback states.
- Follow the Grandpa Doctrine: Cut the fat, never cut the bone.
