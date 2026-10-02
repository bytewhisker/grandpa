# Example 6: Chalk / Kleur to Native ANSI Escape Codes

### The Bloated Approach
```javascript
import chalk from 'chalk';

console.log(chalk.green.bold('Server started on port 3000'));
console.log(chalk.red('Fatal error: connection refused'));
```

### The Grandpa Native Approach
```javascript
const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

console.log(`${ansi.green}${ansi.bold}Server started on port 3000${ansi.reset}`);
console.log(`${ansi.red}Fatal error: connection refused${ansi.reset}`);
```

### Savings
- **Eliminated**: `chalk` and its dependency tree.
- **Start-up time**: Instant Node startup without module resolution overhead.
