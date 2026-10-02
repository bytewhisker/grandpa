<p align="center">
  <img src="assets/banner.svg" width="100%" alt="Grandpa Banner" />
</p>

<h2 align="center">
  GRANDPA 🧓 — The Efficiency Layer for AI Coding Agents
</h2>

<p align="center">
  <b>Grandpa makes AI coding agents work smarter, not harder.</b><br>
  <em>Grandpa optimizes the entire path from idea to working code — using fewer tokens, fewer retries, and zero bloat.</em>
</p>

<p align="center">
  <a href="#quick-start"><b>Try Grandpa Free</b></a> •
  <a href="#empirical-benchmark-results"><b>View Live Benchmark</b></a> •
  <a href="https://github.com/bytewhisker/grandpa"><b>GitHub Repo</b></a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" /></a>
  <img src="https://img.shields.io/badge/Dependencies-Zero-success?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/Benchmark-100%25%20First--Pass%20(Live)-success?style=flat-square" alt="Live Benchmark" />
  <img src="https://img.shields.io/badge/Supports-25%2B%20Agents-blueviolet?style=flat-square" alt="25+ Agents" />
  <img src="https://img.shields.io/badge/MCP-Supported-black?style=flat-square" alt="MCP Server" />
</p>

<p align="center">
  <a href="README.md"><b>English</b></a> •
  <a href="README.es.md"><b>Español</b></a> •
  <a href="README.ko.md"><b>한국어</b></a> •
  <a href="README.zh.md"><b>中文</b></a>
</p>

---

### Why Grandpa?

> **Your AI coding agent is powerful. But it wastes too much.**

Every time you give a prompt to Claude Code, Cursor, Windsurf, Devin, or GitHub Copilot, you are paying in tokens and latency for four invisible forms of waste:

1. **Reading too much**: Dumps entire repositories into prompt context when a single file mattered.
2. **Speaking too much**: Spits out 5-paragraph architectural essays for a 2-line CSS fix.
3. **Building too much**: Pulls in bloated third-party npm packages (`axios`, `lodash`, `uuid`) when modern native runtime primitives exist.
4. **Retrying too much**: "Lazy" one-line code-golf rules strip timeouts, drop `res.ok`, and skip null safety—causing runtime 500 crashes and expensive multi-turn debugging cycles.

**Grandpa is not code golf.** Correctness is a hard requirement.

Grandpa minimizes **TCS (Tokens to Correct Solution)** across the whole development loop by giving your coding agent four simple instincts:

```text
SPEAK LESS  → Precise, zero-chatter code generation
READ LESS   → Relevance-bounded context retrieval (<3 files)
BUILD LESS  → Native standard library primitives first (Zero npm bloat)
RETRY LESS  → Hardened production safeguards (res.ok, timeouts, null checks)
```

```text
NORMAL AGENT
  reads 18 files
  loads 21K context tokens
  adds external npm dependency
  writes bloated patch
  runs entire test suite
  fails on stalled network
  feeds huge 4,000-line error log back
  repairs over multiple turns
  TOTAL: 6,840 tokens | 2 attempts | 9.8 sec

GRANDPA (Quick / Standard / Deep)
  identifies relevant target file (<3 files)
  reuses native runtime stdlib
  generates defensive patch (status checks, timeouts preserved)
  runs targeted isolated verification
  PASSES on first turn & STOPS immediately
  TOTAL: 270 tokens | 1 attempt | 74 ms
```

---

### Key Pillars & What Ponytail Doesn't Have

| Feature | Ponytail | Grandpa Standard | Why It Matters |
|:---|:---:|:---:|:---|
| **Supported Agents** | 20 agents | **25+ agents** | Cursor, Windsurf, Claude Code, Copilot, Cline, Codex, Devin, Grok, Kiro, OpenClaw, OpenCode, Qoder, Antigravity, Roo Code, Aider, Zed, Continue, Pi |
| **Architectural Skills** | 6 skills | **8 skills** | Core, Audit, Review, Debt, **Guard**, **Migrate**, Gain, Help |
| **Active CLI Scanner** | ❌ None | **`npx grandpa scan`** | Scans real repos, grades codebases (A+ to F), catches fragile fetch patterns |
| **Git Pre-Commit Guard** | ❌ None | **`npx grandpa hook`** | Mechanically blocks AI models from committing unapproved dependencies |
| **MCP Server** | Basic | **Full Model Context Protocol** | Native JSON-RPC server with tools: `grandpa_scan`, `grandpa_audit`, `grandpa_guard`, `grandpa_migrate`, `grandpa_rules` |
| **Real-Time Guard Hook** | ❌ None | **Active PreTool Hook** | Intercepts `npm install axios/lodash/uuid` commands in real time |
| **Benchmark Suite** | LOC-only (golfing) | **Multi-dimensional** | Measures bloat, LOC, adversarial robustness, and defensive safety (92% vs 73%) |
| **Before/After Demos** | 11 examples | **16 examples** | Real-world diffs across frontend, backend, CLI, Python, React |

---

### Live CLI Demonstration

Run Grandpa directly in any project directory:

```bash
npx github:bytewhisker/grandpa scan
```

```text
┌                                                                         ┐
  Welcome to Grandpa
   ▄███▄  ████▄   ▄███▄  ██   ██ ████▄  ████▄   ▄███▄       ▄▄██████▄▄   
  ██   ▀  ██  ██ ██   ██ ███  ██ ██  ██ ██  ██ ██   ██    ▄██▀██████▀██▄ 
  ██ ▄▄▄  ████▀  ███████ ██ █ ██ ██  ██ ████▀  ███████   ██ ██▀█▄▄█▀██ ██
  ██   ██ ██  ██ ██   ██ ██  ███ ██  ██ ██     ██   ██   ██ ██▄█▀▀█▄██ ██
   ▀███▀  ██  ██ ██   ██ ██   ██ ████▀  ██     ██   ██    ▀██▄██████▄██▀ 
                                                               ▀████████▀   
└                                                     CLI Version 1.0.0 ┘
 Version 1.0.0 · Engineered by Mahadi (@bytewhisker)

Target Directory: /workspace/my-app

--- DEPENDENCY AUDIT ---
  Found 3 package(s) that can be replaced with native built-ins:

  • uuid (v9.0.1)
    Grandpa's Native Fix: crypto.randomUUID()
    Native standard library in Node.js and all modern browsers. (Supported in Node 14.17+)

  • lodash.clonedeep (v4.5.0)
    Grandpa's Native Fix: structuredClone(obj)
    Native deep cloning built into modern JavaScript runtimes. (Supported in Node 17.0+)

  • rimraf (v5.0.5)
    Grandpa's Native Fix: fs.rmSync(path, { recursive: true, force: true })
    Native recursive directory deletion in Node.js fs. (Supported in Node 14.14+)

  ┌── AUDIT SUMMARY ──────────────────────────────────────┐
  │  Codebase Score:   55/100
  │  Health Rating:    C (Noticeable dependency bloat)
  │  Dependency Bloat: 3 package(s)
  └───────────────────────────────────────────────────────┘
```

---

### Head-to-Head Comparison

| Metric | Vanilla AI Agent | "Lazy" Prompt (Ponytail) | Grandpa Standard |
| :--- | :---: | :---: | :---: |
| **New Dependencies Added** | Heavy (npm bloat) | Low | **Zero (Stdlib First)** |
| **Code Verbosity** | 100% (Over-engineered) | ~40% (Golfed one-liners) | **~45% (Focused & Readable)** |
| **HTTP Status Checking** | Inconsistent | ❌ Frequently stripped | **Guaranteed (`res.ok` required)** |
| **Network Timeout Aborts** | Rarely included | ❌ Omitted | **Guaranteed (`AbortSignal.timeout`)** |
| **Framework Awareness** | Generic | ❌ Breaks on hydration | **Next.js & React 19 safe** |
| **Active CLI Scanner** | None | None | **Built-in (`npx ... scan`)** |
| **Git Pre-Commit Guard** | None | None | **Built-in (`npx ... hook`)** |
| **MCP Server Integration** | None | Basic | **Built-in (`npx ... mcp`)** |

---

### The 8 Specialized Skills

Grandpa includes 8 specialized skills for every stage of development:

1. **`grandpa`**: Core architectural engine and decision ladder.
2. **`grandpa-audit`**: Scans whole codebase for bloat, fragile patterns, and framework debt.
3. **`grandpa-review`**: Line-by-line PR & diff review for unnecessary complexity.
4. **`grandpa-debt`**: Tracks and schedules payoff of architectural exception receipts.
5. **`grandpa-guard`**: Real-time safety guard against dangerous AI generation patterns.
6. **`grandpa-migrate`**: Step-by-step migration plans from bloated dependencies to native stdlib.
7. **`grandpa-gain`**: Quantifies dependencies, bundle size, and maintenance hours saved.
8. **`grandpa-help`**: Instant cheat sheet and replacement reference table.

---

### Grandpa Model Context Protocol (MCP) Server

Connect Grandpa directly to Claude Desktop, Cursor, Windsurf, or any MCP client:

```json
{
  "mcpServers": {
    "grandpa": {
      "command": "npx",
      "args": ["-y", "@bytewhisker/grandpa", "mcp"]
    }
  }
}
```

Exposes tools:
- `grandpa_scan`: Scans repo for bloat & fragile patterns.
- `grandpa_audit`: Returns scored codebase report (A+ to F).
- `grandpa_guard`: Pre-execution validation of code and bash commands.
- `grandpa_migrate`: Provides stdlib drop-in code for bloated packages.
- `grandpa_rules`: Injects intensity-specific system instructions.

---

### 16 Battle-Tested Examples

Browse our collection of 16 real-world before/after demonstrations in [`examples/`](examples/):
- [Axios to Native Fetch with Timeouts & Retries](examples/axios-to-fetch.md)
- [Moment.js to Native Intl & Date](examples/moment-to-intl.md)
- [Lodash to Native ES6+ & structuredClone](examples/lodash-to-native.md)
- [Classnames to Template Literals](examples/classnames-to-template.md)
- [UUID to Web Crypto](examples/uuid-to-crypto.md)
- [Chalk to Native ANSI](examples/chalk-to-ansi.md)
- [Dotenv to Node 20 Flags](examples/dotenv-to-node20.md)
- [Rimraf & Mkdirp to node:fs](examples/rimraf-mkdirp-to-fs.md)
- [Zero-Dependency Debounce & Throttle](examples/debounce-throttle.md)
- [Deep Clone via structuredClone](examples/deep-clone.md)
- [Zero-Dependency CSV Parser](examples/csv-parser.md)
- [In-Memory Token Bucket Rate Limiter](examples/rate-limiter.md)
- [Query-String to URLSearchParams](examples/url-search-params.md)
- [Minimal FastAPI Pattern](examples/fastapi-minimal.md)
- [React Countdown Timer](examples/react-countdown-timer.md)
- [Glob to Node 20 fs.readdir Recursive](examples/glob-to-fs.md)

---

### Empirical Benchmark Results

We benchmarked Grandpa against Ponytail, Caveman, and Bare AI across two rigorous environments: **Live Real-LLM inference** with exact provider token accounting and a **500-run multi-turn repair suite** across 25 production tasks.

---

#### 1. Live Real-LLM Benchmark (Google Gemini Live API)

*Evaluated live with real provider token accounting (`prompt_tokens`, `completion_tokens`), real model network latency, isolated subprocess execution, and automated multi-turn repair loops.*

| Strategy | Success Rate (Gate) | 1st-Pass Rate | Median TCS | p75 TCS | Failure-Aware Efficiency<br>*(Tokens / Solved Task)* | Median TTCS |
|:---|---:|---:|---:|---:|---:|---:|
| **Grandpa (Quick)** | **100.0%** (30/30) | **100.0%** (30/30) | 356 t | **462 t** | **403 t / solved** | 1,530 ms |
| **Ponytail** | 83.3% (25/30) | 63.3% (19/30) | **225 t** | 340 t | 592 t / solved | **1,223 ms** |
| **Caveman** | **100.0%** (30/30) | 63.3% (19/30) | 335 t | 749 t | 598 t / solved | 1,613 ms |
| **Bare AI (Vanilla)** | **100.0%** (30/30) | 53.3% (16/30) | 1,011 t | 2,041 t | 1,490 t / solved | 3,669 ms |

$$\text{Failure-Aware Efficiency} = \frac{\text{Total Tokens Consumed Across Entire Workflow}}{\text{Tasks Successfully Solved}}$$

> **Why Grandpa Wins the Workflow:**  
> Minimalist "code-golf" approaches look cheap on turn 1, but frequently strip status checks, timeouts, or clean exports—causing **37% first-pass failure rates** on real LLMs. Multi-turn repair loops rapidly burn tokens.  
> **Grandpa achieves 100% first-pass pass rate** with standard defensive guards, saving **~32% total workflow tokens** over Ponytail/Caveman and **73%** over unsteered Bare AI.

---

#### 2. Comprehensive 500-Run Suite (25 Tasks × 5 Repetitions)

*Data source: 500 isolated runs across 8 software engineering domains recorded in [`benchmarks/results/latest-summary.json`](benchmarks/results/latest-summary.json).*

| Strategy | Success Rate | First-Pass Rate | Median TCS | p75 TCS | p95 TCS | Median TTCS | Dependencies Added |
|:---|---:|---:|---:|---:|---:|---:|---:|
| **Grandpa** | **100.0%** | **96.0%** | 270 t | 298 t | 363 t | 74 ms | **0** |
| **Ponytail** | 96.0% | 88.0% | 242 t | 270 t | 328 t | 75 ms | 0 |
| **Caveman** | 96.0% | 88.0% | **196 t** | **226 t** | **259 t** | 74 ms | 0 |
| **Bare AI (Vanilla)** | **100.0%** | **96.0%** | 268 t | 306 t | 347 t | 74 ms | 0 |

> *"Output tokens are cheap. Debugging turns aren't. Grandpa optimizes the whole coding loop."*

See complete methodology, per-task breakdowns, and failure analysis in [`benchmarks/REPORT.md`](benchmarks/REPORT.md).

Run the benchmarks:
```bash
# Run 500-run comprehensive suite
npm run benchmark

# Run live real-LLM benchmark (requires API key in .env)
node --env-file=.env benchmarks/live-harness.js
```

---

### Quick Start

#### 1. Audit Your Project for Bloat
Run directly from GitHub or npm:
```bash
# Direct from GitHub (always latest)
npx github:bytewhisker/grandpa scan

# Or via npm
npx @bytewhisker/grandpa scan
```

#### 2. Install Rules Into Your Workspace (25+ Agents)
Installs configurations for Cursor, Windsurf, Claude Code, Antigravity, and 20+ other agents in one command:
```bash
npx github:bytewhisker/grandpa init
```

#### 3. Enable Git Pre-Commit Guard
Blocks AI coding assistants from silently adding unvetted dependencies to `package.json`:
```bash
npx github:bytewhisker/grandpa hook
```

---

### Continuous Integration (CI/CD)

Enforce zero-bloat architecture automatically in your GitHub Actions pipeline:

```yaml
name: Grandpa Architecture Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx github:bytewhisker/grandpa scan --strict
```

---

### License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

### Author & Credits

```text
╭──────────────────────────╮
│  GRANDPA 🧓              │
│  AI Coding Optimizer     │
│                          │
│  Engineered by Mahadi    │
│  @bytewhisker            │
╰──────────────────────────╯
```

Designed & engineered by **[Mahadi](https://github.com/bytewhisker)** ([@bytewhisker](https://github.com/bytewhisker))  
*© 2026 Grandpa / ByteWhisker. All rights reserved.*
