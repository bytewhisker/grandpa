/**
 * Grandpa Configuration Loader
 * Reads project settings, intensity level, and exception lists from .grandparc.json or package.json.
 */

import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_CONFIG = {
  intensity: 'balanced', // 'soft' | 'balanced' | 'hardcore'
  allowedPackages: [],
  strict: false,
  checkFragilePatterns: true,
  autoReceipt: false
};

export function loadConfig(cwd = process.cwd()) {
  const rcPath = path.join(cwd, '.grandparc.json');
  if (fs.existsSync(rcPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
      return { ...DEFAULT_CONFIG, ...data };
    } catch {
      // fallback
    }
  }

  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.grandpa) {
        return { ...DEFAULT_CONFIG, ...pkg.grandpa };
      }
    } catch {
      // fallback
    }
  }

  return DEFAULT_CONFIG;
}
