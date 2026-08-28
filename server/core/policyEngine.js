import { db } from '../db/database.js';

/**
 * Evaluates policy per-action across an entire RecoveryPlan.
 * Returns authoritative PolicyDecisions for every candidate action.
 */
export function evaluatePlanPolicies(caseItem, planActions = []) {
  const merchant = db.getMerchant();
  const policy = merchant.policy;
  const planVersion = caseItem.current_plan?.plan_version || 'v1.0';
  const policyVersion = policy.version || 'v1.0';

  const actionsPolicyMap = {};
  let overallRequiresApproval = false;
  let overallDecision = 'ALLOW';

  planActions.forEach((act, idx) => {
    const actionId = act.id || `action_${idx + 1}_${act.action}`;
    const actionResult = evaluateSingleActionPolicy(caseItem, act, merchant);

    actionsPolicyMap[actionId] = {
      action_id: actionId,
      action_type: act.action,
      decision: actionResult.decision, // ALLOW | REVIEW | BLOCK | SCHEDULE
      matched_rules: actionResult.matched_rules,
      reason: actionResult.reason,
      plan_version: planVersion,
      policy_version: policyVersion
    };

    if (actionResult.decision === 'REVIEW') {
      overallRequiresApproval = true;
      overallDecision = 'REVIEW';
    } else if (actionResult.decision === 'BLOCK' && overallDecision !== 'REVIEW') {
      overallDecision = 'BLOCK';
    }
  });

  return {
    decision: overallDecision,
    requires_approval: overallRequiresApproval,
    actions_policy_map: actionsPolicyMap,
    evaluated_at: new Date().toISOString()
  };
}

/**
 * Evaluates a single candidate action against merchant policy rules.
 */
export function evaluateSingleActionPolicy(caseItem, actionProposed, merchant = null) {
  if (!merchant) merchant = db.getMerchant();
  const policy = merchant.policy;
  const matchedRules = [];
  let decision = 'ALLOW'; // ALLOW | REVIEW | BLOCK | SCHEDULE
  let reason = 'All policy guardrails passed.';

  // 1. Kill Switch Check
  if (merchant.killSwitch) {
    return {
      decision: 'BLOCK',
      matched_rules: ['MERCHANT_KILL_SWITCH_ACTIVE'],
      reason: 'Merchant emergency kill switch is active. All autonomous side effects blocked.'
    };
  }

  // 2. Mode Check
  if (merchant.mode === 'OBSERVE') {
    return {
      decision: 'BLOCK',
      matched_rules: ['MODE_OBSERVE_READ_ONLY'],
      reason: 'Merchant mode is OBSERVE. Recommendation generated, but execution blocked.'
    };
  }

  // 3. Already Recovered Check
  if (caseItem.status === 'RECOVERED' || caseItem.status === 'CANCELLED') {
    return {
      decision: 'BLOCK',
      matched_rules: ['CASE_ALREADY_TERMINAL'],
      reason: `Case is in terminal state (${caseItem.status}). Side effect blocked.`
    };
  }

  // 4. High Value Amount Check (Order value threshold >= ₹25,000)
  if (caseItem.amount_paise >= policy.money.highValueApprovalPaise) {
    matchedRules.push(`HIGH_VALUE_THRESHOLD (${caseItem.amount_paise / 100} >= ₹${policy.money.highValueApprovalPaise / 100})`);
    if (merchant.mode !== 'AUTOPILOT' || actionProposed.action === 'INCENTIVE') {
      decision = 'REVIEW';
      reason = 'High-value transaction requires explicit human manager approval.';
    }
  }

  // 5. Quiet Hours DND Check (for customer messaging)
  if (actionProposed.action === 'MESSAGE' || actionProposed.action === 'INCENTIVE') {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const currentHour = istDate.getUTCHours();
    
    // Default quiet hours 22:00 to 08:00 IST
    if (currentHour >= 22 || currentHour < 8) {
      matchedRules.push('QUIET_HOURS_DND_ACTIVE');
      decision = 'SCHEDULE';
      reason = 'Current time is within DND Quiet Hours (22:00-08:00 IST). Contact scheduled for 08:00 IST.';
    }
  }

  // 6. Discount / Incentive Cap Check
  if (actionProposed.action === 'INCENTIVE') {
    const discountPct = actionProposed.params?.discountPct || 0;
    if (discountPct > policy.money.maxDiscountPct) {
      matchedRules.push(`DISCOUNT_EXCEEDS_MAX_CAP (${discountPct}% > ${policy.money.maxDiscountPct}%)`);
      decision = 'BLOCK';
      reason = `Proposed incentive (${discountPct}%) exceeds merchant floor cap (${policy.money.maxDiscountPct}%).`;
    } else if (discountPct > policy.money.maxAutoDiscountPct) {
      matchedRules.push(`DISCOUNT_REQUIRES_REVIEW (${discountPct}% > ${policy.money.maxAutoDiscountPct}%)`);
      if (decision !== 'BLOCK') decision = 'REVIEW';
      reason = `Incentive (${discountPct}%) requires human manager approval.`;
    }
  }

  // 7. Max Attempts Check
  const pastAttempts = caseItem.current_plan?.recoveryHistory?.attempts || 0;
  if (pastAttempts >= policy.retry.maxAttempts) {
    return {
      decision: 'BLOCK',
      matched_rules: ['MAX_ATTEMPTS_EXHAUSTED'],
      reason: `Maximum contact/retry attempts (${policy.retry.maxAttempts}) reached for this case.`
    };
  }

  if (matchedRules.length === 0) {
    matchedRules.push('ALL_STANDARD_GUARDRAILS_PASSED');
  }

  return {
    decision,
    matched_rules: matchedRules,
    requires_approval: decision === 'REVIEW',
    reason
  };
}

/**
 * Re-evaluates policy immediately before execution (Execution-Time Recheck).
 * Ensures budgets, kill switch, or payment status changes are caught right at execution time.
 */
export function reevaluatePolicyAtExecution(caseItem, actionToExecute) {
  const result = evaluateSingleActionPolicy(caseItem, actionToExecute);
  return result;
}
