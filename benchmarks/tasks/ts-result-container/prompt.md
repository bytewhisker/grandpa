# Type-Safe Result<T, E> Pattern

Write exported helper functions for Result type handling:
- `Ok(value)`: returns `{ ok: true, value }`
- `Err(error)`: returns `{ ok: false, error }`
- `isOk(result)`: type guard returning `result.ok === true`
- `unwrapOr(result, fallback)`: returns value if Ok, else fallback.
