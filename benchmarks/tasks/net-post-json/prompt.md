# HTTP POST with JSON Body and Headers

Write an exported function `postJson(url, body, options = {})` that:
1. Sends a POST request with JSON-serialized `body`.
2. Sets 'Content-Type': 'application/json' in headers (merging any custom headers).
3. Supports a `timeoutMs` option (default: 5000).
4. Asserts `res.ok` and returns parsed response JSON.
