import { db } from '../db/database.js';
import { evaluatePolicy } from './policyEngine.js';

export function diagnoseAndPlanCase(caseItem, incidentContext = null) {
  const failure = caseItem.failure_reason || {};
  const method = failure.method || 'upi';
  const reason = failure.error_reason || 'unknown';
  const source = failure.error_source || 'unknown';
  const amountRupees = caseItem.amount_paise / 100;

  let rootCause = "Unspecified payment degradation";
  let diagnosisCategory = "ISOLATED_FAILURE";
  let probability = 0.75;
  let actions = [];

  // Categorize based on Razorpay error model
  if (incidentContext && incidentContext.status === 'OPEN') {
    diagnosisCategory = "INCIDENT_CORRELATED";
    rootCause = `${incidentContext.dimensions.issuer || incidentContext.dimensions.method} system degradation detected. Success rate dropped to ${Math.round(incidentContext.current_success_rate * 100)}%.`;
    probability = 0.88;
    
    actions = [
      { action: "WAIT", params: { waitMinutes: 15 }, reasonCodes: ["SUPPRESS_SAME_RAIL_DURING_OUTAGE"] },
      { action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
      { action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["PROVIDE_CLEAN_RECOVERY_SURFACE"] },
      { action: "MESSAGE", params: { channel: "whatsapp", template: "recovery_alt_method" }, reasonCodes: ["INFORM_CUSTOMER_OPTION"] }
    ];
  } else if (reason === 'payment_cancelled_by_user' || reason === 'checkout_abandoned') {
    diagnosisCategory = "CHECKOUT_ABANDONMENT";
    rootCause = "Customer exited checkout post-authentication or OTP step.";
    probability = 0.65;

    actions = [
      { action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["INSTANT_CHECKOUT_RESUME"] },
      { action: "MESSAGE", params: { channel: "whatsapp", template: "cart_recovery" }, reasonCodes: ["FRIENDLY_NUDGE"] }
    ];

    if (amountRupees >= 2000) {
      actions.push({ action: "INCENTIVE", params: { discountPct: 3, code: "REVIVE3" }, reasonCodes: ["HIGH_INTENT_NUDGE"] });
    }
  } else if (reason === 'insufficient_funds' || reason === 'account_debit_failed') {
    diagnosisCategory = "FUNDS_UNAVAILABLE";
    rootCause = "Temporary balance deficit. Hard retry immediately will fail.";
    probability = 0.70;

    actions = [
      { action: "WAIT", params: { waitMinutes: 1440 }, reasonCodes: ["SALARY_CYCLE_RETRY_WINDOW"] },
      { action: "RETRY", params: { scheduledFor: "plus_24h" }, reasonCodes: ["OPTIMAL_DEBIT_WINDOW"] },
      { action: "MESSAGE", params: { channel: "whatsapp", template: "gentle_balance_reminder" }, reasonCodes: ["CUSTOMER_NOTIFICATION"] }
    ];
  } else if (source === 'issuer_bank' || reason === 'gateway_technical_error') {
    diagnosisCategory = "BANK_DOWNTIME";
    rootCause = "Temporary issuing bank timeout or network glitch.";
    probability = 0.82;

    actions = [
      { action: "WAIT", params: { waitMinutes: 30 }, reasonCodes: ["BANK_RECOVERY_COOLDOWN"] },
      { action: "SWITCH_METHOD", params: { suggestedMethod: "upi_or_card" }, reasonCodes: ["ALTERNATIVE_PAYMENT_OPTION"] },
      { action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["SEAMLESS_PAYMENT_LINK"] }
    ];
  } else {
    diagnosisCategory = "SOFT_DECLINE";
    rootCause = "Generic authentication delay or user timeout.";
    probability = 0.60;

    actions = [
      { action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["RECOVERY_LINK"] },
      { action: "MESSAGE", params: { channel: "whatsapp", template: "payment_help" }, reasonCodes: ["CUSTOMER_ASSIST"] }
    ];
  }

  // Check if high value escalation required
  if (amountRupees >= 25000) {
    actions.push({ action: "HUMAN_ESCALATION", params: { reason: "Transaction value exceeds ₹25,000" }, reasonCodes: ["HIGH_VALUE_REVIEW"] });
  }

  const primaryAction = actions[0] || { action: "CREATE_LINK" };
  const policyResult = evaluatePolicy(caseItem, primaryAction);

  const plan = {
    diagnosis: rootCause,
    diagnosisCategory,
    recoverability: { eligible: true, probability, confidenceBand: probability > 0.8 ? "HIGH" : "MEDIUM" },
    expectedEconomics: {
      grossRecoveryValuePaise: caseItem.amount_paise,
      actionCostPaise: 50,
      expectedNetValuePaise: Math.round(caseItem.amount_paise * probability - 50)
    },
    actions
  };

  caseItem.current_plan = plan;
  caseItem.policy_decision = policyResult;
  caseItem.status = policyResult.requires_approval ? 'APPROVAL_REQUIRED' : 'PLANNED';

  db.save();

  db.addAuditEvent({
    actor_type: 'model',
    actor_id: 'recovery_planner_v1',
    action: 'PLAN_PROPOSED',
    correlation_id: caseItem.id,
    details: `Diagnosed: ${diagnosisCategory}. Primary action: ${primaryAction.action}. Policy decision: ${policyResult.decision}`
  });

  return caseItem;
}
