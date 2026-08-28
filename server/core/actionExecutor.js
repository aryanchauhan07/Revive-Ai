import { db } from '../db/database.js';
import { reevaluatePolicyAtExecution } from './policyEngine.js';

/**
 * Real Razorpay Test Mode API Adapter / Mock Sandbox Adapter
 */
export async function createRazorpayPaymentLinkAdapter(caseItem, amountRupees, discountPct = 0) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isLiveConfigured = Boolean(keyId && keySecret);
  const paymentLinkId = `plink_${isLiveConfigured ? 'live' : 'demo'}_${Date.now()}`;
  const finalAmountPaise = Math.round((caseItem.amount_paise * (1 - discountPct / 100)));

  if (isLiveConfigured) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: finalAmountPaise,
          currency: 'INR',
          accept_partial: false,
          description: `Revive AI Recovery for Order ${caseItem.provider_payment_id}`,
          customer: {
            name: caseItem.customer_name,
            email: caseItem.customer_email,
            contact: caseItem.customer_phone
          },
          notify: { sms: true, email: true },
          reminder_enable: true,
          callback_url: 'http://localhost:5173/payment-callback',
          callback_method: 'get'
        })
      });

      if (response.ok) {
        const liveData = await response.json();
        return {
          provider: 'razorpay_test_mode_api',
          is_simulated: false,
          payment_link_id: liveData.id || paymentLinkId,
          payment_url: liveData.short_url || `http://localhost:5173/?link=${paymentLinkId}`,
          discount_applied_pct: discountPct,
          final_amount_rupees: finalAmountRupees / 100,
          status: 'ACTIVE'
        };
      }
    } catch (err) {
      console.warn("Razorpay Test Mode API call failed, falling back to simulated sandbox:", err.message);
    }
  }

  // Fallback / Sandbox Interactive Payment Link
  const paymentUrl = `http://localhost:5173/?link=${paymentLinkId}&case=${caseItem.id}&amt=${finalAmountRupees / 100}&disc=${discountPct}`;
  return {
    provider: 'razorpay_interactive_sandbox',
    is_simulated: true,
    payment_link_id: paymentLinkId,
    payment_url: paymentUrl,
    discount_applied_pct: discountPct,
    final_amount_rupees: finalAmountRupees / 100,
    status: 'ACTIVE'
  };
}

/**
 * Idempotent Action Executor with Stable Idempotency Keys & Execution-Time Policy Rechecks.
 */
export async function executeCaseAction(caseId, actionToExecute, reviewerId = null) {
  const caseItem = db.getCaseById(caseId);
  if (!caseItem) throw new Error(`Case ${caseId} not found`);

  // 1. MONOTONIC TERMINAL STATE CHECK
  if (caseItem.status === 'RECOVERED' || caseItem.status === 'CANCELLED') {
    throw new Error(`Cannot execute action on terminal case ${caseId} (${caseItem.status})`);
  }

  // 2. STABLE ACTION IDEMPOTENCY KEY (case_id + plan_version + action_id)
  const planVersion = caseItem.current_plan?.plan_version || 'v1.2';
  const actionId = actionToExecute.id || `action_${actionToExecute.action}`;
  const idempotencyKey = `action:${caseItem.id}:${planVersion}:${actionId}`;

  // Deduplicate execution if idempotency key already executed
  const existingExec = db.data.actionExecutions.find(e => e.idempotency_key === idempotencyKey);
  if (existingExec) {
    db.addAuditEvent({
      actor_type: 'system',
      actor_id: 'action_executor_v1',
      action: 'ACTION_IDEMPOTENT_NOOP',
      correlation_id: caseId,
      details: `Stable Idempotency Key ${idempotencyKey} already executed. No duplicate side effects.`
    });
    return existingExec;
  }

  // 3. EXECUTION-TIME POLICY RECHECK (Fail-closed)
  const freshPolicyCheck = reevaluatePolicyAtExecution(caseItem, actionToExecute);
  if (freshPolicyCheck.decision === 'BLOCK') {
    throw new Error(`Execution blocked by fresh policy check: ${freshPolicyCheck.reason}`);
  }
  if (freshPolicyCheck.decision === 'REVIEW' && !reviewerId) {
    throw new Error(`Action requires human manager approval: ${freshPolicyCheck.reason}`);
  }

  // 4. EXECUTE ADAPTER
  let executionResult = {};
  const actionType = actionToExecute.action;

  if (actionType === 'CREATE_LINK' || actionType === 'SWITCH_METHOD' || actionType === 'INCENTIVE') {
    const discountPct = actionType === 'INCENTIVE' ? (actionToExecute.params?.discountPct || 3) : 0;
    const amountRupees = caseItem.amount_paise / 100;
    executionResult = await createRazorpayPaymentLinkAdapter(caseItem, amountRupees, discountPct);
  } else if (actionType === 'MESSAGE') {
    const template = actionToExecute.params?.template || 'payment_recovery';
    const recipient = caseItem.customer_phone || '+919876543210';
    
    executionResult = {
      provider: 'whatsapp_business_api',
      is_simulated: true,
      message_id: `wamid_${Date.now()}`,
      recipient,
      template,
      delivered: true,
      timestamp: new Date().toISOString()
    };
  } else if (actionType === 'RETRY') {
    executionResult = {
      provider: 'razorpay_mandate_retry_scheduler',
      is_simulated: true,
      scheduled_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      retry_attempt: (caseItem.current_plan?.recoveryHistory?.attempts || 0) + 1
    };
  } else {
    executionResult = {
      provider: 'internal_escalation_workflow',
      is_simulated: false,
      reviewer_id: reviewerId || 'system_auto',
      status: 'HANDLED'
    };
  }

  const executionRecord = {
    id: `EXEC-${Date.now()}`,
    case_id: caseId,
    idempotency_key: idempotencyKey,
    action: actionType,
    params: actionToExecute.params || {},
    result: executionResult,
    executed_at: new Date().toISOString(),
    status: 'COMPLETED'
  };

  db.data.actionExecutions.unshift(executionRecord);

  // Update Case State to CONTACTED
  db.updateCaseStatus(caseId, 'CONTACTED', {
    last_execution: executionRecord
  });

  db.addAuditEvent({
    actor_type: reviewerId ? 'user' : 'system',
    actor_id: reviewerId || 'action_executor_v1',
    action: 'ACTION_EXECUTED',
    correlation_id: caseId,
    details: `Executed ${actionType} with Idempotency Key ${idempotencyKey}. Provider: ${executionResult.provider}. Status: COMPLETED.`
  });

  db.save();
  return executionRecord;
}
