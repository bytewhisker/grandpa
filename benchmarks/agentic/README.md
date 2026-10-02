# Grandpa Agentic Benchmark Suite

A scientific, multi-dimensional evaluation harness comparing AI coding architectures:
- **Baseline (Bare AI)**: Default agent behavior without architectural prompting.
- **Ponytail (Minimalist)**: Aggressive LOC-minimization prompt.
- **Grandpa (Zero-Bloat Defensive Standard)**: Stdlib-first + production defensive engineering.

---

## The Flaw in Prior Benchmarks

Prior benchmarks (including Ponytail's) rewarded purely **fewer lines of code**. This incentivized agents to:
- Strip `try/catch` and error boundaries.
- Drop network timeout guards (`AbortController`).
- Skip HTTP status code assertions (`res.ok`).
- Eliminate parameter type checking and sanitization.

**The Result:** Code that looks clean on GitHub diffs, but crashes in production or introduces critical vulnerabilities.

---

## Grandpa's 5-Star Metric System

Grandpa evaluates across 5 scientific dimensions:

1. **Dependency Bloat Score (0-100)**: Did the agent avoid introducing unnecessary 3rd-party dependencies when native stdlib primitives exist?
2. **Defensive Safety Score (0-100)**: Are error boundaries, status assertions, and timeouts present?
3. **Adversarial Resilience (0-100)**: Does the produced code survive malformed JSON, timeout triggers, and null parameters when executed?
4. **Code Elegance (LOC Efficiency)**: Conciseness without cutting defensive safety.
5. **CVE / Supply Chain Risk Score**: Number of external attack surfaces added.

---

## Running the Benchmark

```bash
# Run agentic Python benchmark
python benchmarks/agentic/run.py --model claude-3-7-sonnet --tasks all

# Quick local comparison runner (Node.js)
node benchmarks/quick-compare.js
```
