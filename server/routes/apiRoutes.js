import express from 'express';
import { db } from '../db/database.js';
import { processIncomingWebhook } from '../core/webhookIngress.js';
import { diagnoseAndPlanCase } from '../core/recoveryPlanner.js';
import { executeCaseAction } from '../core/actionExecutor.js';
import { runBatchEvaluation } from '../simulation/batchSimulator.js';
import { SCENARIO_LIBRARY, runScenarioSimulation } from '../simulation/scenarioLibrary.js';

const router = express.Router();

// SSE Clients for live audit stream
const sseClients = new Set();

export function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// 1. Webhook Ingestion Endpoint (with Raw Body HMAC Verification)
router.post('/webhooks/razorpay', (req, res) => {
  const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const result = processIncomingWebhook(req.body, req.headers, rawBodyBuffer);
  broadcastSSE({ type: 'WEBHOOK_RECEIVED', data: result });
  res.status(result.statusCode || 200).json(result);
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

// 5. Scenarios & Real-World Library
router.get('/scenarios', (req, res) => {
  res.json(SCENARIO_LIBRARY);
});

router.post('/scenarios/:id/run', (req, res) => {
  const scenario = runScenarioSimulation(req.params.id);
  broadcastSSE({ type: 'SCENARIO_RUN', data: scenario });
  res.json(scenario);
});

// 6. Demo Trigger Generators (Generates 1 Incident with SRE Blast Radius & Recovery Circuit Breaker)
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
    sre_blast_radius: {
      affected_txns: 5,
      affected_customers: 5,
      revenue_at_risk_paise: 5924900,
      degraded_rail: `${bank} ${method.toUpperCase()}`,
      incident_scope: "SYSTEMIC_ISSUER_OUTAGE" // vs "ISOLATED_CUSTOMER_FAILURE"
    },
    circuit_breaker: {
      status: "TRIPPED",
      suppress_same_rail_retries: true,
      recommended_alternate_rail: "Cards & Netbanking",
      cooldown_remaining_minutes: 15
    },
    evidence: [
      { key: "Rolling Success Rate", value: "88% -> 38% Z-score -4.2" },
      { key: "Razorpay Downtime Match", value: `Status API corroborates ${bank} PSP downtime` },
      { key: "Method Concentration", value: `92% of failures localized to ${method.toUpperCase()} rail` }
    ]
  };

  db.addIncident(incident);

  // Realistic cohort of 5 distinct customers
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
    actor_id: 'payment_sre_engine',
    action: 'INCIDENT_OPENED_CIRCUIT_TRIPPED',
    correlation_id: incident.id,
    details: `SRE Outage Detected: ${bank} ${method.toUpperCase()}. Blast Radius: 5 customers, ₹59,249 at risk. Circuit Breaker TRIPPED: Same-rail retries paused.`
  });

  broadcastSSE({ type: 'INCIDENT_OPENED', data: incident });
  res.json(incident);
});

// 7. Audit & SSE Stream
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

// 8. Batch Evaluation Benchmark with Incremental Attribution
router.post('/evaluation/run', (req, res) => {
  const { batchSize = 2000, seed = 20260828 } = req.body;
  const result = runBatchEvaluation(batchSize, seed);
  broadcastSSE({ type: 'BATCH_EVALUATION_COMPLETED', data: result });
  res.json(result);
});

router.get('/evaluation/history', (req, res) => {
  res.json(db.getBatchRuns());
});

export default router;
