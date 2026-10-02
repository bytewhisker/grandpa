# Example 13: Query-String to URLSearchParams

### The Bloated Approach
```javascript
import queryString from 'query-string';

const parsed = queryString.parse('?tab=profile&page=2');
const stringified = queryString.stringify({ sort: 'desc', limit: 10 });
```

### The Grandpa Native Approach
```javascript
// Native URLSearchParams
const params = new URLSearchParams('?tab=profile&page=2');
const tab = params.get('tab');
const page = Number(params.get('page'));

// Stringify
const out = new URLSearchParams({ sort: 'desc', limit: '10' }).toString();
```

### Savings
- **Eliminated**: 32 KB `query-string` / `qs` libraries.
