# Example 3: Lodash to Native ES6+ Features

### The Bloated Approach (Lodash)
```javascript
import _ from 'lodash';

const name = _.get(user, 'profile.name', 'Anonymous');
const uniqueIds = _.uniq([1, 2, 2, 3, 4, 4]);
const cloned = _.cloneDeep(state);
```

### The Grandpa Native Approach
```javascript
// Safe nested access: optional chaining + nullish coalescing
const name = user?.profile?.name ?? 'Anonymous';

// Deduplication: Set
const uniqueIds = Array.from(new Set([1, 2, 2, 3, 4, 4]));

// Deep cloning: native structuredClone
const cloned = structuredClone(state);
```

### Savings
- **Eliminated**: `lodash` (71 KB minified).
- **Execution speed**: `structuredClone` runs in native engine memory, outperforming userland JS recursive loops.
