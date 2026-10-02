/**
 * Grandpa Static Context Cache & Relevance Index
 * 
 * Complies with Grandpa Specification Part 6:
 * - Cache key incorporates Grandpa version, benchmark version, project config,
 *   manifest hashes, and relevant application source file fingerprints.
 * - Source file edits automatically invalidate relevant cached entries.
 * - Distinct instrumentation for COLD CACHE vs WARM CACHE latencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read Grandpa package version
let GRANDPA_VERSION = '1.0.0';
try {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    GRANDPA_VERSION = pkg.version || '1.0.0';
  }
} catch {}

const DEFAULT_BENCHMARK_VERSION = '1.0.0';

class GrandpaContextCache {
  constructor() {
    this.memoryStore = new Map();
    this.stats = {
      coldHits: 0,
      warmHits: 0,
      invalidations: 0,
      coldDurationMs: 0,
      warmDurationMs: 0
    };
  }

  /**
   * Hashes a file if it exists, returning empty string if missing
   */
  hashFile(filePath) {
    if (!fs.existsSync(filePath)) return '';
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
    } catch {
      return '';
    }
  }

  /**
   * Computes a multi-factor cache key including grandpaVersion, benchmarkVersion,
   * manifest hashes, and relevant source file hashes.
   */
  computeCacheKey({
    cwd = process.cwd(),
    benchmarkVersion = DEFAULT_BENCHMARK_VERSION,
    config = {},
    relevantFiles = []
  } = {}) {
    const hash = crypto.createHash('sha256');

    // 1. Versions
    hash.update(`grandpa:${GRANDPA_VERSION}|`);
    hash.update(`benchmark:${benchmarkVersion}|`);
    hash.update(`config:${JSON.stringify(config)}|`);

    // 2. Config & Manifest Hashes
    const manifests = ['package.json', 'tsconfig.json', 'package-lock.json', 'pnpm-lock.yaml', 'bun.lockb', '.grandparc.json'];
    for (const manifest of manifests) {
      const fullPath = path.join(cwd, manifest);
      const fileHash = this.hashFile(fullPath);
      if (fileHash) {
        hash.update(`${manifest}:${fileHash}|`);
      }
    }

    // 3. Relevant application source file fingerprints
    // Guarantees source changes invalidate the cache entry
    const sortedFiles = [...relevantFiles].sort();
    for (const relFile of sortedFiles) {
      const fullPath = path.isAbsolute(relFile) ? relFile : path.join(cwd, relFile);
      const fileHash = this.hashFile(fullPath);
      hash.update(`${relFile}:${fileHash}|`);
    }

    return hash.digest('hex').substring(0, 32);
  }

  /**
   * Project fingerprint helper for general repo state
   */
  getProjectFingerprint(cwd = process.cwd(), relevantFiles = []) {
    return this.computeCacheKey({ cwd, relevantFiles });
  }

  /**
   * Returns cached context or executes builder, tracking cold vs warm performance
   */
  async getOrSetCachedContext(key, builderFn) {
    const start = performance.now();

    if (this.memoryStore.has(key)) {
      const durationMs = performance.now() - start;
      this.stats.warmHits++;
      this.stats.warmDurationMs += durationMs;
      return {
        context: this.memoryStore.get(key),
        cacheType: 'warm',
        durationMs
      };
    }

    // Cache miss = Cold Cache
    const context = await builderFn();
    const durationMs = performance.now() - start;
    this.memoryStore.set(key, context);
    this.stats.coldHits++;
    this.stats.coldDurationMs += durationMs;

    return {
      context,
      cacheType: 'cold',
      durationMs
    };
  }

  /**
   * Explicitly invalidate a cache key or entire store
   */
  invalidate(key = null) {
    if (key) {
      const deleted = this.memoryStore.delete(key);
      if (deleted) this.stats.invalidations++;
    } else {
      this.memoryStore.clear();
      this.stats.invalidations++;
    }
  }

  getStats() {
    return {
      ...this.stats,
      size: this.memoryStore.size,
      avgColdMs: this.stats.coldHits ? Math.round((this.stats.coldDurationMs / this.stats.coldHits) * 100) / 100 : 0,
      avgWarmMs: this.stats.warmHits ? Math.round((this.stats.warmDurationMs / this.stats.warmHits) * 100) / 100 : 0
    };
  }

  clear() {
    this.memoryStore.clear();
  }
}

export const defaultCache = new GrandpaContextCache();

export function getProjectFingerprint(cwd = process.cwd(), relevantFiles = []) {
  return defaultCache.getProjectFingerprint(cwd, relevantFiles);
}

export function computeCacheKey(params) {
  return defaultCache.computeCacheKey(params);
}

export async function getOrSetCachedContext(key, builderFn) {
  const result = await defaultCache.getOrSetCachedContext(key, builderFn);
  // Maintain backward compatibility: if caller expects raw value, return context if needed,
  // or return the full object with cacheType
  return result.context !== undefined ? result.context : result;
}

export function invalidateCache(key) {
  return defaultCache.invalidate(key);
}

export function clearCache() {
  return defaultCache.clear();
}

export function getCacheStats() {
  return defaultCache.getStats();
}
