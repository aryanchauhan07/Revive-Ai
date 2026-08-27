import { db } from '../db/database.js';

export function evaluatePolicy(caseItem, actionProposed) {
  const merchant = db.getMerchant();
  const policy = merchant.policy;
  const matchedRules = [];
  let decision = 'ALLOW'; // ALLOW | REVIEW | BLOCK
  let reason = 'All policy checks passed.';

  // 1. Kill Switch Check
  if (merchant.killSwitch) {
    return {
      decision: 'BLOCK',
      matched_rules: ['MERCHANT_KILL_SWITCH_ACTIVE'],
      reason: 'Merchant emergency kill switch is active. All autonomous actions suspended.'
    };
  }

  // 2. Mode Check
  if (merchant.mode === 'OBSERVE') {
    return {
      decision: 'BLOCK',
      matched_rules: ['MODE_OBSERVE_READ_ONLY'],
      reason: 'Merchant mode is OBSERVE. Recommendation generated, but side-effects blocked.'
    };
  }

  // 3. High Value Amount Check (Order value threshold)
  if (caseItem.amount_paise >= policy.money.highValueApprovalPaise) {
    matchedRules.push(`HIGH_VALUE_THRESHOLD (${caseItem.amount_paise / 100} >= ₹${policy.money.highValueApprovalPaise / 100})`);
    if (merchant.mode !== 'AUTOPILOT' || actionProposed.action === 'INCENTIVE') {
      decision = 'REVIEW';
      reason = 'High-value transaction requires explicit human manager approval.';
    }
  }

  // 4. Quiet Hours Check (for customer messaging)
  if (actionProposed.action === 'MESSAGE' || actionProposed.action === 'INCENTIVE') {
    const now = new Date();
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const currentHour = istDate.getUTCHours();
    
    // Default quiet hours 22:00 to 08:00
    if (currentHour >= 22 || currentHour < 8) {
      matchedRules.push('QUIET_HOURS_DND_ACTIVE');
      decision = 'REVIEW';
      reason = 'Current time is within DND Quiet Hours (22:00-08:00 IST). Contact rescheduled.';
    }
  }

  // 5. Discount / Incentive Cap Check
  if (actionProposed.action === 'INCENTIVE') {
    const discountPct = actionProposed.params?.discountPct || 0;
    if (discountPct > policy.money.maxDiscountPct) {
      matchedRules.push(`DISCOUNT_EXCEEDS_MAX_CAP (${discountPct}% > ${policy.money.maxDiscountPct}%)`);
      decision = 'BLOCK';
      reason = `Proposed incentive (${discountPct}%) exceeds merchant floor cap (${policy.money.maxDiscountPct}%).`;
    } else if (discountPct > policy.money.maxAutoDiscountPct) {
      matchedRules.push(`DISCOUNT_REQUIRES_REVIEW (${discountPct}% > ${policy.money.maxAutoDiscountPct}%)`);
      if (decision !== 'BLOCK') decision = 'REVIEW';
      reason = `Incentive (${discountPct}%) requires human approval.`;
    }
  }

  // 6. Max Attempts Check
  const pastAttempts = caseItem.current_plan?.recoveryHistory?.attempts || 0;
  if (pastAttempts >= policy.retry.maxAttempts) {
    return {
      decision: 'BLOCK',
      matched_rules: ['MAX_ATTEMPTS_EXHAUSTED'],
      reason: `Maximum retry/contact attempts (${policy.retry.maxAttempts}) reached for this case.`
    };
  }

  if (matchedRules.length === 0) {
    matchedRules.push('ALL_STANDARD_GUARDRAILS_PASSED');
  }

  const result = {
    decision,
    matched_rules: matchedRules,
    requires_approval: decision === 'REVIEW',
    reason
  };

  db.addAuditEvent({
    actor_type: 'system',
    actor_id: 'policy_engine_v1',
    action: 'POLICY_EVALUATED',
    correlation_id: caseItem.id,
    details: `Evaluated action ${actionProposed.action}: Decision=${decision}. Matched: ${matchedRules.join(', ')}`
  });

  return result;
}
