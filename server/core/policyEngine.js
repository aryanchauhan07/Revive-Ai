import { db } from '../db/database.js';

/**
 * Action-level Policy Engine (PDF Requirement Section 7.1 & 7.2)
 * Evaluates individual candidate actions in a plan and produces per-action policy decisions.
 * Enforces:
 * - Mode controls (OBSERVE | ASSIST | AUTOPILOT)
 * - Kill switch
 * - Technical outage ₹0 discount rule (never waste incentive budget on technical downtime)
 * - Order value threshold (>= ₹25,000 requires human review)
 * - Quiet hours DND (22:00 to 08:00 IST)
 * - Max attempts & budget caps
 */
export function evaluateActionPolicy(caseItem, actionCandidate, incidentContext = null) {
  const merchant = db.getMerchant();
  const policy = merchant.policy;
  const matchedRules = [];
  let decision = 'ALLOW'; // ALLOW | REVIEW | BLOCK | SCHEDULE
  let reason = 'Action passed all deterministic policy rules.';
  const actionType = actionCandidate.action;

  // 1. Kill Switch Check
  if (merchant.killSwitch) {
    return {
      action_id: actionCandidate.action_id || `${caseItem.id}_${actionType}`,
      decision: 'BLOCK',
      matched_rules: ['MERCHANT_KILL_SWITCH_ACTIVE'],
      reason: 'Merchant emergency kill switch is active. Autonomous execution blocked.'
    };
  }

  // 2. Mode Check (OBSERVE mode blocks all side effects)
  if (merchant.mode === 'OBSERVE') {
    return {
      action_id: actionCandidate.action_id || `${caseItem.id}_${actionType}`,
      decision: 'BLOCK',
      matched_rules: ['MODE_OBSERVE_READ_ONLY'],
      reason: 'Merchant mode is OBSERVE. Recommendation generated for review, side-effects blocked.'
    };
  }

  // 3. Technical Outage / Issuer Downtime Discount Rule (PDF Section 6, S18, 11.1)
  // "An incident-correlated technical failure produces no discount / ₹0 incentive."
  if (actionType === 'INCENTIVE') {
    const isTechnicalOutage = 
      (incidentContext && incidentContext.status === 'OPEN') ||
      caseItem.failure_reason?.error_source === 'issuer_bank' ||
      caseItem.failure_reason?.error_reason === 'gateway_technical_error';

    if (isTechnicalOutage) {
      return {
        action_id: actionCandidate.action_id || `${caseItem.id}_${actionType}`,
        decision: 'BLOCK',
        matched_rules: ['TECHNICAL_OUTAGE_NO_DISCOUNT'],
        reason: 'Technical outage identified. Incentive blocked to protect contribution margin (self-recovery probability high after rail switch).'
      };
    }

    // Check discount ceiling
    const discountPct = actionCandidate.params?.discountPct || 0;
    if (discountPct > policy.money.maxDiscountPct) {
      matchedRules.push(`DISCOUNT_EXCEEDS_MAX_CAP (${discountPct}% > ${policy.money.maxDiscountPct}%)`);
      decision = 'BLOCK';
      reason = `Proposed discount (${discountPct}%) exceeds merchant floor cap (${policy.money.maxDiscountPct}%).`;
    } else if (discountPct > policy.money.maxAutoDiscountPct) {
      matchedRules.push(`DISCOUNT_REQUIRES_REVIEW (${discountPct}% > ${policy.money.maxAutoDiscountPct}%)`);
      decision = 'REVIEW';
      reason = `Discount (${discountPct}%) exceeds auto cap (${policy.money.maxAutoDiscountPct}%); human approval required.`;
    }
  }

  // 4. High Value Transaction Check (>= ₹25,000 / 2,500,000 paise)
  if (caseItem.amount_paise >= policy.money.highValueApprovalPaise) {
    matchedRules.push(`HIGH_VALUE_FLOOR (${caseItem.amount_paise / 100} >= ₹${policy.money.highValueApprovalPaise / 100})`);
    if (actionType === 'INCENTIVE' || actionType === 'CREATE_LINK' || actionType === 'MESSAGE') {
      if (merchant.mode !== 'AUTOPILOT') {
        decision = 'REVIEW';
        reason = 'Order value >= ₹25,000 requires explicit human manager approval.';
      }
    }
  }

  // 5. Quiet Hours Check (22:00 to 08:00 IST)
  if (actionType === 'MESSAGE' || actionType === 'INCENTIVE') {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const currentHour = istDate.getUTCHours();
    
    if (currentHour >= 22 || currentHour < 8) {
      matchedRules.push('QUIET_HOURS_DND_ACTIVE');
      decision = 'SCHEDULE';
      reason = 'Current time is within DND Quiet Hours (22:00-08:00 IST). Contact scheduled for 08:00 IST.';
    }
  }

  // 6. Max Retry / Attempt Limits
  const pastAttempts = caseItem.current_plan?.recoveryHistory?.attempts || 0;
  if (pastAttempts >= policy.retry.maxAttempts) {
    return {
      action_id: actionCandidate.action_id || `${caseItem.id}_${actionType}`,
      decision: 'BLOCK',
      matched_rules: ['MAX_ATTEMPTS_EXHAUSTED'],
      reason: `Maximum contact/retry limit (${policy.retry.maxAttempts}) exhausted for this case.`
    };
  }

  if (matchedRules.length === 0) {
    matchedRules.push('ALL_DETERMINISTIC_RULES_PASSED');
  }

  return {
    action_id: actionCandidate.action_id || `${caseItem.id}_${actionType}`,
    decision,
    matched_rules: matchedRules,
    requires_approval: decision === 'REVIEW',
    reason
  };
}

/**
 * Evaluates all actions in a plan and produces per-action policy decisions.
 */
export function evaluatePlanPolicy(caseItem, plan, incidentContext = null) {
  const perActionDecisions = (plan.actions || []).map(act => 
    evaluateActionPolicy(caseItem, act, incidentContext)
  );

  const hasReviewAction = perActionDecisions.some(d => d.decision === 'REVIEW');
  const hasBlockedPrimary = perActionDecisions[0]?.decision === 'BLOCK';

  const overallDecision = hasReviewAction ? 'REVIEW' : (hasBlockedPrimary ? 'BLOCK' : 'ALLOW');

  return {
    decision: overallDecision,
    requires_approval: hasReviewAction,
    per_action_decisions: perActionDecisions,
    evaluated_at: new Date().toISOString()
  };
}
