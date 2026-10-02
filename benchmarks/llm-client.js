/**
 * Grandpa Universal Real LLM Client
 * 
 * Supports real model calls across:
 * - Anthropic (Claude 3.5/3.7 Sonnet, Haiku)
 * - OpenAI / OpenRouter / Groq / DeepSeek / Together / Ollama (OpenAI-compatible /v1/chat/completions)
 * - Google Gemini (/v1beta/models/...:generateContent)
 * 
 * Extracts real provider token accounting:
 * - inputTokens (prompt tokens)
 * - outputTokens (completion tokens)
 * - cachedTokens (cache read tokens)
 * - actual network latency (inference duration)
 */

import { performance } from 'node:perf_hooks';

export class UniversalLLMClient {
  constructor(config = {}) {
    this.provider = config.provider || this.detectProvider();
    this.apiKey = config.apiKey || this.detectApiKey();
    this.model = config.model || this.defaultModelForProvider(this.provider);
    this.baseUrl = config.baseUrl || this.defaultBaseUrlForProvider(this.provider);
    this.temperature = config.temperature !== undefined ? config.temperature : 0.1;
  }

  detectProvider() {
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.GROQ_API_KEY) return 'groq';
    if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
    if (process.env.OPENROUTER_API_KEY) return 'openrouter';
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return 'gemini';
    if (process.env.OLLAMA_HOST || process.env.OLLAMA_BASE_URL) return 'ollama';
    return 'none';
  }

  detectApiKey() {
    return process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';
  }

  defaultModelForProvider(provider) {
    switch (provider) {
      case 'anthropic': return process.env.BENCH_MODEL || 'claude-3-5-haiku-20241022';
      case 'openai': return process.env.BENCH_MODEL || 'gpt-4o-mini';
      case 'groq': return process.env.BENCH_MODEL || 'llama-3.3-70b-versatile';
      case 'deepseek': return process.env.BENCH_MODEL || 'deepseek-chat';
      case 'openrouter': return process.env.BENCH_MODEL || 'anthropic/claude-3.5-haiku';
      case 'gemini': return process.env.BENCH_MODEL || 'gemini-1.5-flash';
      case 'ollama': return process.env.BENCH_MODEL || 'llama3.2';
      default: return 'mock';
    }
  }

  defaultBaseUrlForProvider(provider) {
    switch (provider) {
      case 'anthropic': return 'https://api.anthropic.com/v1/messages';
      case 'openai': return 'https://api.openai.com/v1/chat/completions';
      case 'groq': return 'https://api.groq.com/openai/v1/chat/completions';
      case 'deepseek': return 'https://api.deepseek.com/chat/completions';
      case 'openrouter': return 'https://openrouter.ai/api/v1/chat/completions';
      case 'gemini': return 'https://generativelanguage.googleapis.com/v1beta';
      case 'ollama': return (process.env.OLLAMA_HOST || 'http://localhost:11434') + '/v1/chat/completions';
      default: return '';
    }
  }

  /**
   * Executes a real completion call and returns exact provider token accounting
   * 
   * @param {object} params
   * @param {string} params.systemPrompt
   * @param {Array<{role: string, content: string}>} params.messages
   * @returns {Promise<{content: string, inputTokens: number, outputTokens: number, cachedTokens: number, durationMs: number}>}
   */
  async generateCompletion(params) {
    let delay = 2000;
    const maxRetries = 4;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const start = performance.now();
        let result;
        if (this.provider === 'anthropic') {
          result = await this.callAnthropic({ ...params, start });
        } else if (['openai', 'groq', 'deepseek', 'openrouter', 'ollama'].includes(this.provider)) {
          result = await this.callOpenAICompatible({ ...params, start });
        } else if (this.provider === 'gemini') {
          result = await this.callGemini({ ...params, start });
        } else {
          throw new Error(`No active LLM provider configured.`);
        }
        return result;
      } catch (err) {
        const isTransient = err.message.includes('503') || err.message.includes('429') || err.message.includes('UNAVAILABLE') || err.message.includes('high demand');
        if (isTransient && attempt < maxRetries) {
          console.warn(`[LLM Transient ${err.message.slice(0, 40)}...] Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(10000, delay * 2);
          continue;
        }
        throw err;
      }
    }
  }

  async callAnthropic({ systemPrompt, messages, start }) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        temperature: this.temperature,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      }),
      signal: AbortSignal.timeout(60000)
    });

    const durationMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const cachedTokens = data.usage?.cache_read_input_tokens || 0;

    return {
      content,
      inputTokens,
      outputTokens,
      cachedTokens,
      durationMs
    };
  }

  async callOpenAICompatible({ systemPrompt, messages, start }) {
    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    for (const m of messages) {
      formattedMessages.push({ role: m.role, content: m.content });
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        temperature: this.temperature
      }),
      signal: AbortSignal.timeout(60000)
    });

    const durationMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${this.provider.toUpperCase()} API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const cachedTokens = data.usage?.prompt_tokens_details?.cached_tokens || 0;

    return {
      content,
      inputTokens,
      outputTokens,
      cachedTokens,
      durationMs
    };
  }

  async callGemini({ systemPrompt, messages, start }) {
    const modelName = this.model.startsWith('models/') ? this.model : `models/${this.model}`;
    const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;
    const contents = [];
    for (const m of messages) {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      });
    }

    const requestBody = {
      contents,
      generationConfig: { temperature: this.temperature }
    };
    if (systemPrompt) {
      requestBody.system_instruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000)
    });

    const durationMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inputTokens = data.usageMetadata?.promptTokenCount || 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
    const cachedTokens = data.usageMetadata?.cachedContentTokenCount || 0;

    return {
      content,
      inputTokens,
      outputTokens,
      cachedTokens,
      durationMs
    };
  }
}
