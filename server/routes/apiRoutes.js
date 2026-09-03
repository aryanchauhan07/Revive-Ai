import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { diagnoseAndPlanCase } from '../core/recoveryPlanner.js';
import { executeCaseAction } from '../core/actionExecutor.js';
import { runBatchEvaluation } from '../simulation/batchSimulator.js';
import { evaluatePlanPolicies, reEvaluateAllCasesPolicy } from '../core/policyEngine.js';
import { processIncomingWebhook } from '../core/webhookIngress.js';
import { generateCaseDiagnosisAndPlan, generateOmnichannelMessage } from '../core/llmAgent.js';
import { privacyEngine } from '../core/privacyEngine.js';

const router = express.Router();

// SSE Clients List for real-time live events stream
let sseClients = [];

export function broadcastSSE(eventData) {
  sseClients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify(eventData)}\n\n`);
    } catch (e) {
      console.warn("Error sending SSE to client:", e.message);
    }
  });
}

// 1. SSE Stream Endpoint
router.get('/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// 2. Merchant & Policy Endpoints
router.get('/merchant', (req, res) => {
  res.json(db.getMerchant());
});

router.post('/merchant/policy', (req, res) => {
  const updated = db.updateMerchantPolicy(req.body);
  
  // Dynamically re-evaluate all active customer cases against the new policy thresholds
  reEvaluateAllCasesPolicy(updated);

  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'merchant_admin',
    action: 'POLICY_UPDATED',
    correlation_id: 'merchant_razor_01',
    details: `Updated policy: Mode=${updated.mode}, MaxDiscount=${updated.policy?.money?.maxDiscountPct}%, HighValueFloor=₹${(updated.policy?.money?.highValueApprovalPaise || 2500000) / 100}. Re-evaluated active cases.`
  });
  broadcastSSE({ type: 'MERCHANT_POLICY_UPDATED', data: updated });
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  res.json(updated);
});

router.post('/merchant/kill-switch', (req, res) => {
  const { enabled } = req.body;
  const updated = db.setKillSwitch(enabled);
  reEvaluateAllCasesPolicy(updated);

  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'merchant_admin',
    action: enabled ? 'KILL_SWITCH_ENGAGED' : 'KILL_SWITCH_DISENGAGED',
    correlation_id: 'merchant_razor_01',
    details: enabled ? 'Emergency kill switch ACTIVATED. All side-effect actions paused.' : 'Emergency kill switch deactivated. Normal execution resumed.'
  });
  broadcastSSE({ type: 'KILL_SWITCH_CHANGED', data: { killSwitch: enabled } });
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  res.json(updated);
});

// 3. Incidents Endpoints
router.get('/incidents', (req, res) => {
  res.json(db.getIncidents());
});

// 4. Cases & Planning Endpoints
router.get('/cases', (req, res) => {
  res.json(db.getCases());
});

router.get('/cases/:id', (req, res) => {
  const c = db.getCaseById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json(c);
});

// 5. Action Execution Endpoint
router.post('/cases/:id/execute', async (req, res) => {
  try {
    const { action, reviewerId } = req.body;
    const result = await executeCaseAction(req.params.id, action, reviewerId);
    broadcastSSE({ type: 'ACTION_EXECUTED', data: result });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Universal Demo Trigger Generator (Supports ANY Bank, PSP, or Payment Rail dynamically)
router.post('/demo/trigger-incident', (req, res) => {
  const { bank = "HDFC Bank", method = "upi" } = req.body;
  const incId = `INC-${Date.now().toString().slice(-4)}`;

  let incidentTitle = `${bank} ${method.toUpperCase()} Authorization Degradation`;
  let railName = `${bank} ${method.toUpperCase()}`;
  let reason = "gateway_technical_error";
  let step = "payment_authorization";
  let baseRate = 0.88;
  let currentRate = 0.38;
  let zScore = -2.8;
  let rootCause = `${bank} core authorization servers experiencing severe timeout spikes. Spike in 504 Gateway Timeouts.`;
  let recommended = `Trip circuit breaker on ${railName}. Suppress same-rail retries and route customers to healthy alternate rails.`;
  let alternateRail = method === 'upi' ? "Cards & Netbanking 1-Click Pay Link" : "Instant UPI QR 1-Click Pay Link";
  let scope = "SYSTEMIC_ISSUER_OUTAGE";

  if (method === 'card' || bank.toLowerCase().includes('card')) {
    incidentTitle = `${bank} 3DS Authentication Timeout Spike`;
    railName = `${bank} Visa/Mastercard 3DS`;
    reason = "otp_timeout_expired";
    step = "3ds_challenge";
    baseRate = 0.92;
    currentRate = 0.68;
    zScore = -2.7;
    rootCause = `${bank} 3DS OTP delivery latency (+45s spike) causing high checkout drop-offs post-challenge.`;
    recommended = `Bypass 3DS retry loop; dispatch instant UPI QR 1-click recovery payment link.`;
    alternateRail = "UPI Instant QR 1-Click Pay Link";
    scope = "GATEWAY_LATENCY_ANOMALY";
  } else if (method === 'mandate' || bank.toLowerCase().includes('mandate') || bank.toLowerCase().includes('autopay')) {
    incidentTitle = `${bank} AutoPay e-Mandate Balance Deficit`;
    railName = `${bank} AutoPay e-Mandates`;
    reason = "insufficient_funds";
    step = "mandate_debit";
    baseRate = 0.86;
    currentRate = 0.72;
    zScore = -1.8;
    rootCause = `End-of-month timing deficit on recurring AutoPay debits. Immediate retries will fail.`;
    recommended = `Schedule e-mandate retry sequencer on monthly salary credit window (1st-3rd of month).`;
    alternateRail = "Salary-Cycle Scheduled Retry";
    scope = "RECURRING_DEBIT_TIMING_DEFICIT";
  }

  const incident = {
    id: incId,
    merchant_id: "merchant_razor_01",
    title: incidentTitle,
    status: "OPEN",
    severity: currentRate < 0.5 ? "HIGH" : "MEDIUM",
    started_at: new Date().toISOString(),
    dimensions: { method, issuer: bank, step, reason },
    baseline_success_rate: baseRate,
    current_success_rate: currentRate,
    z_score: zScore,
    affected_count: 3,
    revenue_at_risk_paise: 4890000, // ₹48,900
    root_cause: rootCause,
    recommended_approach: recommended,
    sre_blast_radius: {
      affected_txns: 3,
      affected_customers: 3,
      revenue_at_risk_paise: 4890000,
      degraded_rail: railName,
      incident_scope: scope
    },
    circuit_breaker: {
      status: "TRIPPED",
      suppress_same_rail_retries: true,
      recommended_alternate_rail: alternateRail,
      cooldown_remaining_minutes: 30
    },
    evidence: [
      { key: "Rolling Success Rate", value: `Dropped from ${(baseRate*100).toFixed(0)}% to ${(currentRate*100).toFixed(0)}%` },
      { key: "Statistical Anomaly", value: `${zScore} Z-Score deviation from 5-minute rolling baseline` },
      { key: "Blast Radius Scope", value: `Localized strictly to ${bank} (${method.toUpperCase()})` }
    ]
  };

  const dynamicNames = [
    { name: "Ananya Roy", amount: 4850 },
    { name: "Rahul Sharma", amount: 7200 },
    { name: "Vikram Singh", amount: 12200 }
  ];

  db.addIncident(incident);

  dynamicNames.forEach((cust, idx) => {
    const caseId = `CASE-${Date.now().toString().slice(-3)}${idx}`;
    const newCase = {
      id: caseId,
      incident_id: incident.id,
      merchant_id: "merchant_razor_01",
      provider_payment_id: `pay_${incident.id.toLowerCase()}_${idx + 1}`,
      customer_name: cust.name,
      customer_email: `${cust.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      customer_phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount_paise: cust.amount * 100,
      currency: "INR",
      status: cust.amount >= 20000 ? "APPROVAL_REQUIRED" : "PLANNED",
      eligibility: "ELIGIBLE",
      failure_reason: {
        error_code: "GATEWAY_ERROR",
        error_source: "issuer_bank",
        error_step: step,
        error_reason: reason,
        method: method,
        issuer: bank
      },
      created_at: new Date().toISOString()
    };
    db.addCase(newCase);
    diagnoseAndPlanCase(newCase, incident);
  });

  db.addAuditEvent({
    actor_type: 'system',
    actor_id: 'health_detector_v1',
    action: 'INCIDENT_OPENED',
    correlation_id: incident.id,
    details: `${incident.title} opened. Blast Radius: 3 customers, ₹48,900 at risk. Circuit breaker: TRIPPED.`
  });

  broadcastSSE({ type: 'INCIDENT_DETECTED', data: { incident } });
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  res.json({ incident, casesCount: 3 });
});

// 6b. Reset System to Healthy Baseline
router.post('/demo/reset-healthy', (req, res) => {
  db.data.incidents = (db.data.incidents || []).map(inc => ({
    ...inc,
    status: "RESOLVED",
    current_success_rate: inc.baseline_success_rate || 0.92,
    circuit_breaker: {
      status: "CLOSED",
      suppress_same_rail_retries: false,
      recommended_alternate_rail: "Normal Routing",
      cooldown_remaining_minutes: 0
    }
  }));

  db.addAuditEvent({
    actor_type: 'system',
    actor_id: 'sre_circuit_breaker',
    action: 'RAILS_RESTORED_HEALTHY',
    correlation_id: 'SYSTEM_ALL_RAILS',
    details: 'All payment rails restored to baseline health. Circuit breakers reset to CLOSED.'
  });

  db.save();
  broadcastSSE({ type: 'INCIDENTS_UPDATED', data: db.getIncidents() });
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  res.json({ status: 'RESOLVED', incidents: db.getIncidents() });
});

// 7. Razorpay Verified Webhook Ingress Endpoint
router.post('/webhooks/razorpay', (req, res) => {
  const rawBodyBuffer = req.rawBody ? Buffer.from(req.rawBody) : Buffer.from(JSON.stringify(req.body));
  const result = processIncomingWebhook(req.body, req.headers, rawBodyBuffer);

  broadcastSSE({ type: 'WEBHOOK_PROCESSED', data: result });
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  broadcastSSE({ type: 'AUDIT_UPDATED', data: db.getAuditEvents() });

  res.status(result.statusCode || 200).json(result);
});

// 8. Cryptographic Audit Chain Verification Endpoint
router.get('/audit/verify-chain', (req, res) => {
  const verification = db.verifyAuditChain();
  res.json(verification);
});

// 9. AI Autonomous Diagnosis & Explainable Reasoning Endpoint
router.post('/ai/diagnose', async (req, res) => {
  const { caseId, incidentId } = req.body;
  const caseItem = db.getCaseById(caseId);
  if (!caseItem) return res.status(404).json({ error: `Case ${caseId} not found` });

  const incident = incidentId ? db.getIncidents().find(i => i.id === incidentId) : null;
  const merchant = db.getMerchant();
  const diagnosisPlan = await generateCaseDiagnosisAndPlan(caseItem, incident, merchant?.policy);

  res.json(diagnosisPlan);
});

// 10. AI Omnichannel Tone-Aware Message Generator Endpoint
router.post('/ai/generate-message', async (req, res) => {
  const { channel = 'whatsapp', caseId, discountPct = 0 } = req.body;
  const caseItem = db.getCaseById(caseId);
  if (!caseItem) return res.status(404).json({ error: `Case ${caseId} not found` });

  const messageResult = await generateOmnichannelMessage(channel, caseItem, { discountPct });
  res.json(messageResult);
});

// 11. Customer Privacy Opt-Out (STOP / UNSUBSCRIBE) Endpoint
router.post('/privacy/opt-out', (req, res) => {
  const { phoneOrEmail, caseId } = req.body;
  privacyEngine.recordOptOut(phoneOrEmail);

  if (caseId) {
    const caseObj = db.getCaseById(caseId);
    if (caseObj) {
      db.updateCaseStatus(caseId, 'CANCELLED', {
        stopped_at: new Date().toISOString(),
        stopped_reason: 'CUSTOMER_STOP_KEYWORD_RECEIVED'
      });

      db.addAuditEvent({
        actor_type: 'customer',
        actor_id: phoneOrEmail || 'customer_sms',
        action: 'CUSTOMER_OPTED_OUT_STOPPED',
        correlation_id: caseId,
        details: `Customer ${caseObj.customer_name} sent STOP keyword. Terminal CANCELLED state applied. All future outreach blocked.`
      });
    }
  }

  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  broadcastSSE({ type: 'AUDIT_UPDATED', data: db.getAuditEvents() });
  res.json({ success: true, optedOut: phoneOrEmail, status: 'TERMINAL_STOPPED' });
});

// 12. Standard Web Checkout — Create Order
router.post('/create-order', async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Fail-fast configuration validation
  if (!keyId || !keySecret) {
    const missing = !keyId ? 'RAZORPAY_KEY_ID' : 'RAZORPAY_KEY_SECRET';
    console.error(`Razorpay configuration error: Missing environment variable ${missing}`);
    return res.status(500).json({ error: "payment provider misconfigured" });
  }

  const { caseId, orderId } = req.body;
  const targetId = caseId || orderId || 'CASE-101';
  const caseItem = db.getCaseById(targetId);

  // Compute amount strictly server-side from internal database record
  let amountPaise = 50000; // default 500 INR
  if (caseItem && caseItem.amount_paise) {
    amountPaise = caseItem.amount_paise;
  } else if (req.body.internal_order_id) {
    const fallbackCase = db.getCases().find(c => c.provider_payment_id === req.body.internal_order_id);
    if (fallbackCase) amountPaise = fallbackCase.amount_paise;
  }

  // Validate amount >= 100 paise (smallest currency unit)
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    return res.status(400).json({ error: "Amount must resolve to an integer >= 100 paise" });
  }

  const currency = req.body.currency || 'INR';
  const receipt = `rcpt_${targetId}_${Date.now()}`.substring(0, 40);
  const notes = {
    case_id: targetId,
    customer_name: caseItem?.customer_name || 'Valued Customer'
  };

  const payload = {
    amount: amountPaise,
    currency,
    receipt,
    notes
  };

  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  let attempt = 0;
  const maxRetries = 2;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        console.error("Razorpay 401 Unauthorized: Invalid API credentials configured.");
        return res.status(500).json({ error: "payment provider misconfigured" });
      }

      if (response.status === 400) {
        const errJson = await response.json();
        console.error("Razorpay 400 Bad Request:", errJson?.error?.description);
        return res.status(400).json({ error: errJson?.error?.description || "BAD_REQUEST_ERROR" });
      }

      if (response.ok) {
        const orderData = await response.json();
        if (!orderData.id) {
          console.error("Contract mismatch: Order response missing id");
          return res.status(502).json({ error: "Invalid response from payment provider" });
        }

        // Persist order_id against case
        if (caseItem) {
          db.updateCaseStatus(targetId, caseItem.status, {
            razorpay_order_id: orderData.id,
            active_checkout_amount_paise: orderData.amount
          });
        }

        return res.json({
          order_id: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          key_id: keyId
        });
      }

      // If 5xx or server error, retry with exponential backoff
      if (response.status >= 500 && attempt < maxRetries) {
        attempt++;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 200));
        continue;
      }

      return res.status(503).json({ error: "Payment gateway temporarily unavailable" });
    } catch (networkErr) {
      if (attempt < maxRetries) {
        attempt++;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 200));
        continue;
      }
      console.error("Razorpay network timeout/error:", networkErr.message);
      return res.status(503).json({ error: "Payment gateway network timeout" });
    }
  }
});

// 13. Standard Web Checkout — Verify Payment Signature
router.post('/verify-payment', (req, res) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error("Razorpay configuration error: Missing RAZORPAY_KEY_SECRET");
    return res.status(500).json({ error: "payment provider misconfigured" });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, case_id } = req.body;

  // Validate required fields
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ 
      error: "Missing required verification fields: razorpay_payment_id, razorpay_order_id, and razorpay_signature must all be provided" 
    });
  }

  // Constant-time HMAC-SHA256 signature verification
  try {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(razorpay_signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

    if (!isSignatureValid) {
      console.warn("Payment signature mismatch. Tampered request rejected.");
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (err) {
    return res.status(400).json({ error: "Cryptographic signature validation failed" });
  }

  // Strict Case Correlation: Order must map to an existing recovery case
  const existingCase = db.getCases().find(c => c.razorpay_order_id === razorpay_order_id);

  if (!existingCase) {
    return res.status(409).json({ error: "Order is not mapped to a recovery case" });
  }

  if (existingCase.status === 'RECOVERED') {
    return res.json({
      success: true,
      status: 'PAID',
      already_paid: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });
  }

  db.updateCaseStatus(existingCase.id, 'RECOVERED', {
    provider_payment_id: razorpay_payment_id,
    razorpay_order_id: razorpay_order_id,
    recovered_at: new Date().toISOString(),
    payment_method_used: 'razorpay_standard_checkout',
    attribution: 'RECOVEROPS_STANDARD_CHECKOUT',
    canceled_queued_actions: true
  });

  db.addAuditEvent({
    actor_type: 'customer',
    actor_id: razorpay_payment_id,
    action: 'PAYMENT_CAPTURED_VERIFIED',
    correlation_id: existingCase.id,
    details: `Razorpay Standard Web Checkout payment verified via HMAC signature. Order ${razorpay_order_id}, Payment ${razorpay_payment_id}. Case marked RECOVERED.`
  });

  db.save();
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  broadcastSSE({ type: 'AUDIT_UPDATED', data: db.getAuditEvents() });

  return res.json({
    success: true,
    status: 'PAID',
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id
  });
});

// 14. Standard Web Checkout — Order Status Fallback
router.get('/order-status/:order_id', async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "payment provider misconfigured" });
  }

  const { order_id } = req.params;
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const response = await fetch(`https://api.razorpay.com/v1/orders/${order_id}/payments`, {
      headers: { 'Authorization': authHeader }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Could not fetch order payments" });
    }

    const data = await response.json();
    res.json({
      order_id,
      payments: data.items || []
    });
  } catch (err) {
    res.status(503).json({ error: "Network error checking order status" });
  }
});

// 15. Audit Log Endpoints
router.get('/audit', (req, res) => {
  res.json(db.getAuditEvents());
});

router.get('/audit-events', (req, res) => {
  res.json(db.getAuditEvents());
});

// 16. 2,000-Event Benchmark Evaluator (Batch Measurement)
router.post('/evaluation/run', (req, res) => {
  const { sampleSize = 2000, seed = 20260828 } = req.body;
  const results = runBatchEvaluation(sampleSize, seed);
  broadcastSSE({ type: 'EVALUATION_COMPLETED', data: results });
  res.json(results);
});

// 17. Razorpay Webhook Ingress (Cryptographic HMAC & Idempotency)
router.post('/webhooks/razorpay', (req, res) => {
  const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const result = processIncomingWebhook(req.body, req.headers, rawBodyBuffer);
  
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  broadcastSSE({ type: 'AUDIT_UPDATED', data: db.getAuditEvents() });
  
  res.status(result.statusCode || 200).json(result);
});

// 18. Customer Opt-Out / DND STOP Endpoint
router.post('/customer/opt-out', (req, res) => {
  const { phone, email, reason = 'CUSTOMER_REQUESTED_STOP' } = req.body;
  const target = phone || email;
  if (!target) return res.status(400).json({ error: 'phone or email is required' });

  privacyEngine.recordOptOut(target, reason);

  db.getCases().forEach(c => {
    const isMatch = c.customer_phone === target || c.customer_email === target || c.customer_contact?.phone === target;
    if (isMatch && c.status !== 'RECOVERED') {
      db.updateCaseStatus(c.id, 'OPTED_OUT_PAUSED', {
        opted_out: true,
        opted_out_at: new Date().toISOString(),
        canceled_queued_actions: true
      });
    }
  });

  db.addAuditEvent({
    actor_type: 'customer',
    actor_id: target,
    action: 'CUSTOMER_OPT_OUT_STOP',
    correlation_id: 'privacy_engine',
    details: `Customer opted out (${reason}). All active recovery outreach paused and canceled.`
  });

  db.save();
  broadcastSSE({ type: 'CASES_UPDATED', data: db.getCases() });
  broadcastSSE({ type: 'AUDIT_UPDATED', data: db.getAuditEvents() });
  res.json({ success: true, opted_out: target, status: 'OPTED_OUT_PAUSED' });
});

export default router;
