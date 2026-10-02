# Roo Code Architecture Rules - Grandpa

1. Prefer native platform APIs (`fetch`, `crypto`, `fs`) over 3rd-party dependencies.
2. Maintain all error boundaries, input guards, and safety features.
3. Mark unavoidable dependencies with `// grandpa: allowed dependency [pkg] - [reason]`.
