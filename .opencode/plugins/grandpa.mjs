/**
 * Grandpa OpenCode Plugin
 * Injects Grandpa architectural rules and pre-tool inspection.
 */

export default function grandpaPlugin(context) {
  return {
    name: 'grandpa',
    version: '1.0.0',
    description: 'Enforces battle-tested, zero-bloat architecture rules across AI code generation.',
    hooks: {
      beforeToolExecution(toolName, args) {
        if (toolName === 'execute_command' && typeof args?.command === 'string') {
          const cmd = args.command;
          if (/npm\s+(i|install)\s+(axios|moment|lodash|uuid|classnames|rimraf|mkdirp)/i.test(cmd)) {
            console.warn(`[grandpa] WARNING: Attempted installation of replaceable package detected in command: "${cmd}".`);
          }
        }
      }
    }
  };
}
