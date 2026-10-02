# Example 9: Debounce & Throttle (Zero Dependencies)

### The Bloated Approach
```javascript
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
```

### The Grandpa Native Approach
```javascript
export function debounce(fn, waitMs) {
  let timeoutId = null;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), waitMs);
  };
}

export function throttle(fn, limitMs) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}
```

### Savings
- **Eliminated**: `lodash.debounce` and `lodash.throttle`.
- **Transparency**: 100% understandable, easy to debug in dev tools.
