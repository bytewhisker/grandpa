# Debounce Function with Cancel & Flush

Write an exported function `debounce(fn, waitMs)` that:
1. Returns a debounced function delaying execution.
2. Exposes `.cancel()` to abort pending invocation.
3. Exposes `.flush()` to invoke immediately if pending.
