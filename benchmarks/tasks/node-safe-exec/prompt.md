# Safe Command Execution with Timeout

Write an exported function `executeCommand(cmd, args = [], options = {})` that:
1. Spawns child process using `child_process.spawn`.
2. Supports `timeoutMs` (default: 5000), killing the process if exceeded.
3. Caps stdout/stderr to `maxBuffer` (default: 64KB) to avoid memory explosion.
4. Returns Promise resolving with `{ code, stdout, stderr, timedOut }`.
