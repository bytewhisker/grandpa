# Recursive Directory File Collector with Depth Guard

Write an exported function `walkDir(dirPath, { maxDepth = 3, extension = null } = {})` that:
1. Recursively traverses files using `fs.promises.readdir` with `withFileTypes: true`.
2. Respects `maxDepth` limit.
3. Filters files by `extension` (e.g. `.js`) if provided.
4. Returns Array of relative paths.
