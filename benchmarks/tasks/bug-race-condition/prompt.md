# Async Lock / Mutex for Race Conditions

Write an exported class `AsyncLock` that provides:
- `acquire()`: returns Promise resolving to release function.
- `runExclusive(fn)`: executes async `fn` under mutual exclusion, ensuring sequential execution without interleaved concurrency.
