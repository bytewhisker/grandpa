# Grandpa Benchmark Suite

Reproducible, transparent benchmarks comparing Grandpa against Ponytail and a bare AI agent.

## What We Measure

| Metric | How | Why |
|:---|:---|:---|
| **Lines of Code** | Count lines in agent output | Less is better (if safe) |
| **Dependencies Added** | Count `npm install` / `import` of new packages | Zero is the target |
| **Safety Score** | Check for `res.ok`, `AbortSignal.timeout`, null guards, error handling | 100% is the only acceptable score |
| **Framework Correctness** | Does the code work in React 19 / Next.js App Router without hydration issues | Pass/fail |
| **Fragile Patterns** | Grandpa scanner detects unguarded fetch, missing timeouts | Zero is the target |

## How to Run

### Quick comparison (manual)

Run each task prompt with three different system instructions:

```bash
node benchmarks/run.js
```

This generates a side-by-side report in `benchmarks/results/`.

### With promptfoo (automated)

```bash
npx promptfoo eval -c benchmarks/promptfooconfig.yaml
npx promptfoo view
```

## Arms (Test Configurations)

1. **bare** -- No skill, no rules. Raw AI agent.
2. **ponytail** -- Ponytail SKILL.md as system instruction.
3. **grandpa** -- Grandpa SKILL.md as system instruction.
4. **yagni-oneliner** -- A naive "write one-liners, be minimal" prompt.

## Tasks

12 real-world coding tasks designed to expose over-engineering traps:

1. Generate a UUID
2. Deep clone an object
3. Fetch data from an API endpoint
4. Create a date picker component
5. Delete a directory recursively
6. Flatten a nested array
7. Create a modal/dialog
8. Parse query string parameters
9. Add left-padding to a string
10. Create an expandable/collapsible section
11. Make an HTTP POST with JSON body and error handling
12. Generate a color picker input
