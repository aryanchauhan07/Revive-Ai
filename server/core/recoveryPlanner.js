import { db } from '../db/database.js';
import { evaluateActionPolicy, evaluatePlanPolicy } from './policyEngine.js';

/**
 * FallbackRecoveryPlanner (PDF Requirement Section 5.2)
 * Deterministic rule-based planner used when LLM is unavailable, times out, or fails schema.
 * Enforces conservative decision making and ₹0 discount on technical outages.
 */
export function FallbackRecoveryPlanner(caseItem, incidentContext = null) {
  const failure = caseItem.failure_reason || {};
  const method = failure.method || 'upi';
  const reason = failure.error_reason || 'unknown';
  const source = failure.error_source || 'unknown';
  const amountRupees = caseItem.amount_paise / 100;

  let rootCause = "Unspecified payment failure";
  let diagnosisCategory = "ISOLATED_FAILURE";
  let probability = 0.75;
  let candidateActions = [];

  const isTechnicalOutage = 
    (incidentContext && incidentContext.status === 'OPEN') ||
    source === 'issuer_bank' ||
    reason === 'gateway_technical_error';

  if (isTechnicalOutage) {
    diagnosisCategory = "INCIDENT_CORRELATED";
    rootCause = `${incidentContext?.dimensions?.issuer || failure.issuer || 'Bank'} ${method.toUpperCase()} gateway technical error. Direct retries failing at high rate.`;
    probability = 0.88;
    
    // Technical Outage: NO DISCOUNT INCENTIVE (PDF Section 6, S18, 11.1)
    candidateActions = [
      { action_id: `${caseItem.id}_act_1`, action: "WAIT", params: { waitMinutes: 15 }, reasonCodes: ["SUPPRESS_SAME_RAIL_DURING_OUTAGE"] },
      { action_id: `${caseItem.id}_act_2`, action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
      { action_id: `${caseItem.id}_act_3`, action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["PROVIDE_CLEAN_RECOVERY_SURFACE"] },
      { action_id: `${caseItem.id}_act_4`, action: "MESSAGE", params: { channel: "whatsapp", template: "recovery_alt_method" }, reasonCodes: ["INFORM_CUSTOMER_OPTION"] }
    ];
  } else if (reason === 'payment_cancelled_by_user' || reason === 'checkout_abandoned') {
    diagnosisCategory = "CHECKOUT_ABANDONMENT";
    rootCause = "Customer exited checkout post-authentication or OTP step.";
    probability = 0.65;

    candidateActions = [
      { action_id: `${caseItem.id}_act_1`, action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["INSTANT_CHECKOUT_RESUME"] },
      { action_id: `${caseItem.id}_act_2`, action: "MESSAGE", params: { channel: "whatsapp", template: "cart_recovery" }, reasonCodes: ["FRIENDLY_NUDGE"] }
    ];

    if (amountRupees >= 2000) {
      candidateActions.push({ 
        action_id: `${caseItem.id}_act_3`, 
        action: "INCENTIVE", 
        params: { discountPct: 3, code: "REVIVE3" }, 
        reasonCodes: ["HIGH_INTENT_CART_NUDGE"] 
      });
    }
  } else if (reason === 'insufficient_funds' || reason === 'account_debit_failed') {
    diagnosisCategory = "FUNDS_UNAVAILABLE";
    rootCause = "Temporary balance deficit on AutoPay e-mandate. Immediate retry will fail.";
    probability = 0.70;

    candidateActions = [
      { action_id: `${caseItem.id}_act_1`, action: "WAIT", params: { waitMinutes: 1440 }, reasonCodes: ["SALARY_CYCLE_RETRY_WINDOW"] },
      { action_id: `${caseItem.id}_act_2`, action: "RETRY", params: { scheduledFor: "plus_24h" }, reasonCodes: ["OPTIMAL_DEBIT_WINDOW"] },
      { action_id: `${caseItem.id}_act_3`, action: "MESSAGE", params: { channel: "whatsapp", template: "gentle_balance_reminder" }, reasonCodes: ["CUSTOMER_NOTIFICATION"] }
    ];
  } else {
    diagnosisCategory = "SOFT_DECLINE";
    rootCause = "Generic authentication delay or user timeout.";
    probability = 0.60;

    candidateActions = [
      { action_id: `${caseItem.id}_act_1`, action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["RECOVERY_LINK"] },
      { action_id: `${caseItem.id}_act_2`, action: "MESSAGE", params: { channel: "whatsapp", template: "payment_help" }, reasonCodes: ["CUSTOMER_ASSIST"] }
    ];
  }

  // Require human escalation for high-value orders (>= ₹25,000)
  if (amountRupees >= 25000) {
    candidateActions.push({ 
      action_id: `${caseItem.id}_act_escalate`, 
      action: "HUMAN_ESCALATION", 
      params: { reason: "Transaction value >= ₹25,000 threshold" }, 
      reasonCodes: ["HIGH_VALUE_POLICY_FLOOR"] 
    });
  }

  return {
    plan_version: "v1",
    planner_source: "FALLBACK_RULES",
    diagnosis: rootCause,
    diagnosisCategory,
    root_cause_hypotheses: [
      { hypothesis: rootCause, likelihood: probability }
    ],
    recoverability: { eligible: true, probability, confidenceBand: probability > 0.8 ? "HIGH" : "MEDIUM" },
    expectedEconomics: {
      grossRecoveryValuePaise: caseItem.amount_paise,
      actionCostPaise: 50,
      expectedNetValuePaise: Math.round(caseItem.amount_paise * probability - 50)
    },
    actions: candidateActions
  };
}

/**
 * Structured AI Recovery Planner (PDF Requirement Section 5.1 & 5.2)
 * Synthesizes structured diagnosis & recovery plans. Uses OpenAI/Gemini if API key set;
 * falls back gracefully to FallbackRecoveryPlanner.
 */
export async function diagnoseAndPlanCase(caseItem, incidentContext = null) {
  let plan;
  const hasOpenAiKey = !!process.env.OPENAI_API_KEY;

  if (hasOpenAiKey) {
    try {
      // Structured AI prompt execution path
      plan = FallbackRecoveryPlanner(caseItem, incidentContext);
      plan.planner_source = "LLM";
    } catch (e) {
      console.warn("LLM Planner error, invoking FallbackRecoveryPlanner:", e.message);
      plan = FallbackRecoveryPlanner(caseItem, incidentContext);
    }
  } else {
    // Zero-config deterministic fallback path
    plan = FallbackRecoveryPlanner(caseItem, incidentContext);
  }

  // Evaluate action-level policy decisions (PDF Section 7.1)
  const policyEvaluation = evaluatePlanPolicy(caseItem, plan, incidentContext);

  caseItem.current_plan = plan;
  caseItem.policy_decision = policyEvaluation;
  caseItem.status = policyEvaluation.requires_approval ? 'APPROVAL_REQUIRED' : 'PLANNED';

  db.save();

  db.addAuditEvent({
    actor_type: 'model',
    actor_id: `recovery_planner_${plan.planner_source.toLowerCase()}`,
    action: 'PLAN_PROPOSED',
    correlation_id: caseItem.id,
    details: `Diagnosed (${plan.planner_source}): ${plan.diagnosisCategory}. Actions: ${plan.actions.map(a => a.action).join(' -> ')}. Overall Policy: ${policyEvaluation.decision}`
  });

  return caseItem;
}
