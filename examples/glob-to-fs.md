# Example 16: Glob to Node.js 20+ fs.readdir Recursive

### The Bloated Approach
```javascript
import { glob } from 'glob';

const jsFiles = await glob('src/**/*.js');
```

### The Grandpa Native Approach
```javascript
import fs from 'node:fs/promises';
import path from 'node:path';

// Node 20.1+ native recursive directory traversal
const entries = await fs.readdir('src', { recursive: true, withFileTypes: true });
const jsFiles = entries
  .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
  .map(entry => path.join(entry.path || entry.parentPath, entry.name));
```

### Savings
- **Eliminated**: `glob` package (35 KB, plus minimatch, brace-expansion, path-scurry).
- **Speed**: Pure C++ libuv filesystem calls without intermediate glob regex compilation.
