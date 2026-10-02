import fs from 'node:fs';
import path from 'node:path';

// Known bloat packages with native modern alternatives
export const BLOAT_DATABASE = {
  'axios': {
    category: 'HTTP',
    native: 'fetch()',
    minNode: '18.0+',
    reason: 'Native standard global fetch supported in Node 18+ and all modern browsers.'
  },
  'moment': {
    category: 'Date',
    native: 'Intl.DateTimeFormat / Date',
    minNode: 'All',
    reason: 'Standard ECMAScript Internationalization API.'
  },
  'dayjs': {
    category: 'Date',
    native: 'Intl.DateTimeFormat / Date',
    minNode: 'All',
    reason: 'Standard ECMAScript Internationalization API.'
  },
  'lodash': {
    category: 'Utilities',
    native: 'Standard ES6+ methods & structuredClone()',
    minNode: 'All',
    reason: 'Native JavaScript Array/Object methods and structuredClone.'
  },
  'uuid': {
    category: 'Crypto',
    native: 'crypto.randomUUID()',
    minNode: '14.17+',
    reason: 'Native standard library in Node.js and all modern browsers. Zero dependencies needed.'
  },
  'is-odd': {
    category: 'Math',
    native: 'n % 2 !== 0',
    minNode: 'All',
    reason: 'Basic language operator. No package required.'
  },
  'is-even': {
    category: 'Math',
    native: 'n % 2 === 0',
    minNode: 'All',
    reason: 'Basic language operator. No package required.'
  },
  'is-number': {
    category: 'Type Check',
    native: 'typeof n === "number" && !isNaN(n)',
    minNode: 'All',
    reason: 'Native language check.'
  },
  'lodash.clonedeep': {
    category: 'Utilities',
    native: 'structuredClone(obj)',
    minNode: '17.0+',
    reason: 'Native deep cloning built into modern JavaScript runtimes.'
  },
  'clone-deep': {
    category: 'Utilities',
    native: 'structuredClone(obj)',
    minNode: '17.0+',
    reason: 'Native deep cloning built into modern JavaScript runtimes.'
  },
  'rimraf': {
    category: 'Filesystem',
    native: 'fs.rmSync(path, { recursive: true, force: true })',
    minNode: '14.14+',
    reason: 'Native recursive directory deletion in Node.js fs.'
  },
  'mkdirp': {
    category: 'Filesystem',
    native: 'fs.mkdirSync(path, { recursive: true })',
    minNode: '10.12+',
    reason: 'Native recursive folder creation in Node.js fs.'
  },
  'node-fetch': {
    category: 'HTTP',
    native: 'fetch()',
    minNode: '18.0+',
    reason: 'Fetch is globally available in modern Node.js and browsers.'
  },
  'cross-fetch': {
    category: 'HTTP',
    native: 'fetch()',
    minNode: '18.0+',
    reason: 'Global fetch exists across all target runtimes.'
  },
  'isomorphic-fetch': {
    category: 'HTTP',
    native: 'fetch()',
    minNode: '18.0+',
    reason: 'Global fetch exists across all target runtimes.'
  },
  'querystring': {
    category: 'URL',
    native: 'new URLSearchParams()',
    minNode: '10.0+',
    reason: 'URLSearchParams is standard in Node.js and web standards.'
  },
  'array-flatten': {
    category: 'Arrays',
    native: 'arr.flat(Infinity)',
    minNode: '12.0+',
    reason: 'Native Array.prototype.flat() supported in all modern runtimes.'
  },
  'flatten': {
    category: 'Arrays',
    native: 'arr.flat(Infinity)',
    minNode: '12.0+',
    reason: 'Native Array.prototype.flat() supported in all modern runtimes.'
  },
  'object-assign': {
    category: 'Objects',
    native: 'Object.assign() or { ...obj }',
    minNode: 'All',
    reason: 'Native language object spreading.'
  },
  'left-pad': {
    category: 'Strings',
    native: 'str.padStart(length, char)',
    minNode: 'All',
    reason: 'Native String.prototype.padStart() supported since ES2017.'
  }
};

/**
 * Scans a project directory for dependency and code bloat.
 */
export function scanProject(projectDir = process.cwd()) {
  const results = {
    projectDir,
    hasPackageJson: false,
    bloatFound: [],
    fragileCodeFound: [],
    score: 100,
    rating: 'A+'
  };

  const packageJsonPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    results.hasPackageJson = true;
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {})
      };

      for (const [dep, version] of Object.entries(allDeps)) {
        if (BLOAT_DATABASE[dep]) {
          results.bloatFound.push({
            package: dep,
            version,
            ...BLOAT_DATABASE[dep]
          });
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Scan source files for fragile code patterns (the Ponytail trap: fetch without status check)
  scanSourceFiles(projectDir, results);

  // Calculate score
  const deductions = (results.bloatFound.length * 15) + (results.fragileCodeFound.length * 10);
  results.score = Math.max(0, 100 - deductions);

  if (results.score >= 95) results.rating = 'A+ (Clean as a Whistle)';
  else if (results.score >= 80) results.rating = 'B (Acceptable, but watch the bloat)';
  else if (results.score >= 60) results.rating = 'C (Grandpa is Grumpy: noticeable bloat)';
  else if (results.score >= 40) results.rating = 'D (Heavy Slop Detected)';
  else results.rating = 'F (Get off my lawn: 500MB of node_modules)';

  return results;
}

/**
 * Scans source files recursively for common fragile AI patterns.
 */
function scanSourceFiles(dir, results, depth = 0) {
  if (depth > 6) return;

  const ignoreList = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.cache', 'benchmarks', 'fixtures']);

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignoreList.has(entry.name)) {
          scanSourceFiles(path.join(dir, entry.name), results, depth + 1);
        }
      } else if (entry.isFile() && /\.(js|ts|jsx|tsx|mjs)$/.test(entry.name)) {
        checkFileContent(path.join(dir, entry.name), results);
      }
    }
  } catch {
    // Ignore permissions
  }
}

function checkFileContent(filePath, results) {
  if (filePath.endsWith('scanner.js')) return;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect unhandled fetch: fetch(url).then(r => r.json()) without error/status check
      if (/fetch\([^)]+\)\.then\(\s*\w+\s*=>\s*\w+\.json\(\)\s*\)/.test(line)) {
        results.fragileCodeFound.push({
          file: path.relative(results.projectDir, filePath),
          line: i + 1,
          issue: 'Fragile Fetch (The Ponytail Trap): Calling .json() without checking res.ok or setting a timeout.',
          fix: 'const res = await fetch(url, { signal: AbortSignal.timeout(5000) }); if (!res.ok) throw new Error(`HTTP ${res.status}`);'
        });
      }
    }
  } catch {
    // Ignore
  }
}
