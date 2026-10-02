# Atomic JSON File Writer

Write an exported function `writeJsonAtomic(filePath, data)` that:
1. Serializes `data` to JSON.
2. Writes to a temporary file in the same directory (e.g. `${filePath}.tmp.${Date.now()}`).
3. Renames the temporary file to `filePath` using `fs.promises.rename` (guaranteeing atomic POSIX/Windows write).
4. Cleans up temp file on failure.
