# Type-Coercing Environment Config Loader

Write an exported function `loadEnvConfig(envObj, schema)` that:
- `schema` specifies keys with `{ type: 'string' | 'number' | 'boolean', required?: boolean, default?: any }`.
- Throws Error listing missing required variables.
- Coerces strings: 'true'/'false' to boolean, numeric strings to number.
- Applies defaults for missing optional variables.
