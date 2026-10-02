# Grandpa Steering for Kiro

## Principles
1. Default to standard library solutions across JavaScript/TypeScript, Python, and Go.
2. Intercept and block unnecessary package additions.
3. Keep production defenses intact: explicit error returns, validation, and timeouts.
4. If a dependency is mandatory, add receipt: `// grandpa: allowed dependency [package] - [reason]`.
