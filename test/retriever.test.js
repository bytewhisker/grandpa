import assert from 'node:assert';
import path from 'node:path';
import { RelevanceRetriever, estimateTokens } from '../src/retriever.js';

console.log('Running Grandpa Context Retriever Unit Tests...');

// 1. Token Estimation Check
const count = estimateTokens('function hello() { return "world"; }');
assert(count > 0 && count < 20);

// 2. Targeted Context Retrieval
const retriever = new RelevanceRetriever();
const context = retriever.retrieveTargetedContext('Fix fetch error handling', ['src/verifier.js']);

assert(context.files.length >= 1);
assert.strictEqual(context.files[0].path.includes('verifier.js'), true);
assert(context.totalTokens > 0);
assert.strictEqual(context.metrics.filesRead >= 1, true);
assert.strictEqual(context.metrics.relevantFilesRead >= 1, true);

// 3. Repeated read tracking
retriever.readFileContent('src/verifier.js');
assert(retriever.getMetrics().repeatedContextTokens > 0);

console.log('Context Retriever unit tests passed successfully!');
