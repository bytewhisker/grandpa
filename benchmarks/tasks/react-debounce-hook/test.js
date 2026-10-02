import assert from 'node:assert';
import { debounce } from './candidate.js';

let count = 0;
const increment = () => { count++; };
const debounced = debounce(increment, 50);

debounced();
debounced();
debounced();
assert.strictEqual(count, 0);

debounced.flush();
assert.strictEqual(count, 1, 'Flush must trigger pending execution');
