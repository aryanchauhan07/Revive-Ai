import crypto from 'crypto';
import { db } from '../db/database.js';
import { FallbackRecoveryPlanner } from './recoveryPlanner.js';
import { evaluatePlanPolicies } from './policyEngine.js';
import { privacyEngine } from './privacyEngine.js';

/**
 * Validates Razorpay Webhook HMAC signature using raw request bytes buffer.
 * Per Razorpay guidance & production spec: NEVER JSON.stringify parsed body.
 */
export function verifyRawWebhookSignature(rawBodyBuffer, signature, secret) {
  if (!secret) {
    // If webhook secret is omitted in demo mode, signature verification is skipped safely
    return { valid: true, isDemo: true };
  }
  if (!signature || !rawBodyBuffer) {
    return { valid: false, reason: 'MISSING_SIGNATURE_OR_RAW_BODY' };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBodyBuffer)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

    return { valid: isValid, reason: isValid ? 'OK' : 'INVALID_HMAC_MISMATCH' };
  } catch (err) {
    return { valid: false, reason: `CRYPTO_ERROR: ${err.message}` };
  }
}

/**
 * Handles incoming Razorpay Webhook events with idempotency, HMAC verification,
 * case creation, automated recovery planning, policy evaluation, and customer self-recovery cancellation.
 */
export function processIncomingWebhook(rawPayload, headers = {}, rawBodyBuffer = null) {
  const eventId = headers['x-razorpay-event-id'] || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const signature = headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. RAW HMAC SIGNATURE VALIDATION
  const signatureCheck = verifyRawWebhookSignature(rawBodyBuffer, signature, secret);
  if (!signatureCheck.valid) {
    db.addAuditEvent({
      actor_type: 'provider',
      actor_id: 'razorpay_webhook',
      action: 'SECURITY_WEBHOOK_REJECTED',
      correlation_id: eventId,
      details: `REJECTED 401: Invalid HMAC webhook signature. Reason: ${signatureCheck.reason}. Domain state untouched.`
    });

    return {
      statusCode: 401,
      status: 'INVALID_SIGNATURE',
      eventId,
      error: 'Invalid Razorpay webhook signature'
    };
  }

  // 2. IDEMPOTENCY CHECK (x-razorpay-event-id deduplication)
  const existingInbox = db.data.webhookInbox.find(item => item.event_id === eventId);
  if (existingInbox) {
    db.addAuditEvent({
      actor_type: 'provider',
      actor_id: 'razorpay_webhook',
      action: 'DUPLICATE_WEBHOOK_IGNORED',
      correlation_id: eventId,
      details: `No-op: Webhook event ${eventId} already processed at ${existingInbox.received_at}. Duplicate ignored safely.`
    });

    return {
      statusCode: 200,
      status: 'DUPLICATE_IGNORED',
      eventId,
      message: 'Duplicate event ignored successfully'
    };
  }

  // 3. PERSIST INBOX RECEIPT
  const inboxRecord = {
    event_id: eventId,
    received_at: new Date().toISOString(),
    signature_valid: signatureCheck.valid,
    is_demo: signatureCheck.isDemo || false,
    event_type: rawPayload.event || 'unknown',
    payload: rawPayload
  };

  db.data.webhookInbox.unshift(inboxRecord);

  const eventName = rawPayload.event || 'payment.failed';
  const paymentEntity = rawPayload.payload?.payment?.entity || rawPayload.payload?.order?.entity || rawPayload.payload?.payment_link?.entity || {};
  const paymentId = paymentEntity.id || rawPayload.payment_id || `pay_mock_${Date.now()}`;
  const orderId = paymentEntity.order_id || rawPayload.order_id || null;
  const amountPaise = paymentEntity.amount || rawPayload.amount || 485000;
  const customerContact = paymentEntity.contact || rawPayload.contact || '+919876543210';
  const customerEmail = paymentEntity.email || rawPayload.email || 'customer@example.com';
  const customerName = paymentEntity.notes?.customer_name || rawPayload.customer_name || customerEmail.split('@')[0] || 'Customer';

  // 4. CUSTOMER OPT-OUT / STOP KEYWORD ENFORCEMENT
  if (eventName === 'customer.opt_out' || (rawPayload.event === 'whatsapp.message_received' && rawPayload.message?.text?.trim().toUpperCase() === 'STOP')) {
    privacyEngine.recordOptOut(customerContact, "CUSTOMER_REQUESTED_STOP");
    privacyEngine.recordOptOut(customerEmail, "CUSTOMER_REQUESTED_STOP");

    db.getCases().forEach(c => {
      const isMatch = c.customer_phone === customerContact || c.customer_email === customerEmail || c.customer_contact?.phone === customerContact;
      if (isMatch && c.status !== 'RECOVERED') {
        db.updateCaseStatus(c.id, 'OPTED_OUT_PAUSED', {
          opted_out: true,
          opted_out_at: new Date().toISOString(),
          canceled_queued_actions: true
        });

        db.addAuditEvent({
          actor_type: 'customer',
          actor_id: customerContact,
          action: 'CUSTOMER_OPT_OUT_STOP',
          correlation_id: c.id,
          details: `Customer sent STOP keyword. Blocked all future recovery outreach and canceled queued actions.`
        });
      }
    });

    db.save();
    return { statusCode: 200, status: 'OPT_OUT_PROCESSED', eventId, eventType: eventName };
  }

  // 5. CUSTOMER PAYMENT CAPTURED (One-Time Verified Attribution & Monotonic State Merge)
  if (eventName === 'payment.captured' || eventName === 'order.paid' || eventName === 'payment_link.paid') {
    const existingCase = db.getCases().find(c => 
      c.provider_payment_id === paymentId || 
      (orderId && c.razorpay_order_id === orderId) || 
      c.id === rawPayload.case_id
    );

    if (existingCase) {
      if (existingCase.status !== 'RECOVERED') {
        const attribution = rawPayload.attribution || (existingCase.last_execution ? 'RECOVEROPS_STANDARD_CHECKOUT' : 'SELF_RECOVERED');
        db.updateCaseStatus(existingCase.id, 'RECOVERED', {
          attribution,
          recovered_at: new Date().toISOString(),
          provider_payment_id: paymentId,
          razorpay_order_id: orderId || existingCase.razorpay_order_id,
          payment_method_used: paymentEntity.method || 'card',
          canceled_queued_actions: true
        });

        db.addAuditEvent({
          actor_type: 'provider',
          actor_id: 'razorpay_webhook',
          action: 'PAYMENT_CAPTURED_RECOVERED',
          correlation_id: existingCase.id,
          details: `Payment ${paymentId} captured. Canceled queued outreach actions. Recovered ₹${(existingCase.amount_paise / 100).toLocaleString()}. Attribution: ${attribution}.`
        });
      }
    }
  }

  // 6. WEBHOOK FAILURE -> CASE CREATION -> PLAN FLOW
  if (eventName === 'payment.failed' || eventName === 'payment_link.cancelled' || eventName === 'order.failed') {
    let targetCase = db.getCases().find(c => 
      (orderId && c.razorpay_order_id === orderId) || 
      c.provider_payment_id === paymentId || 
      c.id === rawPayload.case_id
    );

    const activeIncident = db.getIncidents().find(i => i.status === 'OPEN' && (i.dimensions?.issuer === paymentEntity.bank || i.dimensions?.method === paymentEntity.method));

    if (!targetCase) {
      targetCase = {
        id: rawPayload.case_id || `CASE-${Date.now().toString().slice(-4)}`,
        merchant_id: 'merchant_razor_01',
        customer_name: customerName,
        customer_phone: customerContact,
        customer_email: customerEmail,
        customer_contact: { phone: customerContact, email: customerEmail },
        amount_paise: amountPaise,
        provider_payment_id: paymentId,
        razorpay_order_id: orderId,
        failure_reason: {
          error_code: paymentEntity.error_code || 'BAD_REQUEST_ERROR',
          error_description: paymentEntity.error_description || 'Payment authorization failed at issuing bank',
          error_source: paymentEntity.error_source || 'bank',
          error_step: paymentEntity.error_step || 'payment_authorization',
          error_reason: paymentEntity.error_reason || 'payment_failed',
          issuer: paymentEntity.bank || 'HDFC Bank',
          method: paymentEntity.method || 'upi'
        },
        status: 'PLANNED',
        created_at: new Date().toISOString()
      };

      db.addCase(targetCase);
    }

    // Generate Recovery Plan & Evaluate Policy
    const plan = FallbackRecoveryPlanner(targetCase, activeIncident);
    targetCase.current_plan = plan;

    // Check Privacy Engine
    const privacyCheck = privacyEngine.evaluateCommunicationEligibility({ phone: customerContact, email: customerEmail }, targetCase);
    const merchant = db.getMerchant();
    const policyResult = evaluatePlanPolicies(targetCase, plan.actions || []);

    if (!privacyCheck.eligible) {
      targetCase.status = privacyCheck.reasonCode === 'OPTED_OUT_DND' ? 'OPTED_OUT_PAUSED' : 'PLANNED';
      targetCase.policy_decision = { requires_approval: false, decision: 'BLOCK', reason: privacyCheck.reason };
    } else if (policyResult.requires_approval || merchant.killSwitch) {
      targetCase.status = 'APPROVAL_REQUIRED';
      targetCase.policy_decision = policyResult;
    } else if (merchant.mode === 'AUTOPILOT') {
      targetCase.status = 'IN_PROGRESS';
      targetCase.policy_decision = policyResult;
    } else if (merchant.mode === 'OBSERVE') {
      targetCase.status = 'OBSERVE_MODE';
      targetCase.policy_decision = policyResult;
    } else {
      targetCase.status = 'PLANNED';
      targetCase.policy_decision = policyResult;
    }

    db.addAuditEvent({
      actor_type: 'system',
      actor_id: 'webhook_recovery_planner',
      action: 'WEBHOOK_CASE_PLANNED',
      correlation_id: targetCase.id,
      details: `Generated recovery plan for ${targetCase.id} (₹${(amountPaise / 100).toLocaleString()}). Status: ${targetCase.status}. Optimal Action: ${plan.optimal_action}.`
    });
  }

  db.addAuditEvent({
    actor_type: 'provider',
    actor_id: 'razorpay_webhook',
    action: 'WEBHOOK_VERIFIED',
    correlation_id: eventId,
    details: `Processed webhook ${eventName} for ${paymentId}. Signature valid: ${signatureCheck.valid}.`
  });

  db.save();

  return {
    statusCode: 200,
    status: 'PROCESSED',
    eventId,
    valid: signatureCheck.valid,
    eventType: eventName
  };
}
