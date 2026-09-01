import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'data.json');

// Realistic Cohort for HDFC UPI Degradation Incident
const hdfcUpiCohort = [
  {
    id: "CASE-101",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_hdfc_01",
    customer_name: "Ananya Roy",
    customer_email: "ananya.roy@example.com",
    customer_phone: "+919876543210",
    amount_paise: 485000, // ₹4,850
    currency: "INR",
    status: "PLANNED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "GATEWAY_ERROR",
      error_source: "issuer_bank",
      error_step: "payment_authorization",
      error_reason: "gateway_technical_error",
      method: "upi",
      issuer: "HDFC Bank"
    },
    current_plan: {
      diagnosis: "Temporary HDFC UPI auth server timeout.",
      recoverability: { eligible: true, probability: 0.88, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 485000, actionCostPaise: 50, expectedNetValuePaise: 484950 },
      actions: [
        { action: "WAIT", params: { waitMinutes: 15 }, reasonCodes: ["SUPPRESS_SAME_RAIL_DURING_OUTAGE"] },
        { action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["PROVIDE_CLEAN_RECOVERY_SURFACE"] },
        { action: "MESSAGE", params: { channel: "whatsapp", template: "recovery_alt_method" }, reasonCodes: ["INFORM_CUSTOMER_OPTION"] }
      ]
    },
    policy_decision: {
      decision: "ALLOW",
      matched_rules: ["Mode Assist/Auto", "Within quiet hours check", "Max contact limit OK"],
      requires_approval: false
    },
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "CASE-102",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_hdfc_02",
    customer_name: "Rahul Sharma",
    customer_email: "rahul.sharma@example.com",
    customer_phone: "+919812345678",
    amount_paise: 720000, // ₹7,200
    currency: "INR",
    status: "CONTACTED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "GATEWAY_ERROR",
      error_source: "issuer_bank",
      error_step: "payment_authorization",
      error_reason: "gateway_technical_error",
      method: "upi",
      issuer: "HDFC Bank"
    },
    current_plan: {
      diagnosis: "HDFC UPI partner PSP degradation.",
      recoverability: { eligible: true, probability: 0.82, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 720000, actionCostPaise: 50, expectedNetValuePaise: 719950 },
      actions: [
        { action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["REROUTE_HEALTHY_RAIL"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["INSTANT_CHECKOUT_RESUME"] },
        { action: "MESSAGE", params: { channel: "whatsapp", template: "payment_help" }, reasonCodes: ["FRIENDLY_NUDGE"] }
      ]
    },
    policy_decision: {
      decision: "ALLOW",
      matched_rules: ["Standard auto-execution allowed"],
      requires_approval: false
    },
    created_at: new Date(Date.now() - 2400000).toISOString()
  },
  {
    id: "CASE-103",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_hdfc_03",
    customer_name: "Priya Patel",
    customer_email: "priya.p@example.com",
    customer_phone: "+919898989898",
    amount_paise: 2850000, // ₹28,500
    currency: "INR",
    status: "APPROVAL_REQUIRED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "GATEWAY_ERROR",
      error_source: "issuer_bank",
      error_step: "payment_authorization",
      error_reason: "gateway_technical_error",
      method: "upi",
      issuer: "HDFC Bank"
    },
    current_plan: {
      diagnosis: "High-value transaction during HDFC UPI partner degradation.",
      recoverability: { eligible: true, probability: 0.95, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 2850000, actionCostPaise: 500, expectedNetValuePaise: 2849500 },
      actions: [
        { action: "HUMAN_ESCALATION", params: { reason: "High-value transaction >= ₹25,000 threshold" }, reasonCodes: ["MONEY_SAFETY_FLOOR"] },
        { action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 180 }, reasonCodes: ["MANAGER_APPROVED_LINK"] }
      ]
    },
    policy_decision: {
      decision: "REVIEW",
      matched_rules: ["HIGH_VALUE_THRESHOLD (28500 >= ₹25,000)"],
      requires_approval: true,
      reason: "High-value transaction requires explicit human manager approval before dispatching recovery link."
    },
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "CASE-104",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_hdfc_04",
    customer_name: "Sneha Mehta",
    customer_email: "sneha.m@example.com",
    customer_phone: "+919877766554",
    amount_paise: 649900, // ₹6,499
    currency: "INR",
    status: "CONTACTED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "BAD_REQUEST_ERROR",
      error_source: "customer",
      error_step: "payment_authorization",
      error_reason: "payment_cancelled_by_user",
      method: "upi",
      issuer: "HDFC Bank"
    },
    current_plan: {
      diagnosis: "Customer abandoned checkout due to friction during bank timeout.",
      recoverability: { eligible: true, probability: 0.78, confidenceBand: "MEDIUM" },
      expectedEconomics: { grossRecoveryValuePaise: 649900, actionCostPaise: 19500, expectedNetValuePaise: 630400 },
      actions: [
        { action: "MESSAGE", params: { channel: "whatsapp", template: "cart_recovery_discount" }, reasonCodes: ["RE_ENGAGE_CUSTOMER"] },
        { action: "INCENTIVE", params: { discountPct: 3 }, reasonCodes: ["APPLY_AUTHORIZED_DYNAMIC_DISCOUNT"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["CHECKOUT_RESUME_LINK"] }
      ]
    },
    policy_decision: {
      decision: "ALLOW",
      matched_rules: ["3% discount within 5% ceiling", "Quiet hours OK"],
      requires_approval: false
    },
    created_at: new Date(Date.now() - 4800000).toISOString()
  },
  {
    id: "CASE-105",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_hdfc_05",
    customer_name: "Vikram Singh",
    customer_email: "vikram.s@example.com",
    customer_phone: "+919866655443",
    amount_paise: 1220000, // ₹12,200
    currency: "INR",
    status: "PLANNED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "GATEWAY_ERROR",
      error_source: "issuer_bank",
      error_step: "payment_authorization",
      error_reason: "gateway_technical_error",
      method: "upi",
      issuer: "HDFC Bank"
    },
    current_plan: {
      diagnosis: "HDFC UPI partner PSP degradation.",
      recoverability: { eligible: true, probability: 0.85, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 1220000, actionCostPaise: 50, expectedNetValuePaise: 1219950 },
      actions: [
        { action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 120 }, reasonCodes: ["SEND_RECOVERY_PAYMENT_LINK"] }
      ]
    },
    policy_decision: {
      decision: "ALLOW",
      matched_rules: ["Standard auto-execution allowed"],
      requires_approval: false
    },
    created_at: new Date(Date.now() - 5400000).toISOString()
  }
];

// Initial dataset with 3 distinct active incidents & non-repetitive cohorts
const initialData = {
  merchant: {
    id: "merchant_razor_01",
    name: "Revive Merchant Store",
    mode: "ASSIST", // OBSERVE | ASSIST | AUTOPILOT
    killSwitch: false,
    policy: {
      mode: "ASSIST",
      actions: {
        WAIT: "AUTO",
        RETRY: "AUTO",
        SWITCH_METHOD: "AUTO",
        CREATE_LINK: "AUTO",
        MESSAGE: "AUTO",
        INCENTIVE: "CONDITIONAL",
        HUMAN_ESCALATION: "REQUIRE_APPROVAL"
      },
      money: {
        maxAutoDiscountPct: 2,
        maxDiscountPct: 5,
        highValueApprovalPaise: 2500000, // ₹25,000
        monthlyIncentiveBudgetPaise: 5000000, // ₹50,000
        minGrossMarginPct: 18
      },
      confidence: {
        approvalBelow: 0.60,
        recommendOnlyBelow: 0.40
      },
      contact: {
        maxContacts: 3,
        minGapMinutes: 45,
        quietHours: { start: "22:00", end: "08:00" }
      },
      retry: { maxAttempts: 3 },
      risk: { fraudFlag: "STOP" }
    }
  },
  payments: [],
  paymentAttempts: [],
  webhookInbox: [],
  healthBuckets: [],
  incidents: [
    {
      id: "INC-901",
      merchant_id: "merchant_razor_01",
      title: "HDFC Bank UPI Authorization Degradation",
      status: "OPEN",
      severity: "HIGH",
      started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      dimensions: { method: "upi", issuer: "HDFC Bank", step: "authorization", reason: "gateway_technical_error" },
      baseline_success_rate: 0.88,
      current_success_rate: 0.38,
      z_score: -4.2,
      affected_count: 5,
      revenue_at_risk_paise: 5924900, // ₹59,249 total cohort
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
    },
    {
      id: "INC-902",
      merchant_id: "merchant_razor_01",
      title: "ICICI Card 3DS Authentication Timeout",
      status: "OPEN",
      severity: "MEDIUM",
      started_at: new Date(Date.now() - 3600000 * 4).toISOString(),
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
    },
    {
      id: "INC-904",
      merchant_id: "merchant_razor_01",
      title: "SBI AutoPay e-Mandate Balance Deficit",
      status: "OPEN",
      severity: "LOW",
      started_at: new Date(Date.now() - 3600000 * 12).toISOString(),
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
    }
  ],
  recoveryCases: [
    ...hdfcUpiCohort
  ],
  actionExecutions: [],
  auditEvents: [
    {
      id: "AUDIT-001",
      merchant_id: "merchant_razor_01",
      actor_type: "system",
      actor_id: "health_detector_v1",
      action: "INCIDENT_OPENED",
      correlation_id: "INC-901",
      details: "HDFC Bank UPI Success Rate dropped below -2.5 Z-score (88% -> 38%). Revenue at risk: ₹59,249.",
      occurred_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "AUDIT-002",
      merchant_id: "merchant_razor_01",
      actor_type: "model",
      actor_id: "recovery_planner_v1",
      action: "PLAN_PROPOSED",
      correlation_id: "CASE-101",
      details: "Proposed plan for Ananya Roy (₹4,850): WAIT 15m -> SWITCH_METHOD -> CREATE_LINK. Expected Net: ₹4,849.50.",
      occurred_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "AUDIT-003",
      merchant_id: "merchant_razor_01",
      actor_type: "system",
      actor_id: "policy_engine_v1",
      action: "POLICY_EVALUATED",
      correlation_id: "CASE-103",
      details: "Policy Evaluation for Priya Patel (₹28,500): REVIEW required. High-value floor trigger.",
      occurred_at: new Date(Date.now() - 1790000).toISOString()
    }
  ],
  strategyLearnings: [
    {
      id: "FB-001",
      case_id: "CASE-102",
      strategy_used: "SWITCH_PAYMENT_METHOD",
      payment_rail_used: "card",
      recovered_amount_paise: 720000,
      intervention_cost_paise: 50,
      time_to_recover_seconds: 48,
      prior_confidence: 0.88,
      posterior_confidence: 0.912,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  batchRuns: []
};

// In-memory DB with JSON persistence file
class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);

        // Deduplicate incidents strictly by title / rail
        if (parsed.incidents) {
          const uniqueIncidentsMap = new Map();
          parsed.incidents.forEach(inc => {
            const key = inc.title || inc.id;
            if (!uniqueIncidentsMap.has(key)) {
              uniqueIncidentsMap.set(key, inc);
            }
          });
          parsed.incidents = Array.from(uniqueIncidentsMap.values());
        }

        // Deduplicate recovery cases by ID
        if (parsed.recoveryCases) {
          const uniqueCasesMap = new Map();
          parsed.recoveryCases.forEach(c => {
            if (!uniqueCasesMap.has(c.id)) {
              uniqueCasesMap.set(c.id, c);
            }
          });
          parsed.recoveryCases = Array.from(uniqueCasesMap.values());
        }

        return parsed;
      }
    } catch (err) {
      console.warn("Could not read DB_FILE, resetting to fresh default cohort state:", err.message);
    }
    this.save(initialData);
    return initialData;
  }

  save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error("Error saving database file:", err.message);
    }
  }

  getMerchant() { return this.data.merchant; }
  updateMerchantPolicy(policy) {
    this.data.merchant.policy = {
      ...this.data.merchant.policy,
      ...policy,
      money: {
        maxAutoDiscountPct: 2,
        maxDiscountPct: 5,
        highValueApprovalPaise: 2500000,
        monthlyIncentiveBudgetPaise: 5000000,
        minGrossMarginPct: 18,
        ...this.data.merchant.policy?.money,
        ...policy?.money
      },
      contact: {
        maxContacts: 3,
        minGapMinutes: 45,
        quietHours: { start: "22:00", end: "08:00" },
        ...this.data.merchant.policy?.contact,
        ...policy?.contact
      },
      retry: {
        maxAttempts: 3,
        ...this.data.merchant.policy?.retry,
        ...policy?.retry
      }
    };
    this.data.merchant.mode = policy.mode || this.data.merchant.mode;
    this.save();
    return this.data.merchant;
  }
  setKillSwitch(enabled) {
    this.data.merchant.killSwitch = enabled;
    this.save();
    return this.data.merchant;
  }

  getIncidents() { return this.data.incidents; }
  addIncident(incident) {
    // Strictly update existing incident by ID or Title
    const existingIndex = this.data.incidents.findIndex(i => i.id === incident.id || i.title === incident.title);
    if (existingIndex >= 0) {
      this.data.incidents[existingIndex] = { ...this.data.incidents[existingIndex], ...incident };
    } else {
      this.data.incidents.unshift(incident);
    }
    this.save();
    return incident;
  }

  getCases() { return this.data.recoveryCases; }
  getCaseById(id) { return this.data.recoveryCases.find(c => c.id === id); }
  addCase(caseItem) {
    const existingIndex = this.data.recoveryCases.findIndex(c => c.id === caseItem.id);
    if (existingIndex >= 0) {
      this.data.recoveryCases[existingIndex] = { ...this.data.recoveryCases[existingIndex], ...caseItem };
    } else {
      this.data.recoveryCases.unshift(caseItem);
    }
    this.save();
    return caseItem;
  }

  updateCaseStatus(id, status, extra = {}) {
    const caseObj = this.getCaseById(id);
    if (caseObj) {
      caseObj.status = status;
      Object.assign(caseObj, extra);
      this.save();
    }
    return caseObj;
  }

  getAuditEvents() { return this.data.auditEvents; }
  addAuditEvent(event) {
    const fullEvent = {
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      merchant_id: "merchant_razor_01",
      occurred_at: new Date().toISOString(),
      ...event
    };
    this.data.auditEvents.unshift(fullEvent);
    if (this.data.auditEvents.length > 100) this.data.auditEvents.pop();
    this.save();
    return fullEvent;
  }

  getBatchRuns() { return this.data.batchRuns || []; }
  addBatchRun(batch) {
    if (!this.data.batchRuns) this.data.batchRuns = [];
    this.data.batchRuns.unshift(batch);
    this.save();
    return batch;
  }
}

export const db = new Database();
