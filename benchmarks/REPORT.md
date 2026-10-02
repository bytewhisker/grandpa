# Grandpa Benchmark

## Goal

Grandpa exists to minimize the **total AI work** required to reach correct production software:
$$\text{TCS} = \text{Tokens to Correct Solution}$$

This benchmark objectively compares four distinct coding agent strategies across a standardized 25-task suite evaluating first-pass correctness, multi-turn repair behavior, and total token expenditure.

---

## Core Metric

The primary ranking metric is **TCS (Tokens to Correct Solution)** among successful runs:

$$\text{TCS} = \text{Input Tokens} + \text{Output Tokens} + \text{Tool Tokens} + \text{Repair Input Tokens} + \text{Repair Output Tokens}$$

Correctness is a non-negotiable prerequisite. We do **not** use "Safeguards per Output Token" as a ranking metric because it artificially rewards non-working golfed snippets. Token efficiency is measured strictly across verified correct solutions.

Secondary metrics:
- **First-Pass Correctness Rate (%)**: Fraction of tasks passing all hidden tests on Attempt 1 without requiring repair turns.
- **TTCS (Time to Correct Solution)**: Total elapsed wall-clock latency (ms) from initial dispatch to verified passing implementation.
- **Dependencies Added**: Unnecessary external packages introduced where native standard library solutions exist.

---

## Methodology

### Strategies Evaluated
1. **Grandpa**: Adaptive Quick/Standard/Deep routing, relevance-bounded context retrieval, native standard library prioritization, defensive integrity (status checks, timeouts, boundary validation), and strict stop behavior.
2. **Ponytail**: Minimalist developer style prioritizing native features, one-liners, and minimal code diffs.
3. **Caveman**: Ultra-concise communication and code style using shorthand syntax and minimal identifiers.
4. **Bare AI (Vanilla)**: Standard model generation without architectural steering or prompt constraints.

### Task Suite Composition
25 production-inspired tasks across 8 categories (40% Easy, 40% Medium, 20% Hard):
- **Networking / API (5 tasks)**: `net-fetch-timeout`, `net-post-json`, `net-retry-backoff`, `net-stream-download`, `net-bearer-auth`
- **TypeScript (4 tasks)**: `ts-result-container`, `ts-deep-partial`, `ts-typed-emitter`, `ts-schema-validator`
- **Node.js (4 tasks)**: `node-safe-exec`, `node-atomic-file`, `node-env-parser`, `node-rate-limiter`
- **Frontend / React (3 tasks)**: `react-debounce-hook`, `react-previous-hook`, `react-dialog-trap`
- **Bug Fixing (3 tasks)**: `bug-race-condition`, `bug-event-leak`, `bug-pagination-bounds`
- **Security & Validation (2 tasks)**: `sec-redirect-sanitizer`, `sec-timing-safe-eq`
- **Refactoring (2 tasks)**: `refactor-date-formatter`, `refactor-promise-pipeline`
- **Data & Filesystem (2 tasks)**: `fs-csv-parser`, `fs-walk-dir`

### Real Multi-Turn Repair Loop
No synthetic penalties are used. Candidates execute in isolated child processes with sandboxed temporary directories and hard timeouts. When a candidate fails:
1. The verifier captures concise error diagnostics (stripping internal runtime noise).
2. The exact error is passed back to the same strategy adapter for a repair attempt.
3. Repaired candidates are re-verified.
4. All repair input and output tokens are measured and added to TCS.
5. Max attempts: 3. Unresolved tasks are marked as failures with null TTCS.

### Repetitions & Cache Instrumentation
- **Runs**: 25 tasks $\times$ 5 repetitions $\times$ 4 strategies = **500 total executions**.
- **Cache Isolation**: Run 1 measures **Cold Cache** performance. Runs 2–5 measure **Warm Cache** performance. Cold and warm numbers are reported separately.

---

---

## Results

### 1. Live Real-LLM Benchmark (Google Gemini 3.5 Flash Lite API)

*Evaluated live across 10 representative tasks with real provider token accounting and live inference latency across complete repetitions (120 runs).*  
*Data source: `benchmarks/results/live-summary.json` and raw runs in `benchmarks/results/raw-live/`.*

| Strategy | Success Rate (Gate) | 1st-Pass Rate | Median TCS | p75 TCS | Failure-Aware Metric<br>*(Tokens / Solved Task)* | Median TTCS |
|:---|---:|---:|---:|---:|---:|---:|
| **Grandpa (Quick)** | **100.0%** (30/30) | **100.0%** (30/30) | 356 t | **462 t** | **403 t / solved** | 1,530 ms |
| **Ponytail** | 83.3% (25/30) | 63.3% (19/30) | **225 t** | 340 t | 592 t / solved | **1,223 ms** |
| **Caveman** | **100.0%** (30/30) | 63.3% (19/30) | 335 t | 749 t | 598 t / solved | 1,613 ms |
| **Bare AI (Vanilla)** | **100.0%** (30/30) | 53.3% (16/30) | 1,011 t | 2,041 t | 1,490 t / solved | 3,669 ms |

**Key Live Findings:**
1. **Grandpa First-Pass Victory**: Grandpa Quick achieved a **100% first-pass pass rate** on the live model by supplying clean ESM export declarations and targeted guard instructions. Competitors frequently failed on turn 1 (Ponytail 63%, Caveman 63%, Bare 53%).
2. **Failure-Aware Efficiency Win**: When factoring in repair turn penalties and wasted tokens on unresolved tasks, **Grandpa won the failure-aware efficiency metric by 31.9%** (403 t/solved vs Ponytail's 592 t/solved and Caveman's 598 t/solved).
3. **Bare AI Churn**: Unsteered vanilla model generation incurred massive verbosity (1,490 t/solved and 3,669 ms latency), taking 3.6x more tokens than Grandpa.

---

### 2. Standardized 500-Run Deterministic Suite (25 Tasks × 5 Repetitions)

*Data source: 500 empirical runs recorded in `benchmarks/results/raw/2026-10-02T11-34-05-371Z/`.*

| Strategy | Success Rate | First-Pass Rate | Median TCS | p75 TCS | p95 TCS | Median TTCS | Dependencies Added |
|:---|---:|---:|---:|---:|---:|---:|---:|
| **Grandpa** | **100.0%** (125/125) | **96.0%** (120/125) | 270 t | 298 t | 363 t | 74 ms | **0** |
| **Ponytail** | 96.0% (120/125) | 88.0% (110/125) | 242 t | 270 t | 328 t | 75 ms | 0 |
| **Caveman** | 96.0% (120/125) | 88.0% (110/125) | **196 t** | **226 t** | **259 t** | 74 ms | 0 |
| **Bare AI (Vanilla)** | **100.0%** (125/125) | **96.0%** (120/125) | 268 t | 306 t | 347 t | 74 ms | 0 |

---

## Category Breakdown

### Success Rate by Category (%)

| Category | Tasks | Grandpa | Ponytail | Caveman | Bare AI |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Networking** | 5 | **100%** (25/25) | 80% (20/25) | 80% (20/25) | **100%** (25/25) |
| **TypeScript** | 4 | **100%** (20/20) | 100% (20/20) | 100% (20/20) | **100%** (20/20) |
| **Node.js** | 4 | **100%** (20/20) | 100% (20/20) | 100% (20/20) | **100%** (20/20) |
| **Frontend** | 3 | **100%** (15/15) | 100% (15/15) | 100% (15/15) | **100%** (15/15) |
| **Bug Fixing** | 3 | **100%** (15/15) | 100% (15/15) | 100% (15/15) | **100%** (15/15) |
| **Security** | 2 | **100%** (10/10) | 100% (10/10) | 100% (10/10) | **100%** (10/10) |
| **Refactoring** | 2 | **100%** (10/10) | 100% (10/10) | 100% (10/10) | **100%** (10/10) |
| **Data & Filesystem** | 2 | **100%** (10/10) | 100% (10/10) | 100% (10/10) | **100%** (10/10) |

### Median TCS by Category (Tokens to Correct Solution)

| Category | Grandpa | Ponytail | Caveman | Bare AI |
|:---|:---:|:---:|:---:|:---:|
| **Networking** | 270 t | 271 t | 220 t | 287 t |
| **TypeScript** | 250 t | 207 t | 172 t | 253 t |
| **Node.js** | 291 t | 248 t | 197 t | 283 t |
| **Frontend** | 265 t | 213 t | 170 t | 250 t |
| **Bug Fixing** | 270 t | 239 t | 194 t | 268 t |
| **Security** | 273 t | 228 t | 193 t | 272 t |
| **Refactoring** | 242 t | 218 t | 183 t | 238 t |
| **Data & Filesystem** | 317 t | 271 t | 216 t | 317 t |

---

## Cold vs Warm Cache Latency

Execution latency was measured separately for the cold cache run (Run 1) and warm cache runs (Runs 2–5):

| Strategy | Cold Cache Median TTCS | Warm Cache Median TTCS | Cold Mean TTCS | Warm Mean TTCS |
|:---|---:|---:|---:|---:|
| **Grandpa** | 74 ms | 74 ms | 84.3 ms | 84.7 ms |
| **Ponytail** | 74 ms | 75 ms | 87.9 ms | 88.8 ms |
| **Caveman** | 74 ms | 74 ms | 89.4 ms | 91.8 ms |
| **Bare AI** | 74 ms | 74 ms | 84.6 ms | 84.8 ms |

---

## Analysis & Where Grandpa Performed Worse

### 1. Token Economy Tradeoff vs Code Golf
- **Caveman achieved the lowest Median TCS (196 tokens)** across successful tasks, compared to Grandpa's 270 tokens. Caveman achieves this by using single-letter identifiers (`u=>fetch(u)...`), omitting error checks, and stripping formatting.
- **However, Caveman suffered a lower first-pass rate (88% vs 96%)** and failed 20% of networking test runs because golfed snippets omitted HTTP response validation (`res.ok`) and timeout signals (`AbortSignal.timeout`).
- **Grandpa's design choice**: Grandpa intentionally generates defensive guards (`AbortSignal.timeout`, `if (!res.ok)`). This requires ~74 additional tokens on first-pass code compared to extreme golf, but yields 100% task completion without runtime hangs.

### 2. Grandpa vs Bare AI
- Bare AI and Grandpa both achieved 100% success rate and 96% first-pass rate on this task suite.
- On simple utility refactors (e.g. `refactor-date-formatter`, `ts-result-container`), Bare AI's median TCS was slightly lower (268 vs 270 tokens) because Bare AI used standard compact syntax without explicit defensive type checks.
- On networking tasks, Grandpa's median TCS was lower than Bare AI (270 tokens vs 287 tokens) due to concise native stdlib usage (`AbortSignal.timeout` vs manual `setTimeout`/`AbortController` boilerplate).

---

## Limitations

1. **Task Suite Size**: 25 tasks is an initial empirical milestone. A comprehensive proof requires expanding to the planned 100-task suite.
2. **Environment**: Benchmarks ran locally under Windows 10 with Node.js v22.14.0. Network calls were mocked in memory to test protocol failure modes (500 HTML bodies, stalls) without external network variability.
3. **Model Generation**: Candidates were evaluated using representative model generation profiles across the four prompt steering philosophies. Further multi-model runs (Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Flash) should be performed to measure cross-provider variance.

---

## Reproduction

To reproduce this benchmark and regenerate all 500 raw runs:

```powershell
npm run benchmark
```

Raw execution outputs are saved in timestamped JSON format under:
`benchmarks/results/raw/<timestamp>/run_<strategy>_<task>_<runIndex>.json`
Summary metrics are written to:
`benchmarks/results/latest-summary.json`
