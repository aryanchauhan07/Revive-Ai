import express from 'express';
import { db } from '../db/database.js';
import { diagnoseAndPlanCase } from '../core/recoveryPlanner.js';
import { executeCaseAction } from '../core/actionExecutor.js';
import { runBatchEvaluation } from '../simulation/batchSimulator.js';
import { evaluatePlanPolicies } from '../core/policyEngine.js';

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
  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'merchant_admin',
    action: 'POLICY_UPDATED',
    correlation_id: 'merchant_razor_01',
    details: `Updated policy: Mode=${updated.mode}, MaxDiscount=${updated.policy?.money?.maxDiscountPct}%, HighValueFloor=₹${updated.policy?.money?.highValueApprovalPaise / 100}`
  });
  broadcastSSE({ type: 'MERCHANT_POLICY_UPDATED', data: updated });
  res.json(updated);
});

router.post('/merchant/kill-switch', (req, res) => {
  const { enabled } = req.body;
  const updated = db.setKillSwitch(enabled);
  db.addAuditEvent({
    actor_type: 'user',
    actor_id: 'merchant_admin',
    action: enabled ? 'KILL_SWITCH_ENGAGED' : 'KILL_SWITCH_DISENGAGED',
    correlation_id: 'merchant_razor_01',
    details: enabled ? 'Emergency kill switch ACTIVATED. All side-effect actions paused.' : 'Emergency kill switch deactivated. Normal execution resumed.'
  });
  broadcastSSE({ type: 'KILL_SWITCH_CHANGED', data: { killSwitch: enabled } });
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

// 6. Demo Trigger Generators (Generates Clean, Distinct Scenarios with Realistic Cohorts)
router.post('/demo/trigger-incident', (req, res) => {
  const { bank = "HDFC Bank", method = "upi" } = req.body;

  let incident = {};
  let demoCohort = [];

  if (bank === "ICICI Bank" || method === "card") {
    // Scenario 2: ICICI Card 3DS Timeout
    incident = {
      id: "INC-902",
      merchant_id: "merchant_razor_01",
      title: "ICICI Card 3DS Authentication Timeout",
      status: "OPEN",
      severity: "MEDIUM",
      started_at: new Date().toISOString(),
      dimensions: { method: "card", issuer: "ICICI Bank", step: "authentication", reason: "otp_timeout" },
      baseline_success_rate: 0.92,
      current_success_rate: 0.68,
      z_score: -2.7,
      affected_count: 3,
      revenue_at_risk_paise: 4730000, // ₹47,300
      root_cause: "ICICI 3DS OTP delivery delay (+45s average) causing checkout abandonment.",
      recommended_approach: "Bypass 3DS retry; dispatch instant UPI QR 1-click payment link.",
      sre_blast_radius: {
        affected_txns: 3,
        affected_customers: 3,
        revenue_at_risk_paise: 4730000,
        degraded_rail: "ICICI Credit Cards",
        incident_scope: "GATEWAY_LATENCY_ANOMALY"
      },
      circuit_breaker: {
        status: "WATCH",
        suppress_same_rail_retries: false,
        recommended_alternate_rail: "UPI Instant QR",
        cooldown_remaining_minutes: 10
      },
      evidence: [
        { key: "OTP Delay Spike", value: "+45s average OTP latency from gateway" },
        { key: "User Abandonment", value: "68% drop-off post-OTP challenge screen" },
        { key: "Rail Concentration", value: "95% localized to ICICI Visa/Mastercard 3DS" }
      ]
    };

    demoCohort = [
      { id: "CASE-201", name: "Rohan Kapoor", phone: "+919811122233", amount: 14500, reason: "otp_timeout_expired", method: "card", issuer: "ICICI Bank" },
      { id: "CASE-202", name: "Meera Nair", phone: "+919822233344", amount: 8900, reason: "card_auth_failed", method: "card", issuer: "ICICI Bank" },
      { id: "CASE-203", name: "Aditya Verma", phone: "+919833344455", amount: 23900, reason: "gateway_timeout", method: "card", issuer: "ICICI Bank" }
    ];
  } else if (bank === "SBI Bank" || method === "mandate") {
    // Scenario 3: SBI AutoPay e-Mandate Balance Deficit
    incident = {
      id: "INC-904",
      merchant_id: "merchant_razor_01",
      title: "SBI AutoPay e-Mandate Balance Deficit",
      status: "OPEN",
      severity: "LOW",
      started_at: new Date().toISOString(),
      dimensions: { method: "mandate", issuer: "SBI Bank", step: "debit", reason: "insufficient_funds" },
      baseline_success_rate: 0.86,
      current_success_rate: 0.72,
      z_score: -1.8,
      affected_count: 2,
      revenue_at_risk_paise: 2130000, // ₹21,300
      root_cause: "End-of-month recurring AutoPay deficit. Immediate retries will fail.",
      recommended_approach: "Schedule e-mandate retry window on salary cycle day (1st-3rd of month).",
      sre_blast_radius: {
        affected_txns: 2,
        affected_customers: 2,
        revenue_at_risk_paise: 2130000,
        degraded_rail: "SBI AutoPay e-Mandate",
        incident_scope: "RECURRING_DEBIT_TIMING_DEFICIT"
      },
      circuit_breaker: {
        status: "ACTIVE",
        suppress_same_rail_retries: true,
        recommended_alternate_rail: "Salary-Day Scheduled Retry",
        cooldown_remaining_minutes: 1440
      },
      evidence: [
        { key: "Debit Failure Code", value: "INSUFFICIENT_FUNDS on recurring debit attempt" },
        { key: "Timing Analysis", value: "End-of-month timing deficit (28th-30th)" }
      ]
    };

    demoCohort = [
      { id: "CASE-401", name: "Karan Malhotra", phone: "+919844455566", amount: 12400, reason: "insufficient_funds", method: "mandate", issuer: "SBI Bank" },
      { id: "CASE-402", name: "Divya Joshi", phone: "+919855566677", amount: 8900, reason: "insufficient_funds", method: "mandate", issuer: "SBI Bank" }
    ];
  } else {
    // Scenario 1: HDFC Bank UPI Degradation
    incident = {
      id: "INC-901",
      merchant_id: "merchant_razor_01",
      title: "HDFC Bank UPI Authorization Degradation",
      status: "OPEN",
      severity: "HIGH",
      started_at: new Date().toISOString(),
      dimensions: { method: "upi", issuer: "HDFC Bank", step: "authorization", reason: "gateway_technical_error" },
      baseline_success_rate: 0.88,
      current_success_rate: 0.38,
      z_score: -4.2,
      affected_count: 5,
      revenue_at_risk_paise: 5924900, // ₹59,249
      root_cause: "HDFC UPI partner gateway timeouts detected. Direct retries failing at 84%.",
      recommended_approach: "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp.",
      sre_blast_radius: {
        affected_txns: 5,
        affected_customers: 5,
        revenue_at_risk_paise: 5924900,
        degraded_rail: "HDFC Bank UPI",
        incident_scope: "SYSTEMIC_ISSUER_OUTAGE"
      },
      circuit_breaker: {
        status: "TRIPPED",
        suppress_same_rail_retries: true,
        recommended_alternate_rail: "Cards & Netbanking",
        cooldown_remaining_minutes: 15
      },
      evidence: [
        { key: "Rolling Success Rate", value: "88% -> 38% (Z-score -4.2)" },
        { key: "Razorpay Downtime Match", value: "Status API corroborates HDFC Bank PSP downtime" },
        { key: "Method Concentration", value: "92% of failures localized to UPI rail" }
      ]
    };

    demoCohort = [
      { id: "CASE-101", name: "Ananya Roy", phone: "+919876543210", amount: 4850, reason: "gateway_technical_error", method: "upi", issuer: "HDFC Bank" },
      { id: "CASE-102", name: "Rahul Sharma", phone: "+919812345678", amount: 7200, reason: "gateway_technical_error", method: "upi", issuer: "HDFC Bank" },
      { id: "CASE-103", name: "Priya Patel", phone: "+919898989898", amount: 28500, reason: "gateway_technical_error", method: "upi", issuer: "HDFC Bank" },
      { id: "CASE-104", name: "Sneha Mehta", phone: "+919877766554", amount: 6499, reason: "payment_cancelled_by_user", method: "upi", issuer: "HDFC Bank" },
      { id: "CASE-105", name: "Vikram Singh", phone: "+919866655443", amount: 12200, reason: "gateway_technical_error", method: "upi", issuer: "HDFC Bank" }
    ];
  }

  // Update or insert incident
  db.addIncident(incident);

  // Upsert distinct cases
  demoCohort.forEach((cust, idx) => {
    const newCase = {
      id: cust.id,
      incident_id: incident.id,
      merchant_id: "merchant_razor_01",
      provider_payment_id: `pay_${incident.id.toLowerCase()}_${idx + 1}`,
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
        method: cust.method,
        issuer: cust.issuer
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
    details: `${incident.title} opened. Blast Radius: ${incident.sre_blast_radius.affected_customers} customers, ₹${(incident.revenue_at_risk_paise / 100).toLocaleString()} at risk. Circuit breaker: ${incident.circuit_breaker.status}.`
  });

  broadcastSSE({ type: 'INCIDENT_DETECTED', data: { incident } });
  res.json({ incident, casesCount: demoCohort.length });
});

// 7. Audit Log Endpoint
router.get('/audit', (req, res) => {
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
