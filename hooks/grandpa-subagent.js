/**
 * Grandpa Subagent Hook (SubagentStart)
 * Ensures that spawned subagents inherit Grandpa architecture rules.
 */

import { getGrandpaInstructions } from './grandpa-instructions.js';
import { getMode } from './grandpa-mode-tracker.js';

export function onSubagentStart(subagentContext = {}) {
  const instructions = getGrandpaInstructions({ intensity: getMode() });
  
  if (subagentContext.injectPrompt && typeof subagentContext.injectPrompt === 'function') {
    subagentContext.injectPrompt(instructions);
  }

  return {
    status: 'subagent_configured',
    instructions
  };
}
