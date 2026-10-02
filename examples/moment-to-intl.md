# Example 2: Moment / Dayjs to Native Intl & Date

### The Bloated Approach (Moment.js)
```javascript
import moment from 'moment';

export function formatTransactionDate(isoString) {
  return moment(isoString).format('MMMM D, YYYY h:mm A');
}
```

### The Grandpa Native Approach
```javascript
export function formatTransactionDate(isoString, locale = 'en-US') {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError('Invalid ISO date string');
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}
```

### Savings
- **Eliminated**: `moment` (290 KB minified!) or `dayjs` (7 KB).
- **Performance**: Native C++ V8 engine localization.
- **Defensive check**: Validates invalid date inputs.
