/**
 * Grandpa Mode Tracker
 * Tracks current intensity mode across session lifecycle.
 */

let currentMode = 'balanced';

export function setMode(mode) {
  if (['soft', 'balanced', 'hardcore'].includes(mode)) {
    currentMode = mode;
  }
}

export function getMode() {
  return currentMode;
}
