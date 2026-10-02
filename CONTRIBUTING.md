# Contributing to Grandpa

Thank you for your interest in contributing to **Grandpa**! We welcome contributions that help developers write cleaner, leaner, and more defensive code with modern AI coding assistants.

---

## The Grandpa Philosophy

Grandpa's mission is simple:
> **"Cut the fat, never cut the bone."**

When contributing code, rules, skills, or benchmarks:
1. **Zero External Dependencies**: Favor the modern ECMAScript and Node.js standard libraries (`node:fs`, `node:crypto`, `node:test`, Web Fetch, `structuredClone`). Do not add external npm runtime dependencies.
2. **Correctness Is a Hard Gate**: Never sacrifice error handling, timeouts (`AbortSignal.timeout`), response checks (`res.ok`), or boundary validation just to save tokens or lines of code. Code golf is rejected.
3. **Multi-Agent Portability**: Ensure rules and skills function across all supported agent ecosystems (Cursor, Windsurf, Claude Code, Antigravity, Copilot, Cline, Devin, Roo Code, etc.).

---

## Development Setup

Grandpa requires **Node.js >= 18.0.0** and has **zero runtime dependencies**.

```bash
# Clone the repository
git clone https://github.com/bytewhisker/grandpa.git
cd grandpa

# Run the test suite
npm test

# Run the project self-scan
node bin/grandpa.js scan --strict
```

---

## Running Benchmarks

We maintain a rigorous 25-task benchmark suite comparing Grandpa, Ponytail, Caveman, and Bare AI across 8 engineering domains:

```bash
# Run the 500-run deterministic benchmark suite
npm run benchmark

# Run the live Real-LLM benchmark (requires GEMINI_API_KEY in .env)
npm run benchmark:live
```

---

## Adding Benchmark Tasks

When adding tasks to `benchmarks/tasks/`:
- Create a folder with the task name (e.g. `tasks/net-custom-proxy/`).
- Include `metadata.json`, `prompt.md`, `starter.js`, and `test.js`.
- Tests must be adversarial and verify defensive behavior (e.g., handling null inputs, slow networks, status >= 400).
- Never write tests that unfairly favor or disfavor specific strategies.

---

## Pull Request Guidelines

1. **Keep it focused**: Each PR should address a single issue, feature, or example.
2. **Tests must pass**: Ensure `npm test` passes completely before submitting.
3. **Documentation**: Update the relevant `README.md` and `docs/` files if modifying CLI flags or skills.
4. **No Secrets**: Never commit `.env` or API credentials.

---

## License

By contributing to Grandpa, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
