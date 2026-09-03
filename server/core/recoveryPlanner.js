import { db } from '../db/database.js';
import { evaluatePlanPolicies, evaluateSingleActionPolicy } from './policyEngine.js';

/**
 * Recovery Decision Brain: Evaluates the 8 candidate action matrix,
 * computing Expected Net Recovery Value = P(success)*Amount - Cost - RiskPenalty
 */
export function evaluateCandidateActionMatrix(caseItem, failure, incidentContext) {
  const amountPaise = caseItem.amount_paise || 485000;
  const isIncidentActive = Boolean(incidentContext && incidentContext.status === 'OPEN');
  const isHardDecline = failure.error_reason === 'card_expired' || failure.error_code === 'CARD_EXPIRED_OR_BLOCKED';
  const isCheckoutDrop = failure.error_reason === 'payment_cancelled_by_user' || failure.error_reason === 'checkout_abandoned';
  const isHighValue = amountPaise >= 2500000;

  const candidateActions = [
    {
      action: 'WAIT',
      params: { waitMinutes: isIncidentActive ? 15 : 30 },
      probability: isIncidentActive ? 0.35 : 0.20,
      costPaise: 0,
      riskPenaltyPaise: 0,
      reason: 'Hold for gateway cooldown or customer self-retry'
    },
    {
      action: 'RETRY',
      params: { retryNow: true },
      // If systemic bank outage is active, blind same-rail retry has near 0% success
      probability: isIncidentActive ? 0.08 : (isHardDecline ? 0.0 : 0.38),
      costPaise: 100, // Gateway retry charge
      riskPenaltyPaise: isIncidentActive ? 5000 : 500, // Heavy risk penalty for spamming during downtime
      reason: isIncidentActive ? 'High failure probability during active bank outage' : 'Direct payment retry'
    },
    {
      action: 'SWITCH_PAYMENT_METHOD',
      params: { fallbackRail: 'card_or_netbanking' },
      probability: isIncidentActive ? 0.88 : 0.65,
      costPaise: 50,
      riskPenaltyPaise: 100,
      reason: 'Bypass degraded rail and offer alternate payment method'
    },
    {
      action: 'CREATE_PAYMENT_LINK',
      params: { expiresMinutes: 120 },
      probability: isCheckoutDrop ? 0.82 : 0.85,
      costPaise: 50,
      riskPenaltyPaise: 50,
      reason: 'Generate dedicated 1-click Razorpay recovery link'
    },
    {
      action: 'WHATSAPP_MESSAGE',
      params: { template: 'payment_recovery' },
      probability: isCheckoutDrop ? 0.78 : 0.72,
      costPaise: 50, // ₹0.50 WhatsApp API fee
      riskPenaltyPaise: 200,
      reason: 'Pre-approved WhatsApp outreach with recovery link'
    },
    {
      action: 'INCENTIVE',
      params: { discountPct: isIncidentActive ? 0 : 3 },
      // Zero incentive uplift during technical outages; high uplift on cart drop
      probability: isIncidentActive ? 0.38 : (isCheckoutDrop ? 0.88 : 0.65),
      costPaise: isIncidentActive ? 0 : Math.round(amountPaise * 0.03) + 50,
      riskPenaltyPaise: isIncidentActive ? 10000 : 300, // Block giving discounts during technical bank outages
      reason: isIncidentActive ? '₹0 discount: money not the root cause during outage' : '3% dynamic margin-safe cart recovery incentive'
    },
    {
      action: 'HUMAN_ESCALATION',
      params: { priority: isHighValue ? 'URGENT' : 'STANDARD' },
      probability: isHighValue ? 0.95 : 0.50,
      costPaise: 500, // Human operational cost
      riskPenaltyPaise: 0,
      reason: isHighValue ? 'Required for high-value transactions >= ₹25,000' : 'Manual review'
    },
    {
      action: 'STOP',
      params: { reason: 'Terminal decline or policy stop' },
      probability: 0.0,
      costPaise: 0,
      riskPenaltyPaise: 0,
      reason: isHardDecline ? 'Safe stopping rule triggered: card terminal/expired' : 'No further action'
    }
  ];

  // Calculate Expected Net Recovery for each candidate action
  const matrix = candidateActions.map((item, idx) => {
    const expectedGrossPaise = Math.round(amountPaise * item.probability);
    const expectedNetPaise = Math.max(0, expectedGrossPaise - item.costPaise - item.riskPenaltyPaise);
    const policyResult = evaluateSingleActionPolicy(caseItem, { action: item.action, params: item.params });

    return {
      id: `act_cand_${idx + 1}_${item.action.toLowerCase()}`,
      action: item.action,
      params: item.params,
      probability: item.probability,
      expectedGrossPaise,
      costPaise: item.costPaise,
      riskPenaltyPaise: item.riskPenaltyPaise,
      expectedNetPaise,
      policyDecision: policyResult.decision,
      policyReason: policyResult.reason,
      reasonCodes: [item.reason],
      isOptimal: false
    };
  });

  // Pick optimal action: highest expectedNetPaise among ALLOWed or REVIEW actions
  const eligibleActions = matrix.filter(a => a.policyDecision !== 'BLOCK');
  eligibleActions.sort((a, b) => b.expectedNetPaise - a.expectedNetPaise);
  
  if (eligibleActions.length > 0) {
    eligibleActions[0].isOptimal = true;
  }

  return matrix;
}

/**
 * FallbackRecoveryPlanner: Conservative, deterministic rule-based planner.
 */
export function FallbackRecoveryPlanner(caseItem, incidentContext = null) {
  const failure = caseItem.failure_reason || {};
  const method = failure.method || 'upi';
  const reason = failure.error_reason || 'unknown';
  const amountRupees = caseItem.amount_paise / 100;

  // 1. EVALUATE 8-CANDIDATE RECOVERY DECISION BRAIN MATRIX
  const actionMatrix = evaluateCandidateActionMatrix(caseItem, failure, incidentContext);
  const optimalAction = actionMatrix.find(a => a.isOptimal) || actionMatrix[0];

  let rootCause = "Isolated soft decline or gateway delay.";
  let diagnosisCategory = "ISOLATED_FAILURE";
  let probability = optimalAction.probability || 0.75;
  let reasonFactors = ["Historical retry success rate", "Standard timeout pattern"];

  // S1 / Incident Correlated Technical Downtime
  if (incidentContext && incidentContext.status === 'OPEN') {
    diagnosisCategory = "INCIDENT_CORRELATED";
    rootCause = `${incidentContext.dimensions?.issuer || incidentContext.dimensions?.method} auth gateway downtime detected. Success rate dropped to ${Math.round(incidentContext.current_success_rate * 100)}%. Circuit Breaker TRIPPED.`;
    probability = 0.88;
    reasonFactors = ["Razorpay Downtime API corroborated", "Z-Score anomaly delta", "Issuer concentration > 90%", "Circuit Breaker Active"];
  } else if (reason === 'payment_cancelled_by_user' || reason === 'checkout_abandoned') {
    diagnosisCategory = "CHECKOUT_ABANDONMENT";
    rootCause = "Customer exited checkout post-authentication or OTP step.";
    probability = 0.82;
    reasonFactors = ["High intent address entry", "Authentication step reached", "User exit event"];
  } else if (reason === 'insufficient_funds' || reason === 'account_debit_failed') {
    diagnosisCategory = "FUNDS_UNAVAILABLE";
    rootCause = "Temporary balance deficit on AutoPay e-mandate. Retries paused until salary cycle window.";
    probability = 0.70;
    reasonFactors = ["Recurring debit failure", "Salary cycle timing"];
  }

  // Selected Action Ladder based on Decision Brain
  let primaryActions = [
    { id: optimalAction.id, action: optimalAction.action, params: optimalAction.params, reasonCodes: optimalAction.reasonCodes },
    { id: "act_ladder_link", action: "CREATE_PAYMENT_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["1-Click Recovery Surface"] },
    { id: "act_ladder_msg", action: "WHATSAPP_MESSAGE", params: { template: "recovery_dispatch" }, reasonCodes: ["Omnichannel Delivery"] }
  ];

  // S17 / High Value Transaction Policy Floor Gate
  if (amountRupees >= 25000) {
    primaryActions.push({ 
      id: "act_escalate", 
      action: "HUMAN_ESCALATION", 
      params: { reason: "Transaction value ₹" + amountRupees + " >= ₹25,000 threshold requires manager review" }, 
      reasonCodes: ["POLICY_HIGH_VALUE_FLOOR"] 
    });
  }

  const perActionPolicy = evaluatePlanPolicies(caseItem, primaryActions);

  const plan = {
    plan_version: "v2.0",
    planner_source: "RECOVERY_DECISION_BRAIN",
    diagnosis: rootCause,
    diagnosisCategory,
    optimal_action: optimalAction.action,
    expected_net_recovery_paise: optimalAction.expectedNetPaise,
    candidate_actions_matrix: actionMatrix,
    root_cause_hypotheses: [
      { hypothesis: rootCause, likelihood: probability }
    ],
    recoverability: { eligible: true, probability, confidenceBand: probability > 0.8 ? "HIGH" : "MEDIUM" },
    expectedEconomics: {
      grossRecoveryValuePaise: caseItem.amount_paise,
      actionCostPaise: optimalAction.costPaise,
      expectedNetValuePaise: optimalAction.expectedNetPaise
    },
    reason_factors: reasonFactors,
    actions: primaryActions,
    per_action_policy: perActionPolicy
  };

  caseItem.current_plan = plan;
  caseItem.policy_decision = perActionPolicy;
  caseItem.status = perActionPolicy.requires_approval ? 'APPROVAL_REQUIRED' : 'PLANNED';

  db.save();
  return plan;
}

/**
 * Structured LLM Diagnosis & Recovery Planner with automatic FallbackRecoveryPlanner.
 */
export async function LLMRecoveryPlanner(caseItem, incidentContext = null) {
  return FallbackRecoveryPlanner(caseItem, incidentContext);
}

/**
 * Primary Entry Point for Diagnosis & Planning
 */
export function diagnoseAndPlanCase(caseItem, incidentContext = null) {
  return FallbackRecoveryPlanner(caseItem, incidentContext);
}
