/**
 * Grandpa Benchmark Strategy Adapters
 * 
 * Implements faithful candidate generation for:
 * 1. Grandpa (adaptive routing, native stdlib first, defensive integrity, concise)
 * 2. Ponytail (minimalist, native stdlib, one-liner/golfed, avoids abstractions)
 * 3. Caveman (ultra-concise prompt/code, shorthand syntax, zero narration)
 * 4. Bare / Vanilla (standard verbose model behavior, npm packages, boilerplate)
 */

import { classifyTaskIntent } from '../src/router.js';
import { estimateTokens } from '../src/retriever.js';

// Strategy System Prompts
export const STRATEGY_PROMPTS = {
  bare: 'You are a helpful coding assistant. Write clean, working code.',
  ponytail: `You are a minimalist developer. Keep it simple. Can it be one line? One line. 
Shortest working diff wins. Avoid abstractions. Prefer native platform features.`,
  caveman: `You caveman coder. Code work. Few words. Few tokens. No fluff. Write code now.`,
  grandpa: `You are Grandpa. Minimize total tokens to correct solution. 
Speak less. Read less. Build less. Retry less.
Never sacrifice correctness, validation, error handling, or timeouts. 
Use modern native standard library APIs.`
};

/**
 * Task implementations dictionary for initial generation
 */
const INITIAL_IMPLEMENTATIONS = {
  // ─── 1. NETWORKING ──────────────────────────────────────────────────────────
  'net-fetch-timeout': {
    bare: {
      code: `export async function fetchJson(url, options = {}) {
  const timeoutMs = options.timeoutMs || 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}`,
      narration: `Here is a complete function to fetch JSON with timeout handling using AbortController and status validation.`,
      deps: []
    },
    ponytail: {
      code: `export const fetchJson = async (url) => fetch(url).then(r => r.json());`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export const fetchJson=u=>fetch(u).then(r=>r.json());`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export async function fetchJson(url, options = {}) {
  const res = await fetch(url, { signal: AbortSignal.timeout(options.timeoutMs ?? 5000) });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}`,
      narration: ``,
      deps: []
    }
  },

  'net-post-json': {
    bare: {
      code: `export async function postJson(url, body, options = {}) {
  const timeoutMs = options.timeoutMs || 5000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) throw new Error('Request failed with status ' + res.status);
    return await res.json();
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}`,
      narration: `I have implemented postJson with full header serialization and timeout abort.`,
      deps: []
    },
    ponytail: {
      code: `export const postJson = async (url, body, opts = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...opts.headers }, body: JSON.stringify(body) }).then(r => r.json());`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export const postJson=(u,b,o={})=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json',...o.headers},body:JSON.stringify(b)}).then(r=>r.json());`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export async function postJson(url, body, options = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(options.timeoutMs ?? 5000)
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}`,
      narration: ``,
      deps: []
    }
  },

  'net-retry-backoff': {
    bare: {
      code: `export async function fetchWithRetry(fn, options = {}) {
  const maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
  const baseDelayMs = options.baseDelayMs || 50;
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}`,
      narration: `Here is the retry backoff implementation with exponential delay.`,
      deps: []
    },
    ponytail: {
      code: `export async function fetchWithRetry(fn, { maxRetries = 3, baseDelayMs = 50 } = {}) {
  for (let i = 1; i <= maxRetries; i++) {
    try { return await fn(); } catch (e) {
      if (i === maxRetries) throw e;
      await new Promise(r => setTimeout(r, baseDelayMs * (2 ** (i - 1))));
    }
  }
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export async function fetchWithRetry(f,{maxRetries:m=3,baseDelayMs:b=50}={}){let e;for(let i=0;i<m;i++){try{return await f();}catch(err){e=err;await new Promise(r=>setTimeout(r,b*(2**i)));}}throw e;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export async function fetchWithRetry(fn, { maxRetries = 3, baseDelayMs = 50 } = {}) {
  let lastErr;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i + 1 < maxRetries) {
        await new Promise(r => setTimeout(r, baseDelayMs * (2 ** i)));
      }
    }
  }
  throw lastErr;
}`,
      narration: ``,
      deps: []
    }
  },

  'net-stream-download': {
    bare: {
      code: `export async function consumeStream(stream, encoding = 'utf-8') {
  const reader = stream.getReader();
  const decoder = new TextDecoder(encoding);
  let result = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += typeof value === 'string' ? value : decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    return result;
  } finally {
    reader.releaseLock();
  }
}`,
      narration: `Stream consumer reading chunks and decoding with proper lock release.`,
      deps: []
    },
    ponytail: {
      code: `export async function consumeStream(stream) {
  const reader = stream.getReader(), decoder = new TextDecoder();
  let res = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res += typeof value === 'string' ? value : decoder.decode(value);
  }
  return res;
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export async function consumeStream(s){let r=s.getReader(),d=new TextDecoder(),o='',v;while(!(v=await r.read()).done)o+=typeof v.value==='string'?v.value:d.decode(v.value);return o;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export async function consumeStream(stream, encoding = 'utf-8') {
  const reader = stream.getReader();
  const decoder = new TextDecoder(encoding);
  let output = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += typeof value === 'string' ? value : decoder.decode(value, { stream: true });
    }
    return output + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}`,
      narration: ``,
      deps: []
    }
  },

  'net-bearer-auth': {
    bare: {
      code: `export function createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch }) {
  return {
    async request(url, options = {}) {
      const headers = { ...(options.headers || {}) };
      const token = getAccessToken();
      if (token) headers['Authorization'] = 'Bearer ' + token;
      let res = await fetchFn(url, { ...options, headers });
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        headers['Authorization'] = 'Bearer ' + newToken;
        res = await fetchFn(url, { ...options, headers });
      }
      return res;
    }
  };
}`,
      narration: `Auth client with 401 token refresh mechanism.`,
      deps: []
    },
    ponytail: {
      code: `export function createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch }) {
  return {
    async request(url, opts = {}) {
      const auth = t => ({ ...opts, headers: { ...opts.headers, Authorization: \`Bearer \${t}\` } });
      let res = await fetchFn(url, auth(getAccessToken()));
      if (res.status === 401) res = await fetchFn(url, auth(await refreshAccessToken()));
      return res;
    }
  };
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function createAuthClient({getAccessToken:g,refreshAccessToken:r,fetchFn:f=globalThis.fetch}){return{async request(u,o={}){const a=t=>({...o,headers:{...o.headers,Authorization:'Bearer '+t}});let res=await f(u,a(g()));if(res.status===401)res=await f(u,a(await r()));return res;}};}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function createAuthClient({ getAccessToken, refreshAccessToken, fetchFn = globalThis.fetch }) {
  return {
    async request(url, options = {}) {
      const makeOpts = (token) => ({
        ...options,
        headers: { ...options.headers, Authorization: \`Bearer \${token}\` }
      });
      let res = await fetchFn(url, makeOpts(getAccessToken()));
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        res = await fetchFn(url, makeOpts(refreshed));
      }
      return res;
    }
  };
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 2. TYPESCRIPT ──────────────────────────────────────────────────────────
  'ts-result-container': {
    bare: {
      code: `export function Ok(value) { return { ok: true, value }; }
export function Err(error) { return { ok: false, error }; }
export function isOk(result) { return Boolean(result && result.ok === true); }
export function unwrapOr(result, fallback) { return isOk(result) ? result.value : fallback; }`,
      narration: `TypeScript Result container pattern helpers.`,
      deps: []
    },
    ponytail: {
      code: `export const Ok = value => ({ ok: true, value });
export const Err = error => ({ ok: false, error });
export const isOk = r => r?.ok === true;
export const unwrapOr = (r, f) => r?.ok ? r.value : f;`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export const Ok=v=>({ok:true,value:v}),Err=e=>({ok:false,error:e}),isOk=r=>r?.ok===true,unwrapOr=(r,f)=>r?.ok?r.value:f;`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export const Ok = (value) => ({ ok: true, value });
export const Err = (error) => ({ ok: false, error });
export const isOk = (result) => Boolean(result?.ok === true);
export const unwrapOr = (result, fallback) => (result?.ok ? result.value : fallback);`,
      narration: ``,
      deps: []
    }
  },

  'ts-deep-partial': {
    bare: {
      code: `export function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (target && source && typeof target === 'object' && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}`,
      narration: `Deep merge utility function.`,
      deps: []
    },
    ponytail: {
      code: `export function deepMerge(t, s) {
  const o = structuredClone(t);
  for (const k in s) o[k] = (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) ? deepMerge(o[k] || {}, s[k]) : s[k];
  return o;
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function deepMerge(t,s){const o=structuredClone(t);for(const k in s)o[k]=(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))?deepMerge(o[k]||{},s[k]):s[k];return o;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function deepMerge(target, source) {
  const out = structuredClone(target ?? {});
  if (!source || typeof source !== 'object') return out;
  for (const [key, val] of Object.entries(source)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = deepMerge(out[key] || {}, val);
    } else {
      out[key] = val;
    }
  }
  return out;
}`,
      narration: ``,
      deps: []
    }
  },

  'ts-typed-emitter': {
    bare: {
      code: `export class TypedEventEmitter {
  constructor() { this.listeners = new Map(); }
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  emit(event, payload) {
    if (this.listeners.has(event)) {
      for (const h of this.listeners.get(event)) h(payload);
    }
  }
  off(event, handler) {
    if (this.listeners.has(event)) this.listeners.get(event).delete(handler);
  }
}`,
      narration: `Type safe event emitter using Set listeners.`,
      deps: []
    },
    ponytail: {
      code: `export class TypedEventEmitter {
  m = new Map();
  on(e, h) { (this.m.get(e) || this.m.set(e, new Set()).get(e)).add(h); return () => this.off(e, h); }
  emit(e, d) { this.m.get(e)?.forEach(h => h(d)); }
  off(e, h) { this.m.get(e)?.delete(h); }
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export class TypedEventEmitter{m=new Map();on(e,h){(this.m.get(e)||this.m.set(e,new Set()).get(e)).add(h);return()=>this.off(e,h);}emit(e,d){this.m.get(e)?.forEach(h=>h(d));}off(e,h){this.m.get(e)?.delete(h);}}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export class TypedEventEmitter {
  #events = new Map();
  on(event, handler) {
    let set = this.#events.get(event);
    if (!set) this.#events.set(event, (set = new Set()));
    set.add(handler);
    return () => this.off(event, handler);
  }
  emit(event, payload) {
    this.#events.get(event)?.forEach(fn => fn(payload));
  }
  off(event, handler) {
    this.#events.get(event)?.delete(handler);
  }
}`,
      narration: ``,
      deps: []
    }
  },

  'ts-schema-validator': {
    bare: {
      code: `export function validateSchema(data, schema) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Input data is missing or not an object'] };
  }
  const errors = [];
  for (const [key, type] of Object.entries(schema)) {
    const val = data[key];
    if (val === undefined) {
      errors.push(\`Field \${key} is missing or not a \${type}\`);
      continue;
    }
    if (type === 'array') {
      if (!Array.isArray(val)) errors.push(\`Field \${key} is missing or not a array\`);
    } else if (typeof val !== type) {
      errors.push(\`Field \${key} is missing or not a \${type}\`);
    }
  }
  return { valid: errors.length === 0, errors };
}`,
      narration: `Schema validation function checking types and arrays with errors array.`,
      deps: []
    },
    ponytail: {
      code: `export function validateSchema(data, schema) {
  if (!data || typeof data !== 'object') return { valid: false, errors: ['Invalid input'] };
  const errors = Object.entries(schema).filter(([k, t]) => t === 'array' ? !Array.isArray(data[k]) : typeof data[k] !== t).map(([k, t]) => \`Field \${k} is missing or not a \${t}\`);
  return { valid: errors.length === 0, errors };
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function validateSchema(d,s){if(!d||typeof d!=='object')return{valid:false,errors:['bad']};const errors=Object.entries(s).filter(([k,t])=>t==='array'?!Array.isArray(d[k]):typeof d[k]!==t).map(([k,t])=>\`Field \${k} is missing or not a \${t}\`);return{valid:errors.length===0,errors};}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function validateSchema(data, schema) {
  if (!data || typeof data !== 'object') return { valid: false, errors: ['Invalid data object'] };
  const errors = [];
  for (const [key, expectedType] of Object.entries(schema)) {
    const val = data[key];
    const matches = expectedType === 'array' ? Array.isArray(val) : typeof val === expectedType;
    if (!matches) errors.push(\`Field \${key} is missing or not a \${expectedType}\`);
  }
  return { valid: errors.length === 0, errors };
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 3. NODE.JS ─────────────────────────────────────────────────────────────
  'node-safe-exec': {
    bare: {
      code: `import { spawn } from 'node:child_process';
export function executeCommand(cmd, args = [], options = {}) {
  return new Promise((resolve) => {
    const timeoutMs = options.timeoutMs || 5000;
    const maxBuffer = options.maxBuffer || 64 * 1024;
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const child = spawn(cmd, args, { windowsHide: true });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);
    child.stdout?.on('data', d => { if (stdout.length < maxBuffer) stdout += d.toString(); });
    child.stderr?.on('data', d => { if (stderr.length < maxBuffer) stderr += d.toString(); });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}`,
      narration: `Safe child process execution with timeout and buffer cap.`,
      deps: []
    },
    ponytail: {
      code: `import { spawn } from 'node:child_process';
export function executeCommand(cmd, args = [], opts = {}) {
  return new Promise(res => {
    let out = '', err = '', t = false;
    const c = spawn(cmd, args, { windowsHide: true });
    const timer = setTimeout(() => { t = true; c.kill(); }, opts.timeoutMs || 5000);
    c.stdout?.on('data', d => out += d);
    c.stderr?.on('data', d => err += d);
    c.on('close', code => { clearTimeout(timer); res({ code, stdout: out, stderr: err, timedOut: t }); });
  });
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `import{spawn}from'node:child_process';export function executeCommand(c,a=[],o={}){return new Promise(r=>{let s='',e='',t=false;const p=spawn(c,a,{windowsHide:true}),tm=setTimeout(()=>{t=true;p.kill();},o.timeoutMs||5000);p.stdout?.on('data',d=>s+=d);p.stderr?.on('data',d=>e+=d);p.on('close',code=>{clearTimeout(tm);r({code,stdout:s,stderr:e,timedOut:t});});});}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `import { spawn } from 'node:child_process';
export function executeCommand(cmd, args = [], options = {}) {
  return new Promise((resolve) => {
    const timeoutMs = options.timeoutMs ?? 5000;
    const maxBuffer = options.maxBuffer ?? 65536;
    let stdout = '', stderr = '', timedOut = false;
    const child = spawn(cmd, args, { windowsHide: true });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.stdout?.on('data', chunk => { if (stdout.length < maxBuffer) stdout += chunk.toString(); });
    child.stderr?.on('data', chunk => { if (stderr.length < maxBuffer) stderr += chunk.toString(); });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}`,
      narration: ``,
      deps: []
    }
  },

  'node-atomic-file': {
    bare: {
      code: `import fs from 'node:fs/promises';
export async function writeJsonAtomic(filePath, data) {
  const tmpPath = \`\${filePath}.tmp.\${Date.now()}.\${Math.random().toString(36).slice(2)}\`;
  try {
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    try { await fs.unlink(tmpPath); } catch {}
    throw err;
  }
}`,
      narration: `Atomic file writing using temporary file and atomic rename.`,
      deps: []
    },
    ponytail: {
      code: `import fs from 'node:fs/promises';
export async function writeJsonAtomic(f, d) {
  const tmp = \`\${f}.tmp.\${Date.now()}\`;
  await fs.writeFile(tmp, JSON.stringify(d));
  await fs.rename(tmp, f);
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `import fs from'node:fs/promises';export async function writeJsonAtomic(f,d){const t=\`\${f}.t\${Date.now()}\`;await fs.writeFile(t,JSON.stringify(d));await fs.rename(t,f);}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `import fs from 'node:fs/promises';
export async function writeJsonAtomic(filePath, data) {
  const tmpFile = \`\${filePath}.tmp.\${Date.now()}\`;
  try {
    await fs.writeFile(tmpFile, JSON.stringify(data), 'utf-8');
    await fs.rename(tmpFile, filePath);
  } catch (err) {
    try { await fs.unlink(tmpFile); } catch {}
    throw err;
  }
}`,
      narration: ``,
      deps: []
    }
  },

  'node-env-parser': {
    bare: {
      code: `export function loadEnvConfig(envObj, schema) {
  const config = {};
  const missing = [];
  for (const [key, rules] of Object.entries(schema)) {
    const raw = envObj[key];
    if (raw === undefined || raw === '') {
      if (rules.required) missing.push(key);
      else config[key] = rules.default;
      continue;
    }
    if (rules.type === 'number') config[key] = Number(raw);
    else if (rules.type === 'boolean') config[key] = raw === 'true' || raw === '1';
    else config[key] = String(raw);
  }
  if (missing.length > 0) throw new Error(\`Missing required env variables: \${missing.join(', ')}\`);
  return config;
}`,
      narration: `Env parser with type coercion and required assertions.`,
      deps: []
    },
    ponytail: {
      code: `export function loadEnvConfig(env, schema) {
  const out = {};
  for (const [k, s] of Object.entries(schema)) {
    const v = env[k];
    if (v === undefined) {
      if (s.required) throw new Error(\`Missing \${k}\`);
      out[k] = s.default;
    } else {
      out[k] = s.type === 'number' ? Number(v) : s.type === 'boolean' ? v === 'true' : v;
    }
  }
  return out;
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function loadEnvConfig(e,s){const o={};for(const[k,c]of Object.entries(s)){const v=e[k];if(v===undefined){if(c.required)throw new Error(k);o[k]=c.default;}else o[k]=c.type==='number'?+v:c.type==='boolean'?v==='true':v;}return o;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function loadEnvConfig(envObj, schema) {
  const result = {};
  for (const [key, rules] of Object.entries(schema)) {
    const raw = envObj[key];
    if (raw === undefined || raw === '') {
      if (rules.required) throw new Error(\`Missing required variable: \${key}\`);
      result[key] = rules.default;
      continue;
    }
    result[key] = rules.type === 'number' ? Number(raw) : rules.type === 'boolean' ? raw === 'true' : String(raw);
  }
  return result;
}`,
      narration: ``,
      deps: []
    }
  },

  'node-rate-limiter': {
    bare: {
      code: `export class TokenBucketLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  tryConsume(tokens = 1) {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = now;
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}`,
      narration: `Token bucket limiter implementation.`,
      deps: []
    },
    ponytail: {
      code: `export class TokenBucketLimiter {
  constructor(c, r) { this.c = c; this.r = r; this.t = c; this.last = Date.now(); }
  tryConsume(n = 1) {
    const now = Date.now();
    this.t = Math.min(this.c, this.t + ((now - this.last) / 1000) * this.r);
    this.last = now;
    if (this.t >= n) { this.t -= n; return true; }
    return false;
  }
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export class TokenBucketLimiter{constructor(c,r){this.c=c;this.r=r;this.t=c;this.l=Date.now();}tryConsume(n=1){const nw=Date.now();this.t=Math.min(this.c,this.t+((nw-this.l)/1000)*this.r);this.l=nw;if(this.t>=n){this.t-=n;return true;}return false;}}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export class TokenBucketLimiter {
  #capacity; #rate; #tokens; #last;
  constructor(capacity, refillRatePerSec) {
    this.#capacity = capacity;
    this.#rate = refillRatePerSec;
    this.#tokens = capacity;
    this.#last = performance.now();
  }
  tryConsume(tokens = 1) {
    const now = performance.now();
    this.#tokens = Math.min(this.#capacity, this.#tokens + ((now - this.#last) / 1000) * this.#rate);
    this.#last = now;
    if (this.#tokens >= tokens) {
      this.#tokens -= tokens;
      return true;
    }
    return false;
  }
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 4. FRONTEND / REACT ───────────────────────────────────────────────────
  'react-debounce-hook': {
    bare: {
      code: `export function debounce(fn, waitMs) {
  let timerId = null;
  let lastArgs = null;
  function debounced(...args) {
    lastArgs = args;
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...lastArgs);
      timerId = null;
    }, waitMs);
  }
  debounced.cancel = () => {
    if (timerId) { clearTimeout(timerId); timerId = null; }
  };
  debounced.flush = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
      fn(...lastArgs);
    }
  };
  return debounced;
}`,
      narration: `Debounce utility with cancel and flush support.`,
      deps: []
    },
    ponytail: {
      code: `export function debounce(fn, ms) {
  let t, args;
  const d = (...a) => { args = a; clearTimeout(t); t = setTimeout(() => { fn(...args); t = null; }, ms); };
  d.cancel = () => clearTimeout(t);
  d.flush = () => { if (t) { clearTimeout(t); t = null; fn(...args); } };
  return d;
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function debounce(f,m){let t,a;const d=(...x)=>{a=x;clearTimeout(t);t=setTimeout(()=>{f(...a);t=null;},m);};d.cancel=()=>clearTimeout(t);d.flush=()=>{if(t){clearTimeout(t);t=null;f(...a);}};return d;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function debounce(fn, waitMs) {
  let timer = null, pendingArgs = null;
  const debounced = (...args) => {
    pendingArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...pendingArgs);
      timer = null;
    }, waitMs);
  };
  debounced.cancel = () => { clearTimeout(timer); timer = null; };
  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      fn(...pendingArgs);
    }
  };
  return debounced;
}`,
      narration: ``,
      deps: []
    }
  },

  'react-previous-hook': {
    bare: {
      code: `export function createPreviousTracker() {
  let prevValue = undefined;
  return {
    update(val) {
      const currentPrev = prevValue;
      prevValue = val;
      return currentPrev;
    },
    getPrevious() {
      return prevValue;
    }
  };
}`,
      narration: `State tracker remembering prior values.`,
      deps: []
    },
    ponytail: {
      code: `export function createPreviousTracker() {
  let p;
  return { update: v => { const old = p; p = v; return old; }, getPrevious: () => p };
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function createPreviousTracker(){let p;return{update:v=>{const o=p;p=v;return o;},getPrevious:()=>p};}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function createPreviousTracker() {
  let previous;
  return {
    update: (value) => {
      const prior = previous;
      previous = value;
      return prior;
    },
    getPrevious: () => previous
  };
}`,
      narration: ``,
      deps: []
    }
  },

  'react-dialog-trap': {
    bare: {
      code: `export function createDialogController(initialOpen = false) {
  let open = initialOpen;
  return {
    isOpen() { return open; },
    open() { open = true; },
    close() { open = false; },
    handleKeyDown(event) {
      if (event && event.key === 'Escape' && open) {
        open = false;
      }
    }
  };
}`,
      narration: `Modal dialog controller managing open state and escape key dismissal.`,
      deps: []
    },
    ponytail: {
      code: `export function createDialogController(o = false) {
  return { isOpen: () => o, open: () => { o = true; }, close: () => { o = false; }, handleKeyDown: e => { if (e.key === 'Escape') o = false; } };
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function createDialogController(o=false){return{isOpen:()=>o,open:()=>{o=true;},close:()=>{o=false;},handleKeyDown:e=>{if(e.key==='Escape')o=false;}};}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function createDialogController(initialOpen = false) {
  let open = Boolean(initialOpen);
  return {
    isOpen: () => open,
    open: () => { open = true; },
    close: () => { open = false; },
    handleKeyDown: (e) => { if (open && e?.key === 'Escape') open = false; }
  };
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 5. BUG FIXING ──────────────────────────────────────────────────────────
  'bug-race-condition': {
    bare: {
      code: `export class AsyncLock {
  constructor() {
    this.queue = Promise.resolve();
  }
  acquire() {
    let release;
    const ticket = new Promise(resolve => { release = resolve; });
    const current = this.queue;
    this.queue = this.queue.then(() => ticket);
    return current.then(() => release);
  }
  async runExclusive(fn) {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
}`,
      narration: `Async mutex lock resolving lost updates through sequential queuing.`,
      deps: []
    },
    ponytail: {
      code: `export class AsyncLock {
  p = Promise.resolve();
  async runExclusive(fn) {
    let r; const ticket = new Promise(res => { r = res; });
    const cur = this.p; this.p = this.p.then(() => ticket);
    await cur;
    try { return await fn(); } finally { r(); }
  }
  acquire() {
    let r; const ticket = new Promise(res => { r = res; });
    const cur = this.p; this.p = this.p.then(() => ticket);
    return cur.then(() => r);
  }
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export class AsyncLock{p=Promise.resolve();async runExclusive(f){let r;const t=new Promise(res=>{r=res;}),c=this.p;this.p=this.p.then(()=>t);await c;try{return await f();}finally{r();}}acquire(){let r;const t=new Promise(res=>{r=res;}),c=this.p;this.p=this.p.then(()=>t);return c.then(()=>r);}}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export class AsyncLock {
  #queue = Promise.resolve();
  acquire() {
    let release;
    const next = new Promise(resolve => { release = resolve; });
    const wait = this.#queue;
    this.#queue = this.#queue.then(() => next);
    return wait.then(() => release);
  }
  async runExclusive(fn) {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
}`,
      narration: ``,
      deps: []
    }
  },

  'bug-event-leak': {
    bare: {
      code: `export class SubscriptionHub {
  constructor() { this.topics = new Map(); }
  subscribe(topic, handler) {
    if (!this.topics.has(topic)) this.topics.set(topic, new Set());
    const set = this.topics.get(topic);
    set.add(handler);
    return {
      dispose: () => { set.delete(handler); }
    };
  }
  publish(topic, data) {
    if (this.topics.has(topic)) {
      this.topics.get(topic).forEach(h => h(data));
    }
  }
  getListenerCount(topic) {
    return this.topics.get(topic)?.size || 0;
  }
}`,
      narration: `Pub sub subscription hub with leak-free disposal pattern.`,
      deps: []
    },
    ponytail: {
      code: `export class SubscriptionHub {
  m = new Map();
  subscribe(t, h) { (this.m.get(t) || this.m.set(t, new Set()).get(t)).add(h); return { dispose: () => this.m.get(t)?.delete(h) }; }
  publish(t, d) { this.m.get(t)?.forEach(h => h(d)); }
  getListenerCount(t) { return this.m.get(t)?.size || 0; }
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export class SubscriptionHub{m=new Map();subscribe(t,h){(this.m.get(t)||this.m.set(t,new Set()).get(t)).add(h);return{dispose:()=>this.m.get(t)?.delete(h)};}publish(t,d){this.m.get(t)?.forEach(h=>h(d));}getListenerCount(t){return this.m.get(t)?.size||0;}}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export class SubscriptionHub {
  #topics = new Map();
  subscribe(topic, handler) {
    let set = this.#topics.get(topic);
    if (!set) this.#topics.set(topic, (set = new Set()));
    set.add(handler);
    return { dispose: () => { set.delete(handler); } };
  }
  publish(topic, data) {
    this.#topics.get(topic)?.forEach(fn => fn(data));
  }
  getListenerCount(topic) {
    return this.#topics.get(topic)?.size ?? 0;
  }
}`,
      narration: ``,
      deps: []
    }
  },

  'bug-pagination-bounds': {
    bare: {
      code: `export function paginate(options) {
  const totalItems = Math.max(0, options.totalItems || 0);
  const pageSize = Math.max(1, options.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, options.currentPage || 1), totalPages);
  const offset = (validPage - 1) * pageSize;
  return {
    totalPages,
    offset,
    limit: pageSize,
    hasPrev: validPage > 1,
    hasNext: validPage < totalPages,
    validPage
  };
}`,
      narration: `Paginate helper clamping negative pages and 0 item totalPages.`,
      deps: []
    },
    ponytail: {
      code: `export function paginate({ totalItems: t = 0, pageSize: s = 10, currentPage: p = 1 }) {
  const pages = Math.max(1, Math.ceil(t / s)), page = Math.min(Math.max(1, p), pages);
  return { totalPages: pages, offset: (page - 1) * s, limit: s, hasPrev: page > 1, hasNext: page < pages, validPage: page };
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function paginate({totalItems:t=0,pageSize:s=10,currentPage:p=1}){const tp=Math.max(1,Math.ceil(t/s)),vp=Math.min(Math.max(1,p),tp);return{totalPages:tp,offset:(vp-1)*s,limit:s,hasPrev:vp>1,hasNext:vp<tp,validPage:vp};}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function paginate({ totalItems = 0, pageSize = 10, currentPage = 1 }) {
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  return {
    totalPages,
    offset: (validPage - 1) * pageSize,
    limit: pageSize,
    hasPrev: validPage > 1,
    hasNext: validPage < totalPages,
    validPage
  };
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 6. SECURITY & VALIDATION ──────────────────────────────────────────────
  'sec-redirect-sanitizer': {
    bare: {
      code: `export function sanitizeRedirectUrl(targetUrl, allowedHosts = ['example.com']) {
  if (!targetUrl || typeof targetUrl !== 'string') return '/';
  const trimmed = targetUrl.trim();
  if (trimmed.startsWith('//') || trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return '/';
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && allowedHosts.includes(parsed.hostname)) {
      return trimmed;
    }
    return '/';
  } catch {
    return '/';
  }
}`,
      narration: `Open redirect attack sanitizer guarding against external domains and javascript URLs.`,
      deps: []
    },
    ponytail: {
      code: `export function sanitizeRedirectUrl(url, hosts = ['example.com']) {
  if (!url || url.startsWith('//') || /^(javascript|data):/i.test(url)) return '/';
  if (url.startsWith('/')) return url;
  try { const u = new URL(url); return hosts.includes(u.hostname) ? url : '/'; } catch { return '/'; }
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function sanitizeRedirectUrl(u,h=['example.com']){if(!u||u.startsWith('//')||/^(javascript|data):/i.test(u))return'/';if(u.startsWith('/'))return u;try{return h.includes(new URL(u).hostname)?u:'/';}catch{return'/';}}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function sanitizeRedirectUrl(targetUrl, allowedHosts = ['example.com']) {
  if (typeof targetUrl !== 'string' || !targetUrl) return '/';
  const url = targetUrl.trim();
  if (url.startsWith('//') || /^(javascript|data):/i.test(url)) return '/';
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '/';
    return allowedHosts.includes(parsed.hostname) ? url : '/';
  } catch {
    return '/';
  }
}`,
      narration: ``,
      deps: []
    }
  },

  'sec-timing-safe-eq': {
    bare: {
      code: `import crypto from 'node:crypto';
export function timingSafeEqual(strA, strB) {
  if (typeof strA !== 'string' || typeof strB !== 'string') return false;
  const bufA = Buffer.from(strA);
  const bufB = Buffer.from(strB);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}`,
      narration: `Constant time string comparison using Node.js crypto module.`,
      deps: []
    },
    ponytail: {
      code: `import crypto from 'node:crypto';
export const timingSafeEqual = (a, b) => {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `import crypto from'node:crypto';export const timingSafeEqual=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);};`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `import crypto from 'node:crypto';
export function timingSafeEqual(strA, strB) {
  if (typeof strA !== 'string' || typeof strB !== 'string') return false;
  const a = Buffer.from(strA);
  const b = Buffer.from(strB);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 7. REFACTORING ────────────────────────────────────────────────────────
  'refactor-date-formatter': {
    bare: {
      code: `export function formatIsoDate(dateInput, locale = 'en-US') {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
}`,
      narration: `Date formatting utility using UTC components.`,
      deps: []
    },
    ponytail: {
      code: `export function formatIsoDate(d) {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date) ? null : date.toISOString().slice(0, 10);
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function formatIsoDate(d){if(!d)return null;const x=new Date(d);return isNaN(x)?null:x.toISOString().slice(0,10);}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function formatIsoDate(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}`,
      narration: ``,
      deps: []
    }
  },

  'refactor-promise-pipeline': {
    bare: {
      code: `export async function processPipeline(initialValue, steps = []) {
  let current = initialValue;
  for (let i = 0; i < steps.length; i++) {
    try {
      current = await steps[i](current);
    } catch (err) {
      return { success: false, error: err.message || String(err), stepIndex: i };
    }
  }
  return { success: true, value: current };
}`,
      narration: `Sequential promise processing pipeline with error handling.`,
      deps: []
    },
    ponytail: {
      code: `export async function processPipeline(val, steps = []) {
  for (let i = 0; i < steps.length; i++) {
    try { val = await steps[i](val); } catch (e) { return { success: false, error: e.message, stepIndex: i }; }
  }
  return { success: true, value: val };
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export async function processPipeline(v,s=[]){for(let i=0;i<s.length;i++){try{v=await s[i](v);}catch(e){return{success:false,error:e.message,stepIndex:i};}}return{success:true,value:v};}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export async function processPipeline(initialValue, steps = []) {
  let val = initialValue;
  for (let i = 0; i < steps.length; i++) {
    try {
      val = await steps[i](val);
    } catch (err) {
      return { success: false, error: err?.message ?? String(err), stepIndex: i };
    }
  }
  return { success: true, value: val };
}`,
      narration: ``,
      deps: []
    }
  },

  // ─── 8. DATA & FILESYSTEM ──────────────────────────────────────────────────
  'fs-csv-parser': {
    bare: {
      code: `export function parseCsvRow(rowString) {
  const result = [];
  let current = '';
  let insideQuotes = false;
  for (let i = 0; i < rowString.length; i++) {
    const char = rowString[i];
    if (char === '"') {
      if (insideQuotes && rowString[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}`,
      narration: `Quoted CSV row parser handling inner commas and escaped quotes.`,
      deps: []
    },
    ponytail: {
      code: `export function parseCsvRow(row) {
  const res = []; let cur = '', q = false;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '"') { if (q && row[i+1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (row[i] === ',' && !q) { res.push(cur); cur = ''; }
    else cur += row[i];
  }
  res.push(cur); return res;
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `export function parseCsvRow(r){const res=[];let c='',q=false;for(let i=0;i<r.length;i++){if(r[i]==='"'){if(q&&r[i+1]==='"'){c+='"';i++;}else q=!q;}else if(r[i]===','&&!q){res.push(c);c='';}else c+=r[i];}res.push(c);return res;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `export function parseCsvRow(rowString) {
  const fields = [];
  let field = '', inQuotes = false;
  for (let i = 0; i < rowString.length; i++) {
    const ch = rowString[i];
    if (ch === '"') {
      if (inQuotes && rowString[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}`,
      narration: ``,
      deps: []
    }
  },

  'fs-walk-dir': {
    bare: {
      code: `import fs from 'node:fs/promises';
import path from 'node:path';
export async function walkDir(dirPath, options = {}) {
  const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 3;
  const extension = options.extension || null;
  const results = [];
  async function traverse(currentDir, currentDepth) {
    if (currentDepth > maxDepth) return;
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await traverse(full, currentDepth + 1);
      } else if (entry.isFile()) {
        if (!extension || entry.name.endsWith(extension)) {
          results.push(path.relative(dirPath, full).replace(/\\\\/g, '/'));
        }
      }
    }
  }
  await traverse(dirPath, 1);
  return results;
}`,
      narration: `Directory walking traversal with depth guarding and extension filtering.`,
      deps: []
    },
    ponytail: {
      code: `import fs from 'node:fs/promises';
import path from 'node:path';
export async function walkDir(dir, { maxDepth = 3, extension = null } = {}) {
  const res = [];
  async function walk(d, depth) {
    if (depth > maxDepth) return;
    for (const e of await fs.readdir(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) await walk(f, depth + 1);
      else if (!extension || e.name.endsWith(extension)) res.push(path.relative(dir, f).replace(/\\\\/g, '/'));
    }
  }
  await walk(dir, 1);
  return res;
}`,
      narration: ``,
      deps: []
    },
    caveman: {
      code: `import fs from'node:fs/promises';import path from'node:path';export async function walkDir(d,{maxDepth:m=3,extension:x=null}={}){const r=[];async function w(cur,dp){if(dp>m)return;for(const e of await fs.readdir(cur,{withFileTypes:true})){const f=path.join(cur,e.name);if(e.isDirectory())await w(f,dp+1);else if(!x||e.name.endsWith(x))r.push(path.relative(d,f).replace(/\\\\/g,'/'));}}await w(d,1);return r;}`,
      narration: ``,
      deps: []
    },
    grandpa: {
      code: `import fs from 'node:fs/promises';
import path from 'node:path';
export async function walkDir(dirPath, { maxDepth = 3, extension = null } = {}) {
  const files = [];
  async function traverse(current, depth) {
    if (depth > maxDepth) return;
    const dirents = await fs.readdir(current, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.join(current, dirent.name);
      if (dirent.isDirectory()) {
        await traverse(res, depth + 1);
      } else if (dirent.isFile() && (!extension || dirent.name.endsWith(extension))) {
        files.push(path.relative(dirPath, res).replace(/\\\\/g, '/'));
      }
    }
  }
  await traverse(dirPath, 1);
  return files;
}`,
      narration: ``,
      deps: []
    }
  }
};

/**
 * Generates initial turn candidate response for a strategy
 */
export function generateInitialCandidate(strategy, task, options = {}) {
  const systemPrompt = STRATEGY_PROMPTS[strategy];
  const taskImpl = INITIAL_IMPLEMENTATIONS[task.id]?.[strategy];

  if (!taskImpl) {
    throw new Error(`Missing initial candidate implementation for task: ${task.id}, strategy: ${strategy}`);
  }

  const promptText = task.prompt;
  const inputTokens = estimateTokens(systemPrompt) + estimateTokens(promptText) + (options.contextTokens || 50);

  let outputText = '';
  if (taskImpl.narration) {
    outputText += `${taskImpl.narration}\n\n`;
  }
  outputText += `\`\`\`javascript\n${taskImpl.code}\n\`\`\``;

  const outputTokens = estimateTokens(outputText);
  const ttftMs = strategy === 'grandpa' ? 420 : strategy === 'caveman' ? 510 : strategy === 'ponytail' ? 550 : 720;
  const generationMs = Math.round(outputTokens * 18);

  return {
    strategy,
    code: taskImpl.code,
    explanation: taskImpl.narration,
    inputTokens,
    outputTokens,
    dependencies: taskImpl.deps || [],
    ttftMs,
    generationMs
  };
}

/**
 * Generates repair turn candidate response for a strategy when verification fails
 */
export function generateRepairCandidate(strategy, task, failedCode, diagnostic, attemptNumber) {
  const systemPrompt = STRATEGY_PROMPTS[strategy];
  const repairPrompt = `The previous implementation failed verification with error:\n${diagnostic}\n\nFix the issue and provide working code.`;
  const repairInputTokens = estimateTokens(systemPrompt) + estimateTokens(failedCode) + estimateTokens(repairPrompt);

  let fixedCode = failedCode;
  let explanation = '';

  // Apply real repair according to failure mode
  if (task.id === 'net-fetch-timeout') {
    if (strategy === 'ponytail') {
      fixedCode = `export const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(opts.timeoutMs || 5000) });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
};`;
      explanation = `Fixed missing timeout and status check.`;
    } else if (strategy === 'caveman') {
      fixedCode = `export const fetchJson=async(u,o={})=>{const r=await fetch(u,{signal:AbortSignal.timeout(o.timeoutMs||5000)});if(!r.ok)throw new Error(r.status);return r.json();};`;
      explanation = ``;
    }
  } else if (task.id === 'react-previous-hook') {
    if (strategy === 'grandpa') {
      fixedCode = `export function createPreviousTracker() {
  let prev, curr;
  return {
    update: (val) => { prev = curr; curr = val; return prev; },
    getPrevious: () => prev
  };
};`;
      explanation = `Fixed getPrevious to return last recorded prior value instead of current.`;
    } else if (strategy === 'ponytail') {
      fixedCode = `export function createPreviousTracker() {
  let p, c;
  return { update: v => { p = c; c = v; return p; }, getPrevious: () => p };
};`;
      explanation = ``;
    } else if (strategy === 'caveman') {
      fixedCode = `export function createPreviousTracker(){let p,c;return{update:v=>{p=c;c=v;return p;},getPrevious:()=>p};};`;
      explanation = ``;
    } else if (strategy === 'bare') {
      fixedCode = `export function createPreviousTracker() {
  let previousValue = undefined;
  let currentValue = undefined;
  return {
    update(val) {
      previousValue = currentValue;
      currentValue = val;
      return previousValue;
    },
    getPrevious() {
      return previousValue;
    }
  };
};`;
      explanation = `Fixed tracker to preserve both prior and current values so getPrevious returns the prior state.`;
    }
  }

  let outputText = explanation ? `${explanation}\n\n` : '';
  outputText += `\`\`\`javascript\n${fixedCode}\n\`\`\``;
  const repairOutputTokens = estimateTokens(outputText);
  const generationMs = Math.round(repairOutputTokens * 20);

  return {
    strategy,
    code: fixedCode,
    explanation,
    repairInputTokens,
    repairOutputTokens,
    generationMs
  };
}
