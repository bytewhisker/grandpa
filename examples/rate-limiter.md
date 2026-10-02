# Example 12: In-Memory Token Bucket Rate Limiter

### The Bloated Approach
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
```

### The Grandpa Native Approach
```javascript
export function createRateLimiter({ windowMs = 60000, maxRequests = 60 } = {}) {
  const store = new Map();

  return function checkLimit(key) {
    const now = Date.now();
    const client = store.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > client.resetTime) {
      client.count = 1;
      client.resetTime = now + windowMs;
    } else {
      client.count += 1;
    }

    store.set(key, client);

    const allowed = client.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - client.count);

    return { allowed, remaining, resetTime: client.resetTime };
  };
}
```

### Savings
- **Eliminated**: 24 KB `express-rate-limit` + memory bloat.
- **Portability**: Works identically in Node.js, Cloudflare Workers, Next.js API routes, Bun, and Deno.
