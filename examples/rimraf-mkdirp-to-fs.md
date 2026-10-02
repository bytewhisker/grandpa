# Example 8: Rimraf & Mkdirp to node:fs Recursive Operations

### The Bloated Approach
```javascript
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';

rimraf.sync('./dist');
mkdirp.sync('./dist/assets');
```

### The Grandpa Native Approach
```javascript
import fs from 'node:fs';

// Rimraf equivalent (Node 14.14+)
fs.rmSync('./dist', { recursive: true, force: true });

// Mkdirp equivalent (Node 10.12+)
fs.mkdirSync('./dist/assets', { recursive: true });
```

### Savings
- **Eliminated**: `rimraf` and `mkdirp` (and their nested dependency trees).
- **Standard**: Official `node:fs` standard library primitives.
