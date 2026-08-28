import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

import { verifyRawWebhookSignature, processIncomingWebhook } from '../server/core/webhookIngress.js';
import { evaluateSingleActionPolicy, evaluatePlanPolicies } from '../server/core/policyEngine.js';
import { createPRNG, runBatchEvaluation } from '../server/simulation/batchSimulator.js';
import { db } from '../server/db/database.js';

test('1. Webhook Signature Verification - Valid Raw HMAC Signature', () => {
  const secret = 'whsec_test_secret_123';
  const rawBody = Buffer.from(JSON.stringify({ event: 'payment.failed', payload: { payment: { entity: { id: 'pay_test_101' } } } }));
  const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const check = verifyRawWebhookSignature(rawBody, signature, secret);
  assert.equal(check.valid, true);
  assert.equal(check.reason, 'OK');
});

test('2. Webhook Signature Verification - Invalid Signature returns 401 Rejection', () => {
  const secret = 'whsec_test_secret_123';
  const rawBody = Buffer.from(JSON.stringify({ event: 'payment.failed' }));
  const invalidSignature = 'invalid_sha256_signature_hex_code';

  const check = verifyRawWebhookSignature(rawBody, invalidSignature, secret);
  assert.equal(check.valid, false);

  // Test webhook ingress handler response
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;
  const result = processIncomingWebhook({ event: 'payment.failed' }, { 'x-razorpay-signature': invalidSignature }, rawBody);
  assert.equal(result.statusCode, 401);
  assert.equal(result.status, 'INVALID_SIGNATURE');
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

test('3. Webhook Idempotency - Duplicate Event ID is a No-Op', () => {
  const eventId = `evt_test_dedupe_${Date.now()}`;
  const payload = { event: 'payment.failed', payload: { payment: { entity: { id: 'pay_dedupe_1' } } } };

  const firstCall = processIncomingWebhook(payload, { 'x-razorpay-event-id': eventId });
  assert.equal(firstCall.status, 'PROCESSED');

  const secondCall = processIncomingWebhook(payload, { 'x-razorpay-event-id': eventId });
  assert.equal(secondCall.status, 'DUPLICATE_IGNORED');
  assert.equal(secondCall.statusCode, 200);
});

test('4. Per-Action Policy Engine - Evaluates Every Action Individually', () => {
  // Standard Order (₹4,850)
  const standardCase = {
    id: "CASE-TEST-01",
    amount_paise: 485000,
    status: "PLANNED",
    current_plan: { plan_version: "v1.2" }
  };

  const planActions = [
    { id: "act_1", action: "WAIT" },
    { id: "act_2", action: "CREATE_LINK" },
    { id: "act_3", action: "INCENTIVE", params: { discountPct: 3 } }
  ];

  const standardPolicy = evaluatePlanPolicies(standardCase, planActions);
  assert.equal(standardPolicy.actions_policy_map.act_1.decision, 'ALLOW');
  assert.equal(standardPolicy.actions_policy_map.act_3.decision, 'REVIEW');

  // High-Value Order (₹28,500 >= ₹25,000 threshold)
  const highValueCase = {
    id: "CASE-TEST-02",
    amount_paise: 2850000,
    status: "PLANNED",
    current_plan: { plan_version: "v1.2" }
  };

  const highValuePolicy = evaluatePlanPolicies(highValueCase, planActions);
  assert.equal(highValuePolicy.requires_approval, true);
  assert.equal(highValuePolicy.actions_policy_map.act_1.decision, 'REVIEW');
});

test('5. Customer Self-Recovery - Payment Captured Cancels Queued Actions', () => {
  const caseId = 'CASE-TEST-SELF-RECOVER';
  const paymentId = `pay_self_${Date.now()}`;

  db.addCase({
    id: caseId,
    merchant_id: "merchant_razor_01",
    provider_payment_id: paymentId,
    amount_paise: 500000,
    status: "CONTACTED"
  });

  const webhookPayload = {
    event: "payment.captured",
    payload: { payment: { entity: { id: paymentId } } }
  };

  processIncomingWebhook(webhookPayload, { 'x-razorpay-event-id': `evt_self_${Date.now()}` });

  const updatedCase = db.getCaseById(caseId);
  assert.equal(updatedCase.status, 'RECOVERED');
  assert.equal(updatedCase.attribution, 'SELF_RECOVERED');
});

test('6. Seeded PRNG Benchmark Reproducibility - Same Seed Yields Identical Output', () => {
  const seed = 20260828;
  const run1 = runBatchEvaluation(100, seed);
  const run2 = runBatchEvaluation(100, seed);

  assert.equal(run1.total_revenue_at_risk_paise, run2.total_revenue_at_risk_paise);
  assert.equal(run1.recoverOps_gross_recovered_paise, run2.recoverOps_gross_recovered_paise);
  assert.equal(run1.recovery_rate_pct, run2.recovery_rate_pct);
  assert.equal(run1.policy_violations, 0);
});
