/**
 * Grandpa Adaptive Router & Escalation Controller
 * 
 * Complies with Grandpa Specification Parts 2, 3, 10:
 * - Three execution tiers: Quick, Standard, Deep
 * - Risk & sensitivity driven routing (security/crypto/migrations force Deep even for one-line edits)
 * - Evidence-based automatic escalation: Quick -> verify -> Standard -> verify -> Deep
 * - Strict Stop Condition: halts immediately when all criteria are satisfied
 */

export const EXECUTION_MODES = {
  QUICK: 'quick',
  STANDARD: 'standard',
  DEEP: 'deep'
};

export const LATENCY_BUDGETS = {
  quick: {
    name: 'Grandpa Quick',
    targetLatencyMs: 1000,
    maxPlanningTokens: 0, // Zero planning essay
    maxContextFiles: 3,
    description: 'Trivial edits, UI components, single utility functions. Zero architectural preamble.'
  },
  standard: {
    name: 'Grandpa Standard',
    targetLatencyMs: 4000,
    maxPlanningTokens: 150,
    maxContextFiles: 8,
    description: 'Normal features, standard library refactoring, multi-file integration.'
  },
  deep: {
    name: 'Grandpa Deep',
    targetLatencyMs: 12000,
    maxPlanningTokens: 600,
    maxContextFiles: 20,
    description: 'Security, authentication, database migrations, state machines, architecture rewrites.'
  }
};

// High-risk semantic tokens that warrant Deep execution regardless of file count
const DEEP_KEYWORDS = [
  'auth', 'jwt', 'security', 'permission', 'rbac', 'cryptography', 'cipher',
  'encryption', 'database', 'migration', 'schema', 'concurrency', 'race condition',
  'deadlock', 'mutex', 'distributed', 'transaction', 'reentrancy', 'payment',
  'stripe', 'sanitize', 'sql injection', 'xss', 'csrf', 'timing attack'
];

// Low-risk semantic tokens suited for Quick mode
const QUICK_KEYWORDS = [
  'button', 'css', 'color', 'style', 'modal', 'icon', 'badge',
  'date picker', 'format date', 'uuid', 'deep clone', 'capitalize',
  'one line', 'simple', 'fix typo', 'add prop', 'toggle', 'pad', 'trim',
  'query string', 'slugify'
];

/**
 * Evaluates task intent, risk, and scope to determine starting execution mode.
 * 
 * @param {string} prompt 
 * @param {object} context 
 * @param {number} [context.filesChanged=0]
 * @param {boolean} [context.isSecuritySensitive=false]
 * @param {boolean} [context.hasMigration=false]
 * @param {boolean} [context.hasConcurrency=false]
 * @param {boolean} [context.hasSufficientContext=true]
 * @returns {'quick' | 'standard' | 'deep'}
 */
export function classifyTaskIntent(prompt = '', context = {}) {
  const p = prompt.toLowerCase();

  // 1. Explicit risk flags or security-critical domains force Deep mode immediately
  const isSecurityOrCrypto = context.isSecuritySensitive ||
    context.hasMigration ||
    context.hasConcurrency ||
    DEEP_KEYWORDS.some(kw => p.includes(kw));

  if (isSecurityOrCrypto) {
    return EXECUTION_MODES.DEEP;
  }

  // 2. High file-count or multi-module scope moves away from Quick
  const isMultiFile = context.filesChanged && context.filesChanged > 2;
  const lacksContext = context.hasSufficientContext === false;

  if (isMultiFile || lacksContext) {
    return EXECUTION_MODES.STANDARD;
  }

  // 3. Quick mode triggers for UI, simple utilities, or explicit single-file context
  const hasExplicitSingleFile = context.filesChanged === 1;
  const isQuickKeyword = QUICK_KEYWORDS.some(kw => p.includes(kw));

  if (isQuickKeyword || hasExplicitSingleFile) {
    return EXECUTION_MODES.QUICK;
  }

  // Default to standard balanced mode for new endpoints, multi-file features, or general tasks
  return EXECUTION_MODES.STANDARD;
}

/**
 * Manages evidence-based escalation transitions.
 * Escalates only when verification fails or evidence demands broader context.
 */
export class EscalationController {
  constructor(initialMode = EXECUTION_MODES.QUICK) {
    this.currentMode = initialMode;
    this.history = [initialMode];
  }

  /**
   * Evaluates verification results and returns whether to escalate or STOP
   * 
   * @param {object} verificationResult
   * @param {boolean} verificationResult.passed
   * @param {string} [verificationResult.status]
   * @returns {{ shouldStop: boolean, nextMode: string, reason: string }}
   */
  evaluateVerification(verificationResult) {
    if (verificationResult.passed) {
      return {
        shouldStop: true,
        nextMode: this.currentMode,
        reason: 'Verification passed successfully. Stopping immediately.'
      };
    }

    // Escalate based on current mode
    if (this.currentMode === EXECUTION_MODES.QUICK) {
      this.currentMode = EXECUTION_MODES.STANDARD;
      this.history.push(this.currentMode);
      return {
        shouldStop: false,
        nextMode: EXECUTION_MODES.STANDARD,
        reason: 'Quick verification failed. Escalating to Standard mode for broader context.'
      };
    }

    if (this.currentMode === EXECUTION_MODES.STANDARD) {
      this.currentMode = EXECUTION_MODES.DEEP;
      this.history.push(this.currentMode);
      return {
        shouldStop: false,
        nextMode: EXECUTION_MODES.DEEP,
        reason: 'Standard verification failed. Escalating to Deep mode for architectural reasoning.'
      };
    }

    // Already in Deep mode, continue or exhaust
    return {
      shouldStop: false,
      nextMode: EXECUTION_MODES.DEEP,
      reason: 'Deep mode verification failed. Iterating within Deep mode.'
    };
  }
}

/**
 * Strict Stop Condition (Part 10)
 * 
 * Grandpa MUST STOP when:
 * 1. requestedTaskComplete
 * 2. relevantTestsPass
 * 3. requiredBuildChecksPass
 * 4. requiredBehaviorPreserved
 * 5. noKnownRequiredWork
 * 
 * After this, NO unsolicited docs, NO unrelated refactors, NO extra exploration.
 */
export function shouldStopExecution({
  requestedTaskComplete = false,
  relevantTestsPass = false,
  requiredBuildChecksPass = true,
  requiredBehaviorPreserved = true,
  noKnownRequiredWork = true
} = {}) {
  return Boolean(
    requestedTaskComplete &&
    relevantTestsPass &&
    requiredBuildChecksPass &&
    requiredBehaviorPreserved &&
    noKnownRequiredWork
  );
}

/**
 * Formats a concise Grandpa final response (Part 4: Speak Less)
 * 
 * Example:
 * Fixed timeout/error handling.
 * Tests: 8/8 passing.
 */
export function formatConciseFinalResponse({
  actionSummary = 'Completed requested changes.',
  testsPassed = 0,
  testsTotal = 0,
  warnings = []
} = {}) {
  let response = `${actionSummary}\nTests: ${testsPassed}/${testsTotal} passing.`;
  if (warnings.length > 0) {
    response += `\nWarnings: ${warnings.join('; ')}`;
  }
  return response;
}
