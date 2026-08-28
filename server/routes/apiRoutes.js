import express from 'express';
import { db } from '../db/database.js';
import { processIncomingWebhook } from '../core/webhookIngress.js';
import { diagnoseAndPlanCase } from '../core/recoveryPlanner.js';
import { executeCaseAction } from '../core/actionExecutor.js';
import { runBatchEvaluation } from '../simulation/batchSimulator.js';

const router = express.Router();

// SSE Clients for live audit stream
const sseClients = new Set();

export function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// 1. Webhook Ingestion Endpoint
router.post('/webhooks/razorpay', (req, res) => {
  const result = processIncomingWebhook(req.body, req.headers);
  broadcastSSE({ type: 'WEBHOOK_RECEIVED', data: result });
  res.status(200).json(result);
});

// 2. Merchant & Policy Management
router.get('/merchant', (req, res) => {
  res.json(db.getMerchant());
});

router.post('/merchant/policy', (req, res) => {
  const updated = db.updateMerchantPolicy(req.body);
  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'merchant_admin',
    action: 'POLICY_UPDATED',
    correlation_id: updated.id,
    details: `Updated autonomy mode to ${updated.mode}. Updated quiet hours and discount caps.`
  });
  broadcastSSE({ type: 'POLICY_UPDATED', data: updated });
  res.json(updated);
});

router.post('/merchant/kill-switch', (req, res) => {
  const { enabled } = req.body;
  const updated = db.setKillSwitch(enabled);
  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'merchant_admin',
    action: 'KILL_SWITCH_TOGGLED',
    correlation_id: updated.id,
    details: `Emergency Kill Switch ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}`
  });
  broadcastSSE({ type: 'KILL_SWITCH_TOGGLED', data: updated });
  res.json(updated);
});

// 3. Incidents
router.get('/incidents', (req, res) => {
  res.json(db.getIncidents());
});

// 4. Cases
router.get('/cases', (req, res) => {
  res.json(db.getCases());
});

router.get('/cases/:id', (req, res) => {
  const caseObj = db.getCaseById(req.params.id);
  if (!caseObj) return res.status(404).json({ error: 'Case not found' });
  res.json(caseObj);
});

router.post('/cases/:id/execute', async (req, res) => {
  try {
    const { action, reviewerId } = req.body;
    const caseObj = db.getCaseById(req.params.id);
    if (!caseObj) return res.status(404).json({ error: 'Case not found' });

    const actionToExec = action || caseObj.current_plan?.actions[0] || { action: 'CREATE_LINK' };
    const result = await executeCaseAction(caseObj.id, actionToExec, reviewerId);
    
    broadcastSSE({ type: 'ACTION_EXECUTED', data: result });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Demo Trigger Generators (Generates 1 Incident -> Cohort of 5 Different Customers)
router.post('/demo/trigger-incident', (req, res) => {
  const { bank = "HDFC Bank", method = "upi" } = req.body;

  const incident = {
    id: "INC-901",
    merchant_id: "merchant_razor_01",
    title: `${bank} ${method.toUpperCase()} Authorization Degradation`,
    status: "OPEN",
    severity: "HIGH",
    started_at: new Date().toISOString(),
    dimensions: { method, issuer: bank, step: "authorization", reason: "gateway_technical_error" },
    baseline_success_rate: 0.88,
    current_success_rate: 0.38,
    z_score: -4.2,
    affected_count: 5,
    revenue_at_risk_paise: 5924900, // ₹59,249
    root_cause: `${bank} ${method.toUpperCase()} partner gateway timeouts detected. Direct retries failing at 84%.`,
    recommended_approach: "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp.",
    evidence: [
      { key: "Rolling Success Rate", value: "88% -> 38% Z-score -4.2" },
      { key: "Razorpay Downtime Match", value: `Status API corroborates ${bank} PSP downtime` },
      { key: "Method Concentration", value: `92% of failures localized to ${method.toUpperCase()} rail` }
    ]
  };

  db.addIncident(incident);

  // Realistic cohort of different customers with distinct recovery plans
  const demoCohort = [
    { name: "Ananya Roy", phone: "+919876543210", amount: 4850, reason: "gateway_technical_error" },
    { name: "Rahul Sharma", phone: "+919812345678", amount: 7200, reason: "gateway_technical_error" },
    { name: "Priya Patel", phone: "+919898989898", amount: 28500, reason: "gateway_technical_error" },
    { name: "Sneha Mehta", phone: "+919877766554", amount: 6499, reason: "payment_cancelled_by_user" },
    { name: "Vikram Singh", phone: "+919866655443", amount: 12200, reason: "gateway_technical_error" }
  ];

  demoCohort.forEach((cust, idx) => {
    const caseId = `CASE-10${idx + 1}`;
    const newCase = {
      id: caseId,
      incident_id: incident.id,
      merchant_id: "merchant_razor_01",
      provider_payment_id: `pay_demo_${Date.now()}_${idx}`,
      customer_name: cust.name,
      customer_email: `${cust.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      customer_phone: cust.phone,
      amount_paise: cust.amount * 100,
      currency: "INR",
      status: cust.amount >= 25000 ? "APPROVAL_REQUIRED" : "PLANNED",
      eligibility: "ELIGIBLE",
      failure_reason: {
        error_code: cust.reason === 'payment_cancelled_by_user' ? 'BAD_REQUEST_ERROR' : 'GATEWAY_ERROR',
        error_source: cust.reason === 'payment_cancelled_by_user' ? 'customer' : 'issuer_bank',
        error_step: 'payment_authorization',
        error_reason: cust.reason,
        method,
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
    details: `Simulated ${bank} ${method.toUpperCase()} degradation. 5 affected customer cases ingested.`
  });

  broadcastSSE({ type: 'INCIDENT_OPENED', data: incident });
  res.json(incident);
});

router.post('/demo/trigger-payment-failure', (req, res) => {
  const {
    customerName = "Ananya Roy",
    customerPhone = "+919876543210",
    amountRupees = 4850,
    reason = "gateway_technical_error",
    method = "upi",
    bank = "HDFC Bank"
  } = req.body;

  const openIncident = db.getIncidents().find(i => i.status === 'OPEN');

  const newCase = {
    id: `CASE-${Math.floor(Math.random() * 9000) + 1000}`,
    incident_id: openIncident ? openIncident.id : null,
    merchant_id: "merchant_razor_01",
    provider_payment_id: `pay_demo_${Date.now()}`,
    customer_name: customerName,
    customer_email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    customer_phone: customerPhone,
    amount_paise: amountRupees * 100,
    currency: "INR",
    status: "PLANNED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: reason === 'payment_cancelled_by_user' ? 'BAD_REQUEST_ERROR' : 'GATEWAY_ERROR',
      error_source: reason === 'payment_cancelled_by_user' ? 'customer' : 'issuer_bank',
      error_step: 'payment_authorization',
      error_reason: reason,
      method,
      issuer: bank
    },
    created_at: new Date().toISOString()
  };

  db.addCase(newCase);
  const plannedCase = diagnoseAndPlanCase(newCase, openIncident);
  broadcastSSE({ type: 'CASE_CREATED', data: plannedCase });
  res.json(plannedCase);
});

// 6. Audit & SSE Stream
router.get('/audit', (req, res) => {
  res.json(db.getAuditEvents());
});

router.get('/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 7. Batch Evaluation Benchmark
router.post('/evaluation/run', (req, res) => {
  const { batchSize = 2000 } = req.body;
  const result = runBatchEvaluation(batchSize);
  broadcastSSE({ type: 'BATCH_EVALUATION_COMPLETED', data: result });
  res.json(result);
});

router.get('/evaluation/history', (req, res) => {
  res.json(db.getBatchRuns());
});

export default router;
