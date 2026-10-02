/**
 * Grandpa Instruction Generator
 * Produces dynamic prompt injection based on current intensity mode and project stack.
 */

import { getMode } from './grandpa-mode-tracker.js';

export function getGrandpaInstructions(options = {}) {
  const mode = options.intensity || getMode();

  return `
[GRANDPA ARCHITECTURE STANDARD ACTIVATED: INTENSITY=${mode.toUpperCase()}]
1. ZERO BLOAT: Prefer runtime/stdlib features over 3rd party packages.
   - Use native fetch, Intl, crypto.randomUUID, node:fs, structuredClone.
2. NEVER CUT THE BONE: Retain all error boundaries, input guards, and defensive logic.
3. EXCEPTIONS: If an external library is necessary, append:
   // grandpa: allowed dependency [name] - [reason]
4. VERIFICATION: You can run 'npx grandpa scan' to verify your changes.
`.trim();
}
