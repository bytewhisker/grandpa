# Fetch JSON with Timeout and Status Check

Write an exported function `fetchJson(url, options = {})` that:
1. Performs an HTTP GET to `url` using native `fetch`.
2. Supports a `timeoutMs` option (default: 5000) using `AbortSignal.timeout`.
3. Validates `res.ok`. If status is not 2xx, throws an Error with the HTTP status.
4. Returns the parsed JSON data.
