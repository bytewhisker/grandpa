# Platform Native Standard Library Catalog

Grandpa mandates utilizing modern built-in runtime APIs before reaching for third-party packages.

---

## JavaScript / Node.js Standard Capabilities

### 1. HTTP Networking (`fetch`)
- **Node Version**: Node 18.0.0+ (native global `fetch`, `Headers`, `Request`, `Response`, `FormData`).
- **Timeouts**: Supported natively via `AbortController` and `AbortSignal.timeout(ms)`.

### 2. Cryptography & Randomness (`crypto`)
- **UUID v4**: `crypto.randomUUID()` (Node 15.6+).
- **Hashing**: `crypto.createHash('sha256').update(data).digest('hex')`.

### 3. Deep Object Cloning (`structuredClone`)
- **Support**: Node 17.0.0+ and all browsers.
- Clones cyclic graphs, Dates, RegExps, Buffers, Maps, and Sets.

### 4. Internationalization & Formatting (`Intl`)
- **Dates**: `new Intl.DateTimeFormat(locale, options).format(date)`.
- **Numbers & Currency**: `new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount)`.
- **Relative Time**: `new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day')`.
- **Lists**: `new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(['Apple', 'Banana'])`.

### 5. Filesystem Utilities (`node:fs`)
- **Recursive Directory Removal**: `fs.rmSync(path, { recursive: true, force: true })` (Node 14.14+).
- **Recursive Directory Creation**: `fs.mkdirSync(path, { recursive: true })` (Node 10.12+).
- **Recursive Directory Traversal**: `fs.readdirSync(path, { recursive: true })` (Node 20.1+).

---

## Python Standard Capabilities

- **SQLite**: Built-in `sqlite3` module.
- **HTTP**: `urllib.request` or native asynchronous sockets.
- **Data Validation & JSON**: Built-in `json`, `dataclasses`, `typing`.
- **Concurrency**: `asyncio`, `concurrent.futures`.
