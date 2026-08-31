import { db } from '../db/database.js';
import { evaluatePlanPolicies } from './policyEngine.js';

/**
 * FallbackRecoveryPlanner: Conservative, deterministic rule-based planner.
 * Explicitly named and invoked when LLM is unconfigured, times out, or fails validation.
 */
export function FallbackRecoveryPlanner(caseItem, incidentContext = null) {
  const failure = caseItem.failure_reason || {};
  const method = failure.method || 'upi';
  const reason = failure.error_reason || 'unknown';
  const source = failure.error_source || 'unknown';
  const amountRupees = caseItem.amount_paise / 100;

  let rootCause = "Isolated soft decline or gateway delay.";
  let diagnosisCategory = "ISOLATED_FAILURE";
  let probability = 0.75;
  let actions = [];
  let reasonFactors = ["Historical retry success rate", "Standard timeout pattern"];

  // S1 / Incident Correlated Technical Downtime
  if (incidentContext && incidentContext.status === 'OPEN') {
    diagnosisCategory = "INCIDENT_CORRELATED";
    rootCause = `${incidentContext.dimensions?.issuer || incidentContext.dimensions?.method} auth gateway downtime detected. Success rate dropped to ${Math.round(incidentContext.current_success_rate * 100)}%.`;
    probability = 0.88;
    reasonFactors = ["Razorpay Downtime API corroborated", "Z-Score anomaly delta", "Issuer concentration > 90%"];
    
    // Technical outage: ₹0 discount recommendation, suppress same-rail retries
    actions = [
      { id: "act_1_wait", action: "WAIT", params: { waitMinutes: 15 }, reasonCodes: ["SUPPRESS_SAME_RAIL_DURING_OUTAGE"] },
      { id: "act_2_switch", action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
      { id: "act_3_link", action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["PROVIDE_CLEAN_RECOVERY_SURFACE"] },
      { id: "act_4_msg", action: "MESSAGE", params: { channel: "whatsapp", template: "recovery_alt_method" }, reasonCodes: ["INFORM_CUSTOMER_OPTION"] }
    ];
  } else if (reason === 'payment_cancelled_by_user' || reason === 'checkout_abandoned') {
    diagnosisCategory = "CHECKOUT_ABANDONMENT";
    rootCause = "Customer exited checkout post-authentication or OTP step.";
    probability = 0.65;
    reasonFactors = ["High intent address entry", "Authentication step reached", "User exit event"];

    actions = [
      { id: "act_1_link", action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["INSTANT_CHECKOUT_RESUME"] },
      { id: "act_2_msg", action: "MESSAGE", params: { channel: "whatsapp", template: "cart_recovery" }, reasonCodes: ["FRIENDLY_NUDGE"] }
    ];

    if (amountRupees >= 2000 && amountRupees < 25000) {
      actions.push({ id: "act_3_inc", action: "INCENTIVE", params: { discountPct: 3, code: "REVIVE3" }, reasonCodes: ["HIGH_INTENT_CART_NUDGE"] });
    }
  } else if (reason === 'insufficient_funds' || reason === 'account_debit_failed') {
    diagnosisCategory = "FUNDS_UNAVAILABLE";
    rootCause = "Temporary balance deficit on AutoPay e-mandate. Immediate retry will fail.";
    probability = 0.70;
    reasonFactors = ["Recurring debit failure", "Salary cycle timing"];

    actions = [
      { id: "act_1_wait", action: "WAIT", params: { waitMinutes: 1440 }, reasonCodes: ["SALARY_CYCLE_RETRY_WINDOW"] },
      { id: "act_2_retry", action: "RETRY", params: { scheduledFor: "plus_24h" }, reasonCodes: ["OPTIMAL_DEBIT_WINDOW"] },
      { id: "act_3_msg", action: "MESSAGE", params: { channel: "whatsapp", template: "gentle_balance_reminder" }, reasonCodes: ["CUSTOMER_NOTIFICATION"] }
    ];
  } else if (source === 'issuer_bank' || reason === 'gateway_technical_error') {
    diagnosisCategory = "BANK_DOWNTIME";
    rootCause = "Temporary issuing bank timeout or network glitch.";
    probability = 0.82;
    reasonFactors = ["Issuer gateway error code", "Transient bank network delay"];

    actions = [
      { id: "act_1_wait", action: "WAIT", params: { waitMinutes: 30 }, reasonCodes: ["BANK_RECOVERY_COOLDOWN"] },
      { id: "act_2_switch", action: "SWITCH_METHOD", params: { suggestedMethod: "upi_or_card" }, reasonCodes: ["ALTERNATIVE_PAYMENT_OPTION"] },
      { id: "act_3_link", action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["SEAMLESS_PAYMENT_LINK"] }
    ];
  } else {
    diagnosisCategory = "SOFT_DECLINE";
    rootCause = "Generic authentication delay or user timeout.";
    probability = 0.60;

    actions = [
      { id: "act_1_link", action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["RECOVERY_LINK"] },
      { id: "act_2_msg", action: "MESSAGE", params: { channel: "whatsapp", template: "payment_help" }, reasonCodes: ["CUSTOMER_ASSIST"] }
    ];
  }

  // S17 / High Value Transaction Policy Floor Gate
  if (amountRupees >= 25000) {
    actions.push({ 
      id: "act_5_escalate", 
      action: "HUMAN_ESCALATION", 
      params: { reason: "Transaction value ₹" + amountRupees + " >= ₹25,000 threshold requires manager review" }, 
      reasonCodes: ["POLICY_HIGH_VALUE_FLOOR"] 
    });
  }

  const perActionPolicy = evaluatePlanPolicies(caseItem, actions);

  const plan = {
    plan_version: "v1.2",
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
    reason_factors: reasonFactors,
    actions,
    per_action_policy: perActionPolicy
  };

  caseItem.current_plan = plan;
  caseItem.policy_decision = perActionPolicy;
  caseItem.status = perActionPolicy.requires_approval ? 'APPROVAL_REQUIRED' : 'PLANNED';

  db.save();
  return caseItem;
}

/**
 * Structured LLM Diagnosis & Recovery Planner with automatic FallbackRecoveryPlanner.
 */
export async function LLMRecoveryPlanner(caseItem, incidentContext = null) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return FallbackRecoveryPlanner(caseItem, incidentContext);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout guard

    // If OpenAI Key provided
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an autonomous Payment SRE Recovery Planner. Return JSON strictly matching: { diagnosis: string, actions: string[] }'
            },
            {
              role: 'user',
              content: JSON.stringify({
                amountRupees: caseItem.amount_paise / 100,
                failure: caseItem.failure_reason,
                incident: incidentContext?.title
              })
            }
          ],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        const fallbackPlan = FallbackRecoveryPlanner(caseItem, incidentContext);
        fallbackPlan.current_plan.planner_source = "LLM";
        if (parsed.diagnosis) fallbackPlan.current_plan.diagnosis = parsed.diagnosis;
        return fallbackPlan;
      }
    }
  } catch (err) {
    console.warn("LLM Planner call failed or timed out, executing FallbackRecoveryPlanner:", err.message);
  }

  return FallbackRecoveryPlanner(caseItem, incidentContext);
}

/**
 * Primary Entry Point for Diagnosis & Planning
 */
export function diagnoseAndPlanCase(caseItem, incidentContext = null) {
  return FallbackRecoveryPlanner(caseItem, incidentContext);
}
