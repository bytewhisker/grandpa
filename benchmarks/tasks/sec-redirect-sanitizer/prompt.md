# Open Redirect Attack Sanitizer

Write an exported function `sanitizeRedirectUrl(targetUrl, allowedHosts = ['example.com'])` that:
1. Validates that URL is either relative path (e.g. `/dashboard`) or matches `allowedHosts`.
2. Blocks protocol-relative URLs (`//evil.com`).
3. Blocks `javascript:` and `data:` URI schemes.
4. Returns sanitized URL string, or fallback path `'/'` if target is malicious/invalid.
