# Zero-Dependency Quoted CSV Row Parser

Write an exported function `parseCsvRow(rowString)` that:
1. Parses a single CSV line into an array of string values.
2. Handles comma delimiters outside quotes.
3. Correctly handles values enclosed in double quotes containing commas (`"hello, world"`).
4. Handles escaped quotes (`"say \"hello\""` or `"say ""hello"""`).
