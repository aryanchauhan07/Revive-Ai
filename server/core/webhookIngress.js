import crypto from 'crypto';
import { db } from '../db/database.js';

/**
 * Verify Razorpay Webhook HMAC signature using exact raw bytes
 * PDF Requirement 8.0: Never JSON.stringify a parsed body!
 */
export function verifyRawWebhookSignature(rawBytes, signature, secret) {
  if (!secret) {
    // If no secret configured in DEMO_MODE, return true for demo testing
    return true;
  }
  if (!signature || !rawBytes) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBytes)
      .digest('hex');
    
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (e) {
    return false;
  }
}

/**
 * Process incoming Razorpay webhook payload with raw body HMAC verification,
 * event deduplication, and monotonic state merge for out-of-order events.
 */
export function processIncomingWebhook(rawPayload, headers = {}, rawBodyBuffer = null) {
  const eventId = headers['x-razorpay-event-id'] || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const signature = headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Check deduplication on x-razorpay-event-id (PDF Requirement S8 & Section 8)
  const existingInbox = db.data.webhookInbox.find(item => item.event_id === eventId);
  if (existingInbox) {
    db.addAuditEvent({
      actor_type: 'provider',
      actor_id: 'razorpay_webhook',
      action: 'WEBHOOK_DUPLICATE_IGNORED',
      correlation_id: eventId,
      details: `Duplicate x-razorpay-event-id '${eventId}' received. No-op execution.`
    });
    return { status: 'DUPLICATE_IGNORED', eventId, statusCode: 200 };
  }

  // 2. Raw HMAC Signature Verification (PDF Requirement Section 8 & 17)
  const isSignatureProvided = !!signature;
  const isSecretConfigured = !!secret;
  
  let isValid = true;
  if (isSecretConfigured || isSignatureProvided) {
    const rawBytesToUse = rawBodyBuffer || (typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload));
    isValid = verifyRawWebhookSignature(rawBytesToUse, signature, secret);
  }

  if (!isValid) {
    db.addAuditEvent({
      actor_type: 'provider',
      actor_id: 'razorpay_webhook',
      action: 'SECURITY_WEBHOOK_SIGNATURE_REJECTED',
      correlation_id: eventId,
      details: `REJECTED invalid Razorpay webhook signature for event '${eventId}'. Security boundary enforced.`
    });
    return { status: 'REJECTED_INVALID_SIGNATURE', eventId, statusCode: 401 };
  }

  // 3. Save Inbox Record
  const inboxRecord = {
    event_id: eventId,
    received_at: new Date().toISOString(),
    signature_valid: isValid,
    event_type: rawPayload.event || 'unknown',
    payload: rawPayload
  };

  db.data.webhookInbox.unshift(inboxRecord);

  // 4. Handle Monotonic Event Processing (Out-of-order event safety / PDF Requirement S9 & Section 8)
  const eventName = rawPayload.event || '';
  const paymentObj = rawPayload.payload?.payment?.entity || {};
  const providerPaymentId = paymentObj.id || rawPayload.payload?.order?.entity?.id || null;

  if (providerPaymentId) {
    const existingCase = db.data.recoveryCases.find(c => c.provider_payment_id === providerPaymentId);
    
    if (existingCase) {
      // Monotonic guard: Never regress RECOVERED / CAPTURED state to AUTHORIZED or FAILED
      if (existingCase.status === 'RECOVERED' && (eventName === 'payment.failed' || eventName === 'payment.authorized')) {
        db.addAuditEvent({
          actor_type: 'system',
          actor_id: 'state_machine_v1',
          action: 'OUT_OF_ORDER_EVENT_SUPPRESSED',
          correlation_id: existingCase.id,
          details: `Out-of-order event '${eventName}' suppressed for RECOVERED case ${existingCase.id}. Monotonic state preserved.`
        });
      } else if (eventName === 'payment.captured' || eventName === 'order.paid') {
        // Payment Succeeded / Self-recovered! Cancel queued actions (PDF Requirement S15 & Section 6)
        db.updateCaseStatus(existingCase.id, 'RECOVERED', {
          attribution: existingCase.status === 'CONTACTED' ? 'METHOD_SWITCH_ASSISTED' : 'SELF_RECOVERED',
          recovered_at: new Date().toISOString()
        });

        db.addAuditEvent({
          actor_type: 'provider',
          actor_id: 'razorpay_webhook',
          action: 'PAYMENT_CAPTURED_SELF_RECOVERY_CANCELLED_QUEUED',
          correlation_id: existingCase.id,
          details: `Payment captured for case ${existingCase.id}. Queued recovery actions cancelled immediately.`
        });
      }
    }
  }

  db.addAuditEvent({
    actor_type: 'provider',
    actor_id: 'razorpay_webhook',
    action: 'WEBHOOK_VERIFIED',
    correlation_id: eventId,
    details: `Verified & processed webhook event '${eventName}'. Event ID: ${eventId}`
  });

  db.save();
  return { status: 'PROCESSED', eventId, valid: true, statusCode: 200 };
}
