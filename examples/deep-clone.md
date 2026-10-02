# Example 10: Deep Clone via structuredClone

### The Bloated Approach
```javascript
import cloneDeep from 'lodash.clonedeep';

const copy = cloneDeep(complexState);
```

### The Grandpa Native Approach
```javascript
// Native Web & Node.js API (HTML Structured Clone Algorithm)
const copy = structuredClone(complexState);
```

### What structuredClone Handles:
- Cycles and recursive references
- `Map`, `Set`, `Date`, `RegExp`
- `ArrayBuffer`, `TypedArray`
- Arbitrary nested objects and arrays

### Savings
- **Eliminated**: 18 KB `lodash.clonedeep`
- **Native C++ Performance**: Directly executed in V8 memory without recursion call stack limits.
