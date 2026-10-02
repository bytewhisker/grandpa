import assert from 'node:assert';
import { SubscriptionHub } from './candidate.js';

const hub = new SubscriptionHub();
const sub1 = hub.subscribe('news', () => {});
const sub2 = hub.subscribe('news', () => {});
assert.strictEqual(hub.getListenerCount('news'), 2);

sub1.dispose();
assert.strictEqual(hub.getListenerCount('news'), 1);
sub2.dispose();
assert.strictEqual(hub.getListenerCount('news'), 0);
