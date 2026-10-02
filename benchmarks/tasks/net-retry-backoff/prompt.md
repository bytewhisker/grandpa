# Fetch with Exponential Backoff Retry

Write an exported function `fetchWithRetry(fn, { maxRetries = 3, baseDelayMs = 50 } = {})` that:
1. Calls async function `fn()`.
2. If `fn()` resolves, returns the result immediately.
3. If `fn()` rejects, waits `baseDelayMs * 2^(attempt - 1)` and retries up to `maxRetries` times.
4. If retries are exhausted, throws the last error.
