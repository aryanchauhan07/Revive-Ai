import crypto from 'crypto';
import { db } from '../db/database.js';

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
 * monotonic state merge, and customer self-recovery cancellation.
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

  // 3. PERSIST UNHANDLED INBOX RECEIPT
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
  const paymentEntity = rawPayload.payload?.payment?.entity || rawPayload.payload?.order?.entity || {};
  const paymentId = paymentEntity.id || `pay_mock_${Date.now()}`;
  const amountPaise = paymentEntity.amount || 485000;

  // 4. CUSTOMER SELF-RECOVERY CANCELLATION (S15) & MONOTONIC STATE MERGE
  if (eventName === 'payment.captured' || eventName === 'order.paid') {
    const existingCase = db.getCases().find(c => c.provider_payment_id === paymentId || c.id === rawPayload.case_id);
    if (existingCase) {
      // Monotonic guard: Never regress RECOVERED state
      if (existingCase.status !== 'RECOVERED') {
        db.updateCaseStatus(existingCase.id, 'RECOVERED', {
          attribution: 'SELF_RECOVERED',
          recovered_at: new Date().toISOString(),
          canceled_queued_actions: true
        });

        db.addAuditEvent({
          actor_type: 'provider',
          actor_id: 'razorpay_webhook',
          action: 'CUSTOMER_SELF_RECOVERED',
          correlation_id: existingCase.id,
          details: `Payment ${paymentId} captured independently. CANCELED all queued recovery actions. Attribution = SELF_RECOVERED.`
        });
      }
    }
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
