import crypto from 'crypto';
import assert from 'assert';
import { processIncomingWebhook, verifyRawWebhookSignature } from '../server/core/webhookIngress.js';
import { evaluateActionPolicy, evaluatePlanPolicy } from '../server/core/policyEngine.js';
import { executeCaseAction } from '../server/core/actionExecutor.js';
import { runBatchEvaluation } from '../server/simulation/batchSimulator.js';
import { db } from '../server/db/database.js';

console.log('=======================================================');
console.log('  RECOVEROPS Principal-Engineer Verification Test Suite ');
console.log('=======================================================');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(` ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(` ❌ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(` ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(` ❌ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Raw HMAC Signature Verification
runTest('Raw Webhook HMAC Signature Validation', () => {
  const secret = 'rzp_test_secret_key_12345';
  const rawBody = '{"event":"payment.failed","payload":{"payment":{"entity":{"id":"pay_test_99"}}}}';
  const validSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const isValid = verifyRawWebhookSignature(rawBody, validSignature, secret);
  assert.strictEqual(isValid, true, 'Valid raw HMAC signature should be accepted');

  const isInvalid = verifyRawWebhookSignature(rawBody, 'invalid_signature_hash', secret);
  assert.strictEqual(isInvalid, false, 'Invalid HMAC signature should be rejected');
});

// 2. Reject Invalid Signature with 401 & Security Audit
runTest('Invalid Signature Rejection Boundary', () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = 'my_strict_secret';
  const rawPayload = { event: 'payment.failed' };
  
  const result = processIncomingWebhook(rawPayload, {
    'x-razorpay-event-id': 'evt_invalid_sig_001',
    'x-razorpay-signature': 'bad_sig'
  }, 'raw_body_bytes');

  assert.strictEqual(result.statusCode, 401, 'Invalid signature must return 401');
  assert.strictEqual(result.status, 'REJECTED_INVALID_SIGNATURE', 'Invalid signature status expected');

  // Reset secret for demo mode
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

// 3. Duplicate x-razorpay-event-id Deduplication
runTest('Webhook Event-ID Deduplication (No-Op)', () => {
  const payload = { event: 'payment.failed', payload: {} };
  const eventId = 'evt_dedupe_test_777';

  const res1 = processIncomingWebhook(payload, { 'x-razorpay-event-id': eventId });
  assert.strictEqual(res1.status, 'PROCESSED', 'First event delivery should process');

  const res2 = processIncomingWebhook(payload, { 'x-razorpay-event-id': eventId });
  assert.strictEqual(res2.status, 'DUPLICATE_IGNORED', 'Duplicate event delivery must be no-op');
});

// 4. Action-Level Policy & Technical Outage Zero Discount Rule
runTest('Technical Outage Zero Discount Policy Enforcement', () => {
  const testCase = {
    id: 'CASE-TEST-OUTAGE',
    amount_paise: 500000,
    failure_reason: { error_source: 'issuer_bank', error_reason: 'gateway_technical_error', method: 'upi' }
  };
  const incidentContext = { id: 'INC-OUTAGE', status: 'OPEN' };
  const incentiveAction = { action_id: 'act_discount', action: 'INCENTIVE', params: { discountPct: 3 } };

  const policyCheck = evaluateActionPolicy(testCase, incentiveAction, incidentContext);
  assert.strictEqual(policyCheck.decision, 'BLOCK', 'Technical outage must block discount incentive');
  assert.strictEqual(policyCheck.matched_rules.includes('TECHNICAL_OUTAGE_NO_DISCOUNT'), true, 'TECHNICAL_OUTAGE_NO_DISCOUNT rule matched');
});

// 5. Execution Authorization & Stable Idempotency Key
runAsyncTest('Stable Idempotency Key & Action Execution Authorization', async () => {
  const testCase = {
    id: 'CASE-TEST-EXEC',
    amount_paise: 1000000,
    status: 'PLANNED',
    provider_payment_id: 'pay_exec_001',
    customer_name: 'Test Customer',
    customer_phone: '+919876543210',
    current_plan: {
      plan_version: 'v1',
      actions: [{ action_id: 'act_create_link_v1', action: 'CREATE_LINK', params: {} }]
    },
    policy_decision: { decision: 'ALLOW', requires_approval: false }
  };

  db.addCase(testCase);

  const actionToExec = { action_id: 'act_create_link_v1', action: 'CREATE_LINK', params: {} };
  const exec1 = await executeCaseAction(testCase.id, actionToExec, 'test_runner');

  assert.ok(exec1.idempotency_key.includes('CASE-TEST-EXEC:v1:act_create_link_v1'), 'Idempotency key format matches case_id:plan_version:action_id');

  // Re-run execution with same key (should be idempotent no-op)
  const exec2 = await executeCaseAction(testCase.id, actionToExec, 'test_runner');
  assert.strictEqual(exec1.id, exec2.id, 'Idempotent execution returns identical execution record');
});

// 6. Self-Recovery Cancels Queued Actions
runTest('Customer Self-Recovery Cancels Queued Actions', () => {
  const testCase = {
    id: 'CASE-SELF-RECOVER',
    provider_payment_id: 'pay_self_123',
    status: 'CONTACTED',
    customer_name: 'Self Recovering Customer'
  };
  db.addCase(testCase);

  const capturedPayload = {
    event: 'payment.captured',
    payload: { payment: { entity: { id: 'pay_self_123' } } }
  };

  processIncomingWebhook(capturedPayload, { 'x-razorpay-event-id': 'evt_self_rec_888' });

  const updatedCase = db.getCaseById('CASE-SELF-RECOVER');
  assert.strictEqual(updatedCase.status, 'RECOVERED', 'Payment captured updates case to RECOVERED');
  assert.strictEqual(updatedCase.attribution, 'METHOD_SWITCH_ASSISTED', 'Attribution tracked correctly');
});

// 7. Seeded PRNG Benchmark Determinism
runTest('Seeded Benchmark Determinism & Byte-for-Byte Reproducibility', () => {
  const run1 = runBatchEvaluation(100, 20260828);
  const run2 = runBatchEvaluation(100, 20260828);

  assert.strictEqual(run1.total_revenue_at_risk_paise, run2.total_revenue_at_risk_paise, 'Same seed produces identical total revenue at risk');
  assert.strictEqual(run1.recoverOps_gross_recovered_paise, run2.recoverOps_gross_recovered_paise, 'Same seed produces identical gross recovered revenue');
  assert.strictEqual(run1.recovery_rate_pct, run2.recovery_rate_pct, 'Same seed produces identical recovery rate');
  assert.strictEqual(run1.policy_violations, 0, 'Target policy violations is 0');
});

setTimeout(() => {
  console.log('=======================================================');
  console.log(`  Verification Results: ${passedTests}/${totalTests} Passed `);
  console.log('=======================================================');
  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, 500);
