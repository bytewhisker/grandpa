import assert from 'node:assert';
import { TypedEventEmitter } from './candidate.js';

const ee = new TypedEventEmitter();
let received = null;
const unsubscribe = ee.on('userLogin', (data) => { received = data; });

ee.emit('userLogin', { id: 101 });
assert.deepStrictEqual(received, { id: 101 });

unsubscribe();
ee.emit('userLogin', { id: 999 });
assert.deepStrictEqual(received, { id: 101 }, 'Unsubscribed listener must not be called');
