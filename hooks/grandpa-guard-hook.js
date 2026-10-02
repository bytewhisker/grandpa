/**
 * Grandpa Guard Hook (PreToolExecution / BeforeToolUse)
 * Intercepts dangerous package additions or fragile code patterns in real-time.
 */

export const BLOAT_PACKAGES = [
  'axios', 'moment', 'dayjs', 'lodash', 'uuid', 'classnames',
  'clsx', 'rimraf', 'mkdirp', 'dotenv', 'chalk', 'kleur', 'glob'
];

export function preToolExecution(toolName, params = {}) {
  // 1. Intercept shell commands attempting to install bloat
  if (toolName === 'run_command' || toolName === 'execute_command' || toolName === 'terminal') {
    const cmd = params.command || params.CommandLine || '';
    for (const pkg of BLOAT_PACKAGES) {
      const regex = new RegExp(`(npm\\s+i|npm\\s+install|yarn\\s+add|pnpm\\s+add)\\s+.*\\b${pkg}\\b`, 'i');
      if (regex.test(cmd)) {
        return {
          allowed: false,
          warning: true,
          message: `[Grandpa Guard] Blocked installation of "${pkg}". Modern standard library / native runtime features provide a superior, zero-dependency alternative.`
        };
      }
    }
  }

  // 2. Intercept writing files with dangerous patterns
  if (toolName === 'write_to_file' || toolName === 'replace_file_content') {
    const content = params.CodeContent || params.ReplacementContent || params.content || '';
    if (content.includes('fetch(') && !content.includes('catch') && !content.includes('try') && !content.includes('.ok')) {
      // Non-fatal advisory warning
      return {
        allowed: true,
        advisory: `[Grandpa Guard Advisory] Detected fetch() without apparent error handling or res.ok check. Remember: Cut the fat, never cut the bone.`
      };
    }
  }

  return { allowed: true };
}
