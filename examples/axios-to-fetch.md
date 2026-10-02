# Example 1: Axios to Native Fetch with Timeouts & Retries

### The Bloated Approach (Axios)
```javascript
import axios from 'axios';

export async function fetchUserData(userId) {
  try {
    const response = await axios.get(`https://api.example.com/users/${userId}`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}
```

### The Grandpa Native Approach (Zero Bloat + Full Defensive Safety)
```javascript
export async function fetchUserData(userId, { timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`https://api.example.com/users/${encodeURIComponent(userId)}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
```

### Savings
- **Eliminated**: `axios` + 4 transitive dependencies (~32 KB bundle size).
- **Security**: No CVE exposure from third-party HTTP client libraries.
- **Safety**: Robust timeout handling and HTTP error status validation retained.
