import assert from 'node:assert';
import { createDialogController } from './candidate.js';

const ctrl = createDialogController();
assert.strictEqual(ctrl.isOpen(), false);
ctrl.open();
assert.strictEqual(ctrl.isOpen(), true);

ctrl.handleKeyDown({ key: 'Escape' });
assert.strictEqual(ctrl.isOpen(), false, 'Escape key must close dialog');
