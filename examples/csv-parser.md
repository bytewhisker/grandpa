# Example 11: Zero-Dependency CSV Parser

### The Bloated Approach
```javascript
import Papa from 'papaparse';

const results = Papa.parse(csvString, { header: true });
```

### The Grandpa Native Approach
```javascript
export function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const entry = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = values[j] ?? '';
    }
    rows.push(entry);
  }

  return rows;
}
```

### Savings
- **Eliminated**: 48 KB `papaparse` bundle.
