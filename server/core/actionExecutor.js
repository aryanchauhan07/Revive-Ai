import { db } from '../db/database.js';

export async function executeCaseAction(caseId, actionToExecute, reviewerId = null) {
  const caseItem = db.getCaseById(caseId);
  if (!caseItem) throw new Error(`Case ${caseId} not found`);

  // Verify policy decision exists
  if (!caseItem.policy_decision) {
    throw new Error(`Cannot execute action for case ${caseId} without valid PolicyDecision`);
  }

  // Generate Idempotency Key
  const idempotencyKey = `action:${caseItem.id}:${actionToExecute.action}:${Date.now()}`;

  // Check if idempotency key already executed
  const existingExec = db.data.actionExecutions.find(e => e.idempotency_key === idempotencyKey);
  if (existingExec) {
    return existingExec;
  }

  let executionResult = {};
  const actionType = actionToExecute.action;

  if (actionType === 'CREATE_LINK' || actionType === 'SWITCH_METHOD' || actionType === 'INCENTIVE') {
    const isDiscount = actionType === 'INCENTIVE';
    const discountPct = isDiscount ? (actionToExecute.params?.discountPct || 3) : 0;
    const finalAmountRupees = (caseItem.amount_paise / 100) * (1 - discountPct / 100);

    const paymentLinkId = `plink_razor_${Date.now()}`;
    const paymentUrl = `http://localhost:5173/?link=${paymentLinkId}&case=${caseItem.id}&amt=${finalAmountRupees}&disc=${discountPct}`;

    executionResult = {
      provider: 'razorpay_payment_link',
      payment_link_id: paymentLinkId,
      payment_url: paymentUrl,
      discount_applied_pct: discountPct,
      final_amount_rupees: finalAmountRupees,
      status: 'ACTIVE'
    };
  } else if (actionType === 'MESSAGE') {
    const template = actionToExecute.params?.template || 'payment_recovery';
    const recipient = caseItem.customer_phone || '+919876543210';
    
    executionResult = {
      provider: 'whatsapp_business_api',
      message_id: `wamid_${Date.now()}`,
      recipient,
      template,
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

  // Update Case State to CONTACTED or EXECUTED
  db.updateCaseStatus(caseId, 'CONTACTED', {
    last_execution: executionRecord
  });

  db.addAuditEvent({
    actor_type: reviewerId ? 'user' : 'system',
    actor_id: reviewerId || 'action_executor_v1',
    action: 'ACTION_EXECUTED',
    correlation_id: caseId,
    details: `Executed action ${actionType} with Idempotency Key ${idempotencyKey}. Status: COMPLETED`
  });

  return executionRecord;
}
