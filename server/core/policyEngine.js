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

  // 4. High Value Amount Check (Order value threshold e.g. >= ₹10,000 or >= ₹25,000)
  const highValuePaise = policy.money?.highValueApprovalPaise || 2500000;
  if (caseItem.amount_paise >= highValuePaise) {
    matchedRules.push(`HIGH_VALUE_THRESHOLD (${caseItem.amount_paise / 100} >= ₹${highValuePaise / 100})`);
    if (merchant.mode !== 'AUTOPILOT' || actionProposed.action === 'INCENTIVE') {
      decision = 'REVIEW';
      reason = `High-value order (₹${(caseItem.amount_paise / 100).toLocaleString()} >= ₹${(highValuePaise / 100).toLocaleString()}) requires explicit human manager approval.`;
    }
  }

  // 5. Quiet Hours DND Check (for customer messaging)
  if (actionProposed.action === 'MESSAGE' || actionProposed.action === 'WHATSAPP_MESSAGE' || actionProposed.action === 'INCENTIVE') {
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
    const maxDiscount = policy.money?.maxDiscountPct ?? 5;
    const maxAutoDiscount = policy.money?.maxAutoDiscountPct ?? 2;

    if (discountPct > maxDiscount) {
      return {
        decision: 'BLOCK',
        matched_rules: [`DISCOUNT_EXCEEDS_CEILING (${discountPct}% > ${maxDiscount}%)`],
        reason: `Proposed discount (${discountPct}%) violates hard policy ceiling (${maxDiscount}%).`
      };
    } else if (discountPct > maxAutoDiscount) {
      matchedRules.push(`DISCOUNT_REQUIRES_REVIEW (${discountPct}% > ${maxAutoDiscount}%)`);
      if (decision !== 'BLOCK') decision = 'REVIEW';
      reason = `Incentive (${discountPct}%) requires human manager approval.`;
    }
  }

  // 7. Max Attempts Check
  const pastAttempts = caseItem.current_plan?.recoveryHistory?.attempts || 0;
  if (pastAttempts >= (policy.retry?.maxAttempts || 3)) {
    return {
      decision: 'BLOCK',
      matched_rules: ['MAX_ATTEMPTS_EXHAUSTED'],
      reason: `Maximum contact/retry attempts (${policy.retry?.maxAttempts || 3}) reached for this case.`
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
 * Re-evaluates all active recovery cases against a fresh policy update.
 * Dynamically updates exact contextual reasons for high-value floors vs discount reviews.
 */
export function reEvaluateAllCasesPolicy(merchant = null) {
  if (!merchant) merchant = db.getMerchant();
  const cases = db.getCases();
  const highValuePaise = merchant.policy?.money?.highValueApprovalPaise || 2500000;
  const maxAutoDiscountPct = merchant.policy?.money?.maxAutoDiscountPct ?? 2;
  
  cases.forEach(caseItem => {
    // Only re-evaluate active non-terminal cases
    if (caseItem.status === 'RECOVERED' || caseItem.status === 'CANCELLED') return;

    const planActions = caseItem.current_plan?.actions || [{ action: 'CREATE_PAYMENT_LINK' }];
    const policyResult = evaluatePlanPolicies(caseItem, planActions);

    const isHighValue = (caseItem.amount_paise || 0) >= highValuePaise && merchant.mode !== 'AUTOPILOT';
    const discountAction = caseItem.current_plan?.actions?.find(a => a.action === 'INCENTIVE');
    const discountPct = discountAction?.params?.discountPct || 0;
    const isDiscountReview = merchant.mode !== 'AUTOPILOT' 
      ? (discountPct > maxAutoDiscountPct) 
      : (discountPct > (policy.money?.maxDiscountPct || 5));
    const isKillSwitchActive = Boolean(merchant.killSwitch);

    const requiresReview = isKillSwitchActive || isHighValue || isDiscountReview;

    let reason = 'All policy guardrails passed.';
    if (isKillSwitchActive) {
      reason = 'Emergency Kill Switch is ACTIVE. All autonomous outreach is paused; explicit human manager approval required for all cases.';
    } else if (isHighValue) {
      reason = `High-value order (₹${(caseItem.amount_paise / 100).toLocaleString()} >= ₹${(highValuePaise / 100).toLocaleString()}) requires human manager approval.`;
    } else if (isDiscountReview) {
      reason = `Proposed incentive (${discountPct}% dynamic discount) exceeds auto-discount ceiling (${maxAutoDiscountPct}%). Requires manager review.`;
    }

    caseItem.policy_decision = {
      decision: requiresReview ? 'REVIEW' : (isKillSwitchActive ? 'BLOCK' : policyResult.decision),
      requires_approval: requiresReview,
      matched_rules: isKillSwitchActive
        ? ['MERCHANT_KILL_SWITCH_ACTIVE_FORCES_100_PCT_REVIEW']
        : isHighValue 
          ? [`HIGH_VALUE_THRESHOLD (${caseItem.amount_paise / 100} >= ₹${highValuePaise / 100})`]
          : isDiscountReview
            ? [`DISCOUNT_REQUIRES_REVIEW (${discountPct}% > ${maxAutoDiscountPct}%)`]
            : ['ALL_STANDARD_GUARDRAILS_PASSED'],
      reason
    };

    if (caseItem.status !== 'RECOVERED' && caseItem.status !== 'CANCELLED') {
      if (requiresReview) {
        caseItem.status = 'APPROVAL_REQUIRED';
      } else if (caseItem.status === 'APPROVAL_REQUIRED' && !requiresReview) {
        caseItem.status = 'PLANNED';
      }
    }
  });

  db.save();
}

/**
 * Re-evaluates policy immediately before execution (Execution-Time Recheck).
 * Ensures budgets, kill switch, or payment status changes are caught right at execution time.
 */
export function reevaluatePolicyAtExecution(caseItem, actionToExecute) {
  const result = evaluateSingleActionPolicy(caseItem, actionToExecute);
  return result;
}
