# Example 5: UUID to Native Web Crypto (crypto.randomUUID)

### The Bloated Approach
```javascript
import { v4 as uuidv4 } from 'uuid';

export function createSession() {
  return {
    id: uuidv4(),
    createdAt: Date.now()
  };
}
```

### The Grandpa Native Approach
```javascript
// Built-in on Node 15.6+, Bun, Deno, and all modern browsers
export function createSession() {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now()
  };
}
```

### Savings
- **Eliminated**: `uuid` npm package.
- **Cryptographic guarantee**: Native OS-level CSPRNG entropy.
