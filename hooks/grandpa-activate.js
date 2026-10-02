/**
 * Grandpa Activate Hook (SessionStart)
 * Invoked when an agent starts a new session. Injects architecture guidelines.
 */

import { getGrandpaInstructions } from './grandpa-instructions.js';
import { loadConfig } from './grandpa-config.js';
import { setMode } from './grandpa-mode-tracker.js';

export function activate(sessionContext = {}) {
  const config = loadConfig(process.cwd());
  if (config.intensity) {
    setMode(config.intensity);
  }

  const instructions = getGrandpaInstructions({ intensity: config.intensity });
  
  if (sessionContext.injectPrompt && typeof sessionContext.injectPrompt === 'function') {
    sessionContext.injectPrompt(instructions);
  }

  return {
    status: 'activated',
    intensity: config.intensity,
    instructions
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = activate();
  console.log(res.instructions);
}
