const assert = require('node:assert');
const { GOLDEN_REPLACEMENTS, getSystemInstructions } = require('../instructions.js');

console.log('Testing Grandpa MCP instructions...');

// 1. Verify replacements exist
assert(GOLDEN_REPLACEMENTS.axios !== undefined, 'axios replacement must exist');
assert(GOLDEN_REPLACEMENTS.moment !== undefined, 'moment replacement must exist');
assert(GOLDEN_REPLACEMENTS.uuid !== undefined, 'uuid replacement must exist');
assert(GOLDEN_REPLACEMENTS['lodash.get'] !== undefined, 'lodash.get replacement must exist');

// 2. Verify instructions output
const instructions = getSystemInstructions('hardcore');
assert(instructions.includes('HARDCORE'), 'Instructions must reflect hardcore intensity');

console.log('All MCP instruction tests passed successfully!');
