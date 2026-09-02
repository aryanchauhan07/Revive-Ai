import express from 'express';
import { db } from '../db/database.js';
import { diagnoseAndPlanCase } from '../core/recoveryPlanner.js';
import { executeCaseAction } from '../core/actionExecutor.js';
import { runBatchEvaluation } from '../simulation/batchSimulator.js';
import { evaluatePlanPolicies, reEvaluateAllCasesPolicy } from '../core/policyEngine.js';

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

// 7. Audit Log Endpoint
router.get('/audit', (req, res) => {
  res.json(db.getAuditEvents());
});

router.get('/audit-events', (req, res) => {
  res.json(db.getAuditEvents());
});

// 8. 2,000-Event Benchmark Evaluator
router.post('/evaluation/run', (req, res) => {
  const { sampleSize = 2000 } = req.body;
  const results = runBatchEvaluation(sampleSize);
  broadcastSSE({ type: 'EVALUATION_COMPLETED', data: results });
  res.json(results);
});

export default router;
