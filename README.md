<p align="center">
  <img src="assets/banner.svg" width="100%" alt="Grandpa Banner" />
</p>

<h3 align="center">
  Battle-Tested, Zero-Bloat Architecture Engine and CLI Scanner for AI Coding Agents
</h3>

<p align="center">
  <em>"Cut the fat, never cut the bone."</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" /></a>
  <img src="https://img.shields.io/badge/Dependencies-Zero-success?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/Works%20With-Cursor%20%7C%20Claude%20%7C%20Windsurf%20%7C%20Antigravity-orange?style=flat-square" alt="Compatibility" />
</p>

---

### The Problem

Modern AI coding agents (Cursor, Claude Code, Copilot, Windsurf) have an acute design flaw: **dependency infection and architectural drift**.

* You ask for a unique ID; the agent runs `npm install uuid`.
* You ask for deep cloning; it pulls in `lodash.clonedeep`.
* You ask for an API call; it installs `axios` and writes a 40-line service factory with three layers of synthetic abstractions.

Other minimalist rulesets try to solve this by telling the AI to *"write one-liners and be lazy."* That creates a worse disaster: models skip HTTP status checks (`if (!res.ok)`), drop timeout aborts, and strip null safety, causing silent crashes in production.

**Grandpa solves both.**

Grandpa channels a veteran principal engineer who has been paged at 3:00 AM for fragile code. It enforces: **Cut the FAT (abstractions, dependency slop), but NEVER cut the BONE (status checks, timeouts, null safety, accessibility).**

---

### Key Features

* **Zero-Dependency CLI Auditor (`npx @bytewhisker/grandpa scan`):** Automatically scans your `package.json` and codebase to identify replaceable packages and fragile code patterns.
* **The Structural Integrity Doctrine:** Enforces standard library utilization without sacrificing production safety.
* **Pre-Commit Git Guard (`npx @bytewhisker/grandpa hook`):** Intercepts AI coding agents when they silently attempt to stage unvetted dependencies into your repository.
* **Multi-Agent Universal Standard:** First-class profiles for Claude Code, Cursor (`.mdc`), Windsurf (`.windsurfrules`), and Antigravity.

---

### Live CLI Demonstration

Run Grandpa directly in any project directory:

```bash
npx @bytewhisker/grandpa scan
```

```text
   ____                          _             
  / ___|_ __ __ _ _ __   __| |_ __   __ _ 
 | |  _| '__/ _` | '_ \ / _` | '_ \ / _` |
 | |_| | | | (_| | | | | (_| | |_) | (_| |
  \____|_|  \__,_|_| |_|\__,_| .__/ \__,_|
                             |_|          
  "Back in my day, we didn't install 500MB of node_modules."
  Battle-Tested, Zero-Bloat Architecture for AI Agents
======================================================

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

======================================================
  Grandpa's Codebase Score: 55/100
  Rating:                  C (Grandpa is Grumpy: noticeable bloat)
======================================================
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
| **Codebase Scanner CLI** | None | None | **Built-in (`npx ... scan`)** |
| **Git Pre-Commit Guard** | None | None | **Built-in (`npx ... hook`)** |

---

### Code Diff Comparisons

#### 1. Fetching Data from an API Endpoint

**The Fragile "Lazy" Approach (Breaks on 404/500, hangs on network drop):**
```javascript
// Fragile one-liner:
const data = await fetch(url).then(r => r.json());
```

**The Grandpa Standard (5 lines, zero dependencies, completely production-safe):**
```javascript
// grandpa: native fetch with timeout and status verification
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
return res.json();
```

---

#### 2. Deep Object Cloning

**Standard AI Bloat:**
```javascript
import cloneDeep from 'lodash.clonedeep';
const copy = cloneDeep(original);
```

**The Grandpa Standard:**
```javascript
// grandpa: native runtime standard library
const copy = structuredClone(original);
```

---

#### 3. Generating a Unique Identifier (UUID)

**Standard AI Bloat:**
```javascript
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

**The Grandpa Standard:**
```javascript
// grandpa: native crypto stdlib
const id = crypto.randomUUID();
```

---

### The Grandpa Decision Ladder

Before generating code, the agent climbs this 5-stage checklist:

1. **YAGNI (You Ain't Gonna Need It):** Speculative future requirement? Skip it and state so in one line.
2. **Codebase Check:** Does a helper, utility, or type already exist in this repository? Look before writing. Re-implementing existing code is sloppy.
3. **Modern Stdlib:**
   * **Node.js 18+:** Native `fetch()`, `crypto.randomUUID()`, `structuredClone()`, `URLSearchParams`, `fs.rmSync({ recursive: true })`.
   * **Python 3.11+:** `pathlib.Path`, `tomllib`, `asyncio`.
4. **Platform Native:** Built-in HTML (`<dialog>`, `<input type="date">`, `<details>`), CSS transitions over JS libraries, and database constraints over duplicate application logic.
5. **The Structural Integrity Guard:** Write the cleanest code that works, but keep status checks and timeouts intact. Never write fragile code-golf.

---

### Quick Start

#### 1. Audit Your Project for Bloat
```bash
npx @bytewhisker/grandpa scan
```

#### 2. Install Rules Into Your Workspace
Installs configurations for Cursor, Windsurf, and Claude Code/Antigravity in one command:
```bash
npx @bytewhisker/grandpa init
```

#### 3. Enable Git Pre-Commit Guard
Blocks AI coding assistants from silently adding unvetted dependencies to `package.json`:
```bash
npx @bytewhisker/grandpa hook
```

---

### Manual Agent Configuration

#### For Cursor
Grandpa is provided in the modern Cursor Rules format. Place the rule inside `.cursor/rules/grandpa.mdc`:
```yaml
---
description: "Grandpa - Zero-bloat, battle-tested engineering standard"
alwaysApply: true
---
```
*(Copy the full specification from [`rules/grandpa.md`](rules/grandpa.md)).*

#### For Claude Code
Add the skill to your Claude Code workspace:
```bash
npx @bytewhisker/grandpa init
```

#### For Antigravity
Place `rules/grandpa.md` into your workspace customization root under `.agents/rules/grandpa.md`.

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
      - run: npx @bytewhisker/grandpa scan --strict
```

---

### License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

### Author

Developed by **[ByteWhisker](https://github.com/bytewhisker)**  
*Creative Systems Architect and Open Source Tooling Engineer*
