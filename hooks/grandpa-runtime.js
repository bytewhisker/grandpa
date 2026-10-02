/**
 * Grandpa Runtime Engine
 * Coordinates hooks, scanner, and rules across agent sessions.
 */

import { activate } from './grandpa-activate.js';
import { onSubagentStart } from './grandpa-subagent.js';
import { preToolExecution } from './grandpa-guard-hook.js';
import { getMode, setMode } from './grandpa-mode-tracker.js';
import { loadConfig } from './grandpa-config.js';

export class GrandpaRuntime {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.config = loadConfig(cwd);
    if (this.config.intensity) {
      setMode(this.config.intensity);
    }
  }

  initSession(sessionContext) {
    return activate(sessionContext);
  }

  handleSubagent(subagentContext) {
    return onSubagentStart(subagentContext);
  }

  inspectToolCall(toolName, params) {
    return preToolExecution(toolName, params);
  }

  getMode() {
    return getMode();
  }

  setMode(mode) {
    setMode(mode);
  }
}
