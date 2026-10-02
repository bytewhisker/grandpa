---
name: grandpa-migrate
description: Migrate an existing codebase from bloated dependencies to native stdlib alternatives. Provides step-by-step migration plans with rollback safety.
---

# Grandpa Migrate: Dependency-to-Native Migration Engine

Analyze the project's dependency tree and produce a prioritized migration plan to replace bloated packages with native stdlib alternatives.

## Migration Database

### JavaScript / Node.js
| Package | Native Replacement | Since | Migration Effort |
|:---|:---|:---|:---|
| `uuid` | `crypto.randomUUID()` | Node 14.17+ | Trivial |
| `lodash.clonedeep` | `structuredClone(obj)` | Node 17+ | Trivial |
| `rimraf` | `fs.rmSync(p, { recursive: true, force: true })` | Node 14.14+ | Trivial |
| `mkdirp` | `fs.mkdirSync(p, { recursive: true })` | Node 10.12+ | Trivial |
| `node-fetch` / `cross-fetch` / `isomorphic-fetch` | `fetch()` | Node 18+ | Low |
| `querystring` | `new URLSearchParams()` | Node 10+ | Low |
| `left-pad` | `str.padStart(n, ch)` | ES2017 | Trivial |
| `is-odd` / `is-even` | `n % 2 !== 0` / `n % 2 === 0` | Always | Trivial |
| `is-number` | `typeof n === 'number' && !isNaN(n)` | Always | Trivial |
| `object-assign` | `Object.assign()` or `{ ...obj }` | ES2015 | Trivial |
| `array-flatten` / `flatten` | `arr.flat(Infinity)` | Node 12+ | Trivial |
| `moment` / `dayjs` | `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` | Modern | Medium |
| `classnames` / `clsx` | Template literals: `` `${base} ${cond && cls}` `` | Always | Low |
| `dotenv` | `node --env-file=.env` | Node 20.6+ | Low |
| `axios` | `fetch()` + `AbortSignal.timeout()` | Node 18+ | Medium |
| `chalk` | `util.styleText()` or ANSI escape sequences | Node 21+ | Low |
| `glob` | `fs.globSync()` | Node 22+ | Low |
| `assert` (npm) | `node:assert` | Always | Trivial |

### Python
| Package | Native Replacement | Since | Migration Effort |
|:---|:---|:---|:---|
| `os.path` calls | `pathlib.Path` | Python 3.4+ | Low |
| `toml` | `tomllib` | Python 3.11+ | Trivial |
| `typing_extensions` (most) | `typing` | Python 3.10+ | Low |
| `dataclasses-json` | `dataclasses` + `json` | Python 3.7+ | Medium |
| `python-dotenv` | `os.environ` + shell export | Always | Low |
| `requests` (simple GETs) | `urllib.request` | Always | Low |

### Go
| Package | Native Replacement | Since | Migration Effort |
|:---|:---|:---|:---|
| `gorilla/mux` | `net/http.ServeMux` (pattern matching) | Go 1.22+ | Medium |
| `logrus` / `zap` (simple) | `log/slog` | Go 1.21+ | Medium |
| `strconv` helpers | `fmt.Sprintf` | Always | Trivial |
| `sort` custom | `slices.SortFunc` | Go 1.21+ | Low |

## Migration Plan Output

```
GRANDPA MIGRATION PLAN
======================
Repository: <name>
Packages to migrate: <count>
Estimated effort: <hours>

PHASE 1: TRIVIAL (< 5 min each)
  1. uuid -> crypto.randomUUID()
     Files: src/id.js, src/user.js
     Find: import { v4 as uuidv4 } from 'uuid'
     Replace: // grandpa: native crypto stdlib
              const id = crypto.randomUUID();
     After: npm uninstall uuid

PHASE 2: LOW EFFORT (< 30 min each)
  ...

PHASE 3: MEDIUM EFFORT (< 2 hours each)
  ...

ROLLBACK: If any migration causes issues:
  git stash && npm install <package>
```
