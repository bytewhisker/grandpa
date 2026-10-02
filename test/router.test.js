import assert from 'node:assert';
import {
  classifyTaskIntent,
  EscalationController,
  shouldStopExecution,
  formatConciseFinalResponse,
  EXECUTION_MODES
} from '../src/router.js';

console.log('Running Grandpa Router & Escalation Unit Tests...');

// 1. Classification Tests
assert.strictEqual(classifyTaskIntent('Style a purple button with CSS'), EXECUTION_MODES.QUICK);
assert.strictEqual(classifyTaskIntent('Create date picker input'), EXECUTION_MODES.QUICK);
assert.strictEqual(classifyTaskIntent('Fix race condition in bank transaction mutex'), EXECUTION_MODES.DEEP);
assert.strictEqual(classifyTaskIntent('Database migration for user accounts table'), EXECUTION_MODES.DEEP);
assert.strictEqual(classifyTaskIntent('Refactor data pipeline across three modules'), EXECUTION_MODES.STANDARD);

// 2. Escalation Controller Tests
const controller = new EscalationController(EXECUTION_MODES.QUICK);
assert.strictEqual(controller.currentMode, EXECUTION_MODES.QUICK);

// Failure in Quick -> Escalates to Standard
const step1 = controller.evaluateVerification({ passed: false, status: 'TEST_FAILURE' });
assert.strictEqual(step1.shouldStop, false);
assert.strictEqual(step1.nextMode, EXECUTION_MODES.STANDARD);
assert.strictEqual(controller.currentMode, EXECUTION_MODES.STANDARD);

// Failure in Standard -> Escalates to Deep
const step2 = controller.evaluateVerification({ passed: false, status: 'TEST_FAILURE' });
assert.strictEqual(step2.shouldStop, false);
assert.strictEqual(step2.nextMode, EXECUTION_MODES.DEEP);
assert.strictEqual(controller.currentMode, EXECUTION_MODES.DEEP);

// Pass in Deep -> Stops immediately
const step3 = controller.evaluateVerification({ passed: true, status: 'PASS' });
assert.strictEqual(step3.shouldStop, true);
assert.strictEqual(step3.nextMode, EXECUTION_MODES.DEEP);

// 3. Strict Stop Condition Tests
assert.strictEqual(
  shouldStopExecution({
    requestedTaskComplete: true,
    relevantTestsPass: true,
    requiredBuildChecksPass: true,
    requiredBehaviorPreserved: true,
    noKnownRequiredWork: true
  }),
  true
);

assert.strictEqual(
  shouldStopExecution({
    requestedTaskComplete: true,
    relevantTestsPass: false, // failing test
    requiredBuildChecksPass: true,
    requiredBehaviorPreserved: true,
    noKnownRequiredWork: true
  }),
  false
);

// 4. Concise Final Response Formatter
const response = formatConciseFinalResponse({
  actionSummary: 'Fixed timeout/error handling.',
  testsPassed: 8,
  testsTotal: 8
});
assert.strictEqual(response, 'Fixed timeout/error handling.\nTests: 8/8 passing.');

console.log('Grandpa Router & Escalation tests passed successfully!');
