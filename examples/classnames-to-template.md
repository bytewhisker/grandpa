# Example 4: Classnames / CLSX to Template Literals & Array Filtering

### The Bloated Approach
```javascript
import classNames from 'classnames';

function Button({ isActive, hasError, disabled }) {
  return (
    <button className={classNames('btn', { 'btn-active': isActive, 'btn-error': hasError, 'btn-disabled': disabled })}>
      Submit
    </button>
  );
}
```

### The Grandpa Native Approach
```javascript
// A zero-dependency 1-line helper:
const cx = (...classes) => classes.filter(Boolean).join(' ');

function Button({ isActive, hasError, disabled }) {
  return (
    <button className={cx('btn', isActive && 'btn-active', hasError && 'btn-error', disabled && 'btn-disabled')}>
      Submit
    </button>
  );
}
```

### Savings
- **Eliminated**: `classnames` or `clsx` package install and import.
- **Transitive bloat**: 0 dependencies.
