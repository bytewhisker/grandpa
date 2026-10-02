# Example 7: Dotenv to Node.js 20+ Native Environment Flags

### The Bloated Approach
```javascript
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;
```

### The Grandpa Native Approach
Node 20.6.0 introduced native `.env` loading directly into the Node binary.

In `package.json`:
```json
{
  "scripts": {
    "dev": "node --env-file=.env server.js",
    "prod": "node --env-file=.env.production server.js"
  }
}
```

In your application code:
```javascript
// Clean zero-import access
const port = process.env.PORT || 3000;
```

### Savings
- **Eliminated**: `dotenv` dependency and runtime import.
- **Portability**: Native engine flag supported across Node 20+.
