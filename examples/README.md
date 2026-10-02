# Grandpa Architecture Real-World Examples

A collection of 16 battle-tested before/after demonstrations showing how Grandpa eliminates third-party dependencies in favor of modern standard library primitives while strictly maintaining defensive production safety.

## Doctrine: Cut the fat, never cut the bone.
Every example here demonstrates removing external npm packages **without** sacrificing error boundaries, timeouts, or edge-case handling.

---

## Catalog of Examples

| Example | Bloat Eliminated | Native Standard Library Solution | Bundle Saved |
|:---|:---|:---|--:|
| [1. Axios to Native Fetch](./axios-to-fetch.md) | `axios` (32 KB) | `fetch()`, `AbortController`, `Response` | ~32 KB |
| [2. Moment / Dayjs to Intl](./moment-to-intl.md) | `moment` (290 KB), `dayjs` (7 KB) | `Intl.DateTimeFormat`, `Date` | ~290 KB |
| [3. Lodash to Native ES6+](./lodash-to-native.md) | `lodash` (71 KB) | `structuredClone`, `?.`, `??`, `Set` | ~71 KB |
| [4. Classnames to Template Strings](./classnames-to-template.md) | `classnames` (2 KB), `clsx` (1.5 KB) | Array filter / Template literals | ~2 KB |
| [5. UUID to Native Web Crypto](./uuid-to-crypto.md) | `uuid` (12 KB) | `crypto.randomUUID()` | ~12 KB |
| [6. Chalk to Native ANSI](./chalk-to-ansi.md) | `chalk` (15 KB), `kleur` (4 KB) | Native terminal ANSI escape codes | ~15 KB |
| [7. Dotenv to Node 20 Flags](./dotenv-to-node20.md) | `dotenv` (7 KB) | `node --env-file=.env` | ~7 KB |
| [8. Rimraf & Mkdirp to node:fs](./rimraf-mkdirp-to-fs.md) | `rimraf` (9 KB), `mkdirp` (6 KB) | `fs.rmSync`, `fs.mkdirSync({ recursive: true })` | ~15 KB |
| [9. Debounce & Throttle](./debounce-throttle.md) | `lodash.debounce`, `throttle-debounce` | 10-line closure | ~8 KB |
| [10. Deep Clone](./deep-clone.md) | `lodash.clonedeep` | `structuredClone()` | ~18 KB |
| [11. CSV Parser](./csv-parser.md) | `papaparse` (48 KB) | Native streaming / regex parser | ~48 KB |
| [12. Rate Limiter](./rate-limiter.md) | `express-rate-limit` (24 KB) | Token bucket with `Map` + timestamps | ~24 KB |
| [13. URL Search Params](./url-search-params.md) | `query-string` (11 KB), `qs` (32 KB) | `URLSearchParams`, `URL` | ~32 KB |
| [14. Minimal FastAPI Pattern](./fastapi-minimal.md) | Heavy ORMs & complex abstractions | Native Pydantic + stdlib SQLite/Postgres | ~150 MB |
| [15. React Countdown Timer](./react-countdown-timer.md) | `react-countdown`, `use-interval` | Native `useEffect` + `setInterval` | ~10 KB |
| [16. Glob to Node 20 fs.readdir](./glob-to-fs.md) | `glob` (35 KB) | `fs.readdirSync(path, { recursive: true })` | ~35 KB |
