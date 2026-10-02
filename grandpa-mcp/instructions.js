/**
 * Grandpa MCP Server Instructions & Rule Tables
 */

const GOLDEN_REPLACEMENTS = {
  axios: {
    replacement: 'fetch',
    example: 'const res = await fetch(url); if (!res.ok) throw new Error(res.statusText); const data = await res.json();',
    note: 'Built-in on Node 18+ and all modern browsers'
  },
  moment: {
    replacement: 'Intl.DateTimeFormat / Date',
    example: "new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(new Date())",
    note: 'Standard ECMAScript internationalization API'
  },
  dayjs: {
    replacement: 'Intl.DateTimeFormat / Date',
    example: "new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date())",
    note: 'Zero dependency native formatting'
  },
  'lodash.get': {
    replacement: 'Optional Chaining (?.) and Nullish Coalescing (??)',
    example: "user?.profile?.address?.zip ?? '00000'",
    note: 'Standard JavaScript syntax since ES2020'
  },
  'lodash.clonedeep': {
    replacement: 'structuredClone()',
    example: 'const copy = structuredClone(original);',
    note: 'Deep clones objects, arrays, Maps, Sets, and binary buffers natively'
  },
  uuid: {
    replacement: 'crypto.randomUUID()',
    example: 'const id = crypto.randomUUID();',
    note: 'Cryptographically secure UUID v4 generation built into modern JS'
  },
  classnames: {
    replacement: 'Template literals or Array.filter',
    example: "[base, active && 'active', error && 'error'].filter(Boolean).join(' ')",
    note: 'Pure JS string joining'
  },
  clsx: {
    replacement: 'Template literals or Array.filter',
    example: "`${base} ${active ? 'active' : ''}`.trim()",
    note: 'Pure JS string joining'
  },
  rimraf: {
    replacement: "fs.rmSync(dir, { recursive: true, force: true })",
    example: "import fs from 'node:fs'; fs.rmSync(dir, { recursive: true, force: true });",
    note: 'Standard library node:fs'
  },
  mkdirp: {
    replacement: "fs.mkdirSync(dir, { recursive: true })",
    example: "import fs from 'node:fs'; fs.mkdirSync(dir, { recursive: true });",
    note: 'Standard library node:fs'
  },
  dotenv: {
    replacement: 'node --env-file=.env',
    example: 'node --env-file=.env server.js',
    note: 'Node 20.6+ native environment file loader'
  }
};

function getSystemInstructions(intensity = 'balanced') {
  return `Grandpa Architecture Standard (Intensity: ${intensity.toUpperCase()})
Rule 1: Cut the fat, never cut the bone.
Rule 2: Prefer standard library and native runtime primitives over third-party packages.
Rule 3: Document necessary exceptions with // grandpa: allowed dependency [pkg] - [reason].
Rule 4: Maintain production defensive safety: error handling, input validation, timeouts.`;
}

module.exports = {
  GOLDEN_REPLACEMENTS,
  getSystemInstructions
};
