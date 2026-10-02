import assert from 'node:assert';
import { sanitizeRedirectUrl } from './candidate.js';

// Safe relative
assert.strictEqual(sanitizeRedirectUrl('/dashboard'), '/dashboard');

// Safe allowed host
assert.strictEqual(sanitizeRedirectUrl('https://example.com/welcome'), 'https://example.com/welcome');

// Attack vectors
assert.strictEqual(sanitizeRedirectUrl('//attacker.com'), '/');
assert.strictEqual(sanitizeRedirectUrl('javascript:alert(1)'), '/');
assert.strictEqual(sanitizeRedirectUrl('data:text/html,evil'), '/');
assert.strictEqual(sanitizeRedirectUrl('https://evil.com/phish'), '/');
