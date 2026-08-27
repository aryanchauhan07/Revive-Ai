import crypto from 'crypto';
import { db } from '../db/database.js';

export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!secret) return true; // Demo mode fallback
  if (!signature) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (e) {
    return false;
  }
}

export function processIncomingWebhook(rawPayload, headers = {}) {
  const eventId = headers['x-razorpay-event-id'] || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const signature = headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Check deduplication
  const existingInbox = db.data.webhookInbox.find(item => item.event_id === eventId);
  if (existingInbox) {
    return { status: 'DUPLICATE_IGNORED', eventId };
  }

  const isValid = verifyWebhookSignature(JSON.stringify(rawPayload), signature, secret);

  const inboxRecord = {
    event_id: eventId,
    received_at: new Date().toISOString(),
    signature_valid: isValid,
    event_type: rawPayload.event || 'unknown',
    payload: rawPayload
  };

  db.data.webhookInbox.unshift(inboxRecord);
  db.save();

  db.addAuditEvent({
    actor_type: 'provider',
    actor_id: 'razorpay_webhook',
    action: 'WEBHOOK_VERIFIED',
    correlation_id: eventId,
    details: `Processed webhook event ${rawPayload.event || 'generic'}. Signature valid: ${isValid}`
  });

  return { status: 'PROCESSED', eventId, valid: isValid };
}
