# Sliding Window Token Bucket Rate Limiter

Write an exported class `TokenBucketLimiter` with:
- `constructor(capacity, refillRatePerSec)`
- `tryConsume(tokens = 1)`: returns `true` if tokens were deducted, else `false`.
- Refills tokens continuously based on elapsed time without background timers.
