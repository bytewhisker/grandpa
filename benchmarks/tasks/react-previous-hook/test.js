import assert from 'node:assert';
import { createPreviousTracker } from './candidate.js';

const tracker = createPreviousTracker();
assert.strictEqual(tracker.update(10), undefined);
assert.strictEqual(tracker.update(20), 10);
assert.strictEqual(tracker.getPrevious(), 10);
assert.strictEqual(tracker.update(30), 20);
