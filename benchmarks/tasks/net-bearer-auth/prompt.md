# API Client with 401 Token Refresh

Write an exported function `createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch })` returning an object with:
`request(url, options = {})`:
1. Attaches 'Authorization: Bearer <token>' from `getAccessToken()`.
2. Sends the request.
3. If response status is 401, calls `refreshAccessToken()` exactly once, updates header with new token, and retries the request.
4. If retry also returns 401, returns response or throws error without infinite loop.
