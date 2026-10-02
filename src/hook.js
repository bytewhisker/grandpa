import fs from 'node:fs';
import path from 'node:path';

export const HOOK_SCRIPT = `#!/bin/sh
# Grandpa Pre-Commit Guard: Catch AI Agent Dependency Infection

if git diff --cached --name-only | grep -q "package.json"; then
  echo ""
  echo "👴 [Grandpa Pre-Commit Guard] package.json changes detected!"
  echo "   Verifying no unvetted dependency bloat was injected by AI agents..."
  
  if command -v npx >/dev/null 2>&1; then
    npx @bytewhisker/grandpa scan --strict
    STATUS=$?
    if [ $STATUS -ne 0 ]; then
      echo "❌ [Grandpa Warning] Grandpa detected unnecessary dependencies."
      echo "   Review your diff or run with --no-verify if intentional."
      exit 1
    fi
  fi
fi
exit 0
`;

export function installPreCommitHook(targetDir = process.cwd()) {
  const gitDir = path.join(targetDir, '.git');
  if (!fs.existsSync(gitDir)) {
    throw new Error('Not a git repository. Initialize git first.');
  }

  const hooksDir = path.join(gitDir, 'hooks');
  fs.mkdirSync(hooksDir, { recursive: true });

  const hookFile = path.join(hooksDir, 'pre-commit');
  fs.writeFileSync(hookFile, HOOK_SCRIPT, { mode: 0o755 });
  return hookFile;
}
