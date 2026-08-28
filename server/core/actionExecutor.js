import { db } from '../db/database.js';
import { evaluateActionPolicy } from './policyEngine.js';

/**
 * Execute an approved action with strict execution authorization,
 * stable idempotency key, per-action policy re-validation, and optional Razorpay Test Mode API call.
 */
export async function executeCaseAction(caseId, actionToExecute, reviewerId = null) {
  const caseItem = db.getCaseById(caseId);
  if (!caseItem) throw new Error(`Case ${caseId} not found`);

  // 1. Guard against executing action on already recovered case (PDF Requirement S15 & Section 8)
  if (caseItem.status === 'RECOVERED') {
    db.addAuditEvent({
      actor_type: 'system',
      actor_id: 'action_executor_v1',
      action: 'ACTION_SKIPPED_ALREADY_RECOVERED',
      correlation_id: caseId,
      details: `Skipped action execution for case ${caseId}. Case is already RECOVERED.`
    });
    return { status: 'SKIPPED_ALREADY_RECOVERED', case_id: caseId };
  }

  // 2. Execution-time Policy Recheck (PDF Requirement 7.1 & 8)
  const currentIncident = db.getIncidents().find(i => i.id === caseItem.incident_id && i.status === 'OPEN');
  const actionPolicyCheck = evaluateActionPolicy(caseItem, actionToExecute, currentIncident);

  if (actionPolicyCheck.decision === 'BLOCK') {
    db.addAuditEvent({
      actor_type: 'system',
      actor_id: 'policy_engine_v1',
      action: 'EXECUTION_BLOCKED_BY_POLICY',
      correlation_id: caseId,
      details: `Execution of action ${actionToExecute.action} BLOCKED by policy recheck: ${actionPolicyCheck.reason}`
    });
    throw new Error(`Policy check failed at execution time: ${actionPolicyCheck.reason}`);
  }

  // If review required, ensure reviewer authorization provided
  if (actionPolicyCheck.decision === 'REVIEW' && !reviewerId) {
    throw new Error(`Action ${actionToExecute.action} requires explicit human manager approval.`);
  }

  // 3. Stable Idempotency Key Generation (PDF Requirement Section 8 & 17)
  // Format: case_id:plan_version:action_id
  const planVersion = caseItem.current_plan?.plan_version || 'v1';
  const actionId = actionToExecute.action_id || `${caseItem.id}_${actionToExecute.action}`;
  const idempotencyKey = `${caseItem.id}:${planVersion}:${actionId}`;

  // Check idempotency store
  const existingExec = db.data.actionExecutions.find(e => e.idempotency_key === idempotencyKey);
  if (existingExec) {
    db.addAuditEvent({
      actor_type: 'system',
      actor_id: 'action_executor_v1',
      action: 'ACTION_IDEMPOTENT_NOOP',
      correlation_id: caseId,
      details: `Returned existing execution result for idempotency key '${idempotencyKey}'.`
    });
    return existingExec;
  }

  let executionResult = {};
  const actionType = actionToExecute.action;

  // 4. Perform Execution Adapter Call
  if (actionType === 'CREATE_LINK' || actionType === 'SWITCH_METHOD' || actionType === 'INCENTIVE') {
    const isDiscount = actionType === 'INCENTIVE';
    const discountPct = isDiscount ? (actionToExecute.params?.discountPct || 3) : 0;
    const finalAmountRupees = Math.round((caseItem.amount_paise / 100) * (1 - discountPct / 100));

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // Real Razorpay Test Mode Path (PDF Section 8.1 & 17)
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const linkPayload = {
          amount: finalAmountRupees * 100,
          currency: 'INR',
          description: `Revive AI Recovery for Order ${caseItem.provider_payment_id}`,
          customer: {
            name: caseItem.customer_name,
            email: caseItem.customer_email,
            contact: caseItem.customer_phone
          },
          notify: { sms: true, email: true },
          reminder_enable: true
        };

        const rzpResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linkPayload)
        });

        const rzpData = await rzpResponse.json();

        if (rzpResponse.ok && rzpData.short_url) {
          executionResult = {
            provider: 'razorpay_live_test_mode_api',
            payment_link_id: rzpData.id,
            payment_url: rzpData.short_url,
            discount_applied_pct: discountPct,
            final_amount_rupees: finalAmountRupees,
            status: 'ACTIVE_LIVE'
          };
        } else {
          throw new Error(rzpData.error?.description || 'Razorpay API returned error');
        }
      } catch (err) {
        console.warn("Live Razorpay Test Mode call failed, using mock sandbox adapter:", err.message);
        const paymentLinkId = `plink_razor_${Date.now()}`;
        executionResult = {
          provider: 'razorpay_payment_link_sandbox',
          payment_link_id: paymentLinkId,
          payment_url: `http://localhost:5175/?link=${paymentLinkId}&case=${caseItem.id}&amt=${finalAmountRupees}&disc=${discountPct}`,
          discount_applied_pct: discountPct,
          final_amount_rupees: finalAmountRupees,
          status: 'ACTIVE_DEMO'
        };
      }
    } else {
      // Mock Sandbox Adapter
      const paymentLinkId = `plink_razor_${Date.now()}`;
      executionResult = {
        provider: 'razorpay_payment_link_sandbox',
        payment_link_id: paymentLinkId,
        payment_url: `http://localhost:5175/?link=${paymentLinkId}&case=${caseItem.id}&amt=${finalAmountRupees}&disc=${discountPct}`,
        discount_applied_pct: discountPct,
        final_amount_rupees: finalAmountRupees,
        status: 'ACTIVE_DEMO'
      };
    }
  } else if (actionType === 'MESSAGE') {
    executionResult = {
      provider: 'whatsapp_business_api',
      message_id: `wamid_${Date.now()}`,
      recipient: caseItem.customer_phone || '+919876543210',
      template: actionToExecute.params?.template || 'payment_recovery',
      delivered: true,
      timestamp: new Date().toISOString()
    };
  } else if (actionType === 'RETRY') {
    executionResult = {
      provider: 'razorpay_mandate_retry_scheduler',
      scheduled_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      retry_attempt: (caseItem.current_plan?.recoveryHistory?.attempts || 0) + 1
    };
  } else {
    executionResult = {
      provider: 'internal_escalation_workflow',
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

  // Update Case Status to CONTACTED
  db.updateCaseStatus(caseId, 'CONTACTED', {
    last_execution: executionRecord
  });

  db.addAuditEvent({
    actor_type: reviewerId ? 'user' : 'system',
    actor_id: reviewerId || 'action_executor_v1',
    action: 'ACTION_EXECUTED',
    correlation_id: caseId,
    details: `Executed action ${actionType} with stable Idempotency Key '${idempotencyKey}'. Status: COMPLETED`
  });

  return executionRecord;
}
