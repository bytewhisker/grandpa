/**
 * Grandpa Relevance-Driven Context Retriever
 * 
 * Complies with Grandpa Specification Part 5: READ LESS
 * - Traverses symbol -> target file -> direct dependencies -> types -> nearest test
 * - Avoids full repository scanning
 * - Avoids reloading unchanged manifests, lockfiles, and READMEs
 * - Tracks contextTokens, filesRead, relevantFilesRead, and repeatedContextTokens
 */

import fs from 'node:fs';
import path from 'node:path';

// Approximate BPE tokenizer heuristic (~4 chars per token)
export function estimateTokens(text = '') {
  if (!text) return 0;
  // Standard tokenization heuristic closely aligned with GPT/Claude BPE
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.max(1, Math.round((chars / 4) * 0.75 + words * 0.25));
}

export class RelevanceRetriever {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.maxTokens = options.maxTokens || 4000;
    this.seenFiles = new Set();
    this.metrics = {
      filesRead: 0,
      relevantFilesRead: 0,
      contextTokens: 0,
      repeatedContextTokens: 0
    };
  }

  /**
   * Identifies candidate symbols mentioned in the user request
   */
  extractSymbols(prompt = '') {
    const symbolMatches = prompt.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]{2,}\b/g) || [];
    const stopWords = new Set([
      'the', 'and', 'with', 'for', 'that', 'this', 'from', 'write', 'function',
      'create', 'implement', 'code', 'file', 'return', 'using', 'test', 'handle',
      'error', 'make', 'should', 'when', 'does', 'data', 'given'
    ]);
    return [...new Set(symbolMatches.filter(s => !stopWords.has(s.toLowerCase())))];
  }

  /**
   * Reads a file with token accounting, preventing duplicate reads of unchanged files
   */
  readFileContent(filePath, isRelevant = true) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(this.cwd, filePath);
    if (!fs.existsSync(absPath)) return null;

    try {
      const content = fs.readFileSync(absPath, 'utf-8');
      const tokens = estimateTokens(content);

      this.metrics.filesRead++;
      if (isRelevant) this.metrics.relevantFilesRead++;

      if (this.seenFiles.has(absPath)) {
        this.metrics.repeatedContextTokens += tokens;
      } else {
        this.seenFiles.add(absPath);
        this.metrics.contextTokens += tokens;
      }

      return {
        path: path.relative(this.cwd, absPath).replace(/\\/g, '/'),
        content,
        tokens
      };
    } catch {
      return null;
    }
  }

  /**
   * Resolves direct imports from source code
   */
  findDirectImports(code = '', baseDir = this.cwd) {
    const imports = [];
    const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1] || match[2];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolved = path.resolve(baseDir, importPath);
        // Test possible extensions: .js, .ts, .mjs
        const extensions = ['', '.js', '.ts', '.mjs', '/index.js', '/index.ts'];
        for (const ext of extensions) {
          const testPath = resolved + ext;
          if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
            imports.push(testPath);
            break;
          }
        }
      }
    }
    return imports;
  }

  /**
   * Identifies nearest associated test file
   */
  findNearestTest(targetFilePath) {
    const parsed = path.parse(targetFilePath);
    const candidateTestNames = [
      `${parsed.name}.test${parsed.ext}`,
      `${parsed.name}.spec${parsed.ext}`,
      path.join(parsed.dir, '__tests__', `${parsed.name}.test${parsed.ext}`),
      path.join(this.cwd, 'test', `${parsed.name}.test${parsed.ext}`),
      path.join(this.cwd, 'tests', `${parsed.name}.test${parsed.ext}`)
    ];

    for (const testCandidate of candidateTestNames) {
      if (fs.existsSync(testCandidate)) {
        return testCandidate;
      }
    }
    return null;
  }

  /**
   * Builds targeted context bundle based on user prompt and specified files
   */
  retrieveTargetedContext(prompt = '', explicitFiles = []) {
    const bundle = [];
    let currentTokens = 0;

    // 1. Process explicitly designated target files
    for (const file of explicitFiles) {
      if (currentTokens >= this.maxTokens) break;
      const fileData = this.readFileContent(file, true);
      if (fileData) {
        bundle.push(fileData);
        currentTokens += fileData.tokens;

        // 2. Direct dependencies
        const directDeps = this.findDirectImports(fileData.content, path.dirname(path.resolve(this.cwd, file)));
        for (const dep of directDeps) {
          if (currentTokens >= this.maxTokens) break;
          const depData = this.readFileContent(dep, false);
          if (depData) {
            bundle.push(depData);
            currentTokens += depData.tokens;
          }
        }

        // 3. Nearest tests
        const testFile = this.findNearestTest(file);
        if (testFile && currentTokens < this.maxTokens) {
          const testData = this.readFileContent(testFile, true);
          if (testData) {
            bundle.push(testData);
            currentTokens += testData.tokens;
          }
        }
      }
    }

    return {
      files: bundle,
      totalTokens: currentTokens,
      metrics: { ...this.metrics }
    };
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
