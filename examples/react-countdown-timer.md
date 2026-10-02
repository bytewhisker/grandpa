# Example 15: React Countdown Timer (Zero Libraries)

### The Bloated Approach
Installing `react-countdown` or external state machine libraries to render a simple countdown clock.

### The Grandpa Native Approach
```jsx
import { useState, useEffect } from 'react';

export function Countdown({ initialSeconds = 60, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="countdown font-mono text-xl">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
```

### Savings
- **Eliminated**: `react-countdown` and secondary timer libraries.
- **Robustness**: Proper interval cleanup on unmount prevents memory leaks.
