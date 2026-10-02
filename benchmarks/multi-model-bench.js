#!/usr/bin/env node
/**
 * Universal Multi-Model Benchmark Runner for Grandpa vs Ponytail vs Caveman vs Bare AI
 * 
 * Supports:
 * - Google Gemini (GEMINI_API_KEY)
 * - Anthropic Claude (ANTHROPIC_API_KEY) - Opus, Sonnet, Haiku, Thinking models
 * - OpenAI (OPENAI_API_KEY) - GPT-4o, o1, o3-mini
 * - Local / Offline Evaluation Mode (runs against verifiable real-world code outputs)
 * 
 * Usage:
 *   node benchmarks/multi-model-bench.js                     # Run in local deterministic mode
 *   GEMINI_API_KEY=xxx node benchmarks/multi-model-bench.js  # Run live against Google Gemini
 *   ANTHROPIC_API_KEY=xxx node benchmarks/multi-model-bench.js # Run live against Claude Opus/Sonnet
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TASKS, ARMS, scoreResponse } from './run.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Environment & Config ────────────────────────────────────────────────

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

const SELECTED_PROVIDER = GEMINI_KEY ? 'gemini' : ANTHROPIC_KEY ? 'anthropic' : OPENAI_KEY ? 'openai' : 'local';
const MODEL = process.env.BENCH_MODEL || (
  SELECTED_PROVIDER === 'gemini' ? 'gemini-1.5-pro' :
  SELECTED_PROVIDER === 'anthropic' ? 'claude-3-7-sonnet-20250219' :
  SELECTED_PROVIDER === 'openai' ? 'gpt-4o' :
  'deterministic-evaluation-engine'
);

console.log(`
==========================================================
  GRANDPA UNIVERSAL MULTI-MODEL BENCHMARK
  Active Provider: ${SELECTED_PROVIDER.toUpperCase()}
  Model:           ${MODEL}
==========================================================
`);

// ─── Model Callers ───────────────────────────────────────────────────────

async function callModel(systemPrompt, userPrompt) {
  if (SELECTED_PROVIDER === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) throw new Error(`Gemini API Error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokens = data.usageMetadata?.totalTokenCount || Math.ceil((systemPrompt.length + text.length) / 4);
    return { text, tokens };
  }

  if (SELECTED_PROVIDER === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) throw new Error(`Anthropic API Error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const text = data.content.map(c => c.text).join('');
    const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    return { text, tokens };
  }

  if (SELECTED_PROVIDER === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) throw new Error(`OpenAI API Error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || Math.ceil((systemPrompt.length + text.length) / 4);
    return { text, tokens };
  }

  // Local deterministic fallback runner
  return null;
}

// ─── Main Execution ──────────────────────────────────────────────────────

async function main() {
  const armNames = Object.keys(ARMS);
  const results = {};

  if (SELECTED_PROVIDER === 'local') {
    console.log(`No external API keys detected (GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY).`);
    console.log(`Running in Scientific Verification Mode using measured task responses.\n`);

    // Run quick-compare engine
    const { default: runCompare } = await import('./quick-compare.js');
    return;
  }

  console.log(`Starting live benchmark across ${TASKS.length} tasks and ${armNames.length} arms...`);

  for (const arm of armNames) {
    results[arm] = [];
    console.log(`\nEvaluating Arm: ${arm}...`);

    for (const task of TASKS) {
      process.stdout.write(`  Evaluating task "${task.name}"... `);
      try {
        const response = await callModel(ARMS[arm], task.prompt);
        const score = scoreResponse(response.text, task);
        score.totalTokens = response.tokens;
        results[arm].push(score);
        console.log(`LOC=${score.loc} Safety=${score.safetyScore}% Deps=${score.dependencyCount} Fragile=${score.fragileCount}`);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
    }
  }

  // Save results
  const outPath = path.join(__dirname, 'results', `live-benchmark-${SELECTED_PROVIDER}-${Date.now()}.json`);
  fs.mkdirSync(path.join(__dirname, 'results'), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved raw benchmark data to: ${outPath}`);
}

main().catch(console.error);
