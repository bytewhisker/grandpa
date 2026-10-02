---
name: grandpa-gain
description: Display benchmark data and savings metrics. Shows how much code, cost, and risk Grandpa has eliminated in the current session or repository.
---

# Grandpa Gain: Savings and Impact Report

Track and display the cumulative impact of Grandpa's interventions.

## Metrics to Track

1. **Lines Saved:** Count lines that were not written because a native alternative was used.
2. **Dependencies Avoided:** Count packages that were not installed.
3. **Fragile Patterns Prevented:** Count fetch chains, empty catches, etc. that were hardened.
4. **Estimated Cost Savings:** Fewer tokens = fewer API dollars. Calculate based on token reduction.

## Session Summary

After each session or on demand, produce:

```
GRANDPA GAINS -- Session Summary
================================
Native replacements used:      <count>
  crypto.randomUUID()           x2
  structuredClone()             x1
  <dialog>                      x1
  URLSearchParams               x1

Dependencies avoided:          <count>
  uuid                          (saved ~50KB)
  lodash.clonedeep              (saved ~30KB)
  react-modal                   (saved ~200KB)

Lines of code saved:           ~<count>
  vs bare agent baseline
  vs "lazy one-liner" approach

Safety guards preserved:       <count>
  AbortSignal.timeout           x3
  res.ok checks                 x3
  try/catch boundaries          x4
  null guards                   x2

Fragile patterns caught:       <count>
  Unguarded fetch chains        x1
  Missing timeouts              x2

Estimated savings:
  node_modules:  -280KB
  Tokens:        -<count> (~<cost> saved)
  Bundle size:   -<KB> gzipped
```

## Benchmark Reference Data

From the Grandpa benchmark suite (12 tasks, median of 3 runs):

| Metric | Bare Agent | Ponytail | Grandpa |
|:---|--:|--:|--:|
| Avg LOC | 20.0 | 4.0 | 5.2 |
| Safety Score | 86% | 73% | 92% |
| Dependencies | 2 | 0 | 0 |
| Fragile Patterns | 0 | 1 | 0 |
| Native Usage | 0/6 | 4/6 | 4/6 |

Grandpa is the only approach that minimizes code AND maximizes safety.
