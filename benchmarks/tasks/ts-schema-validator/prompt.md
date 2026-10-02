# Lightweight Schema Validator Guard

Write an exported function `validateSchema(data, schema)` that:
- `schema` is an object where keys are field names and values are type strings ('string', 'number', 'boolean', 'array').
- Returns `{ valid: true, errors: [] }` if all fields match.
- If invalid or missing, returns `{ valid: false, errors: ['Field <name> is missing or not a <type>'] }`.
- Handles null/undefined data safely.
