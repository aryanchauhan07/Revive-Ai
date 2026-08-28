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
    provider_payment_id: "pay_N8x29f9A0k1",
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
    provider_payment_id: "pay_N8x33k9A2b4",
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
    provider_payment_id: "pay_N8x99k1P9a3",
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
      diagnosis: "High-value enterprise order failed on degraded UPI rail.",
      recoverability: { eligible: true, probability: 0.75, confidenceBand: "MEDIUM" },
      expectedEconomics: { grossRecoveryValuePaise: 2850000, actionCostPaise: 100, expectedNetValuePaise: 2849900 },
      actions: [
        { action: "HUMAN_ESCALATION", params: { reason: "Order amount ₹28,500 >= ₹25,000 threshold requires manager review" }, reasonCodes: ["POLICY_HIGH_VALUE_FLOOR"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 1440 }, reasonCodes: ["PREPARE_RECOVERY_LINK"] }
      ]
    },
    policy_decision: {
      decision: "REVIEW",
      matched_rules: ["Order value >= ₹25,000 threshold triggered"],
      requires_approval: true
    },
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "CASE-104",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_N8x44m7K1x8",
    customer_name: "Sneha Mehta",
    customer_email: "sneha.m@example.com",
    customer_phone: "+919877766554",
    amount_paise: 649900, // ₹6,499
    currency: "INR",
    status: "PLANNED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "BAD_REQUEST_ERROR",
      error_source: "customer",
      error_step: "payment_authentication",
      error_reason: "payment_cancelled_by_user",
      method: "upi",
      issuer: "HDFC Bank"
    },
    current_plan: {
      diagnosis: "Checkout drop-off post authentication delay.",
      recoverability: { eligible: true, probability: 0.70, confidenceBand: "MEDIUM" },
      expectedEconomics: { grossRecoveryValuePaise: 649900, actionCostPaise: 19500, expectedNetValuePaise: 630400 },
      actions: [
        { action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["RESUME_CHECKOUT"] },
        { action: "INCENTIVE", params: { discountPct: 3, code: "REVIVE3" }, reasonCodes: ["HIGH_INTENT_CART_NUDGE"] },
        { action: "MESSAGE", params: { channel: "whatsapp", template: "cart_recovery" }, reasonCodes: ["DISCOUNT_OUTREACH"] }
      ]
    },
    policy_decision: {
      decision: "ALLOW",
      matched_rules: ["Discount 3% <= 5% cap"],
      requires_approval: false
    },
    created_at: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: "CASE-105",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_N8x55p2Q9z1",
    customer_name: "Vikram Singh",
    customer_email: "vikram.s@example.com",
    customer_phone: "+919866655443",
    amount_paise: 1220000, // ₹12,200
    currency: "INR",
    status: "RECOVERED",
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
      diagnosis: "UPI rail timeout recovered via card payment link.",
      recoverability: { eligible: true, probability: 1.0, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 1220000, actionCostPaise: 50, expectedNetValuePaise: 1219950 },
      actions: [
        { action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["RECOVERY_LINK"] },
        { action: "MESSAGE", params: { channel: "whatsapp", template: "payment_help" }, reasonCodes: ["OUTREACH"] }
      ]
    },
    policy_decision: {
      decision: "ALLOW",
      matched_rules: ["Auto-execution passed"],
      requires_approval: false
    },
    created_at: new Date(Date.now() - 5400000).toISOString()
  }
];

// Initial dataset with 5 distinct active incidents & non-repetitive cohorts
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
      current_success_rate: 0.41,
      z_score: -3.8,
      affected_count: 5,
      revenue_at_risk_paise: 5924900, // ₹59,249 total cohort
      root_cause: "HDFC UPI Auth Gateway is experiencing intermittent timeouts. Direct retries are failing at 82%.",
      recommended_approach: "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp.",
      evidence: [
        { key: "UPI Success Drop", value: "88% -> 41% baseline delta" },
        { key: "Razorpay Downtime Match", value: "Partner HDFC UPI partner degraded status confirmed" },
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
      dimensions: { method: "card", issuer: "ICICI Bank", step: "authentication", reason: "payment_cancelled_by_user" },
      baseline_success_rate: 0.92,
      current_success_rate: 0.68,
      z_score: -2.7,
      affected_count: 3,
      revenue_at_risk_paise: 4730000, // ₹47,300
      root_cause: "ICICI 3DS OTP delivery delay causing checkout timeouts post-authentication.",
      recommended_approach: "Offer instant UPI QR payment link fallback with 3% recovery discount.",
      evidence: [
        { key: "OTP Delay Spike", value: "+45s average OTP latency" },
        { key: "User Abandonment", value: "68% drop-off post OTP screen" }
      ]
    },
    {
      id: "INC-903",
      merchant_id: "merchant_razor_01",
      title: "Checkout Drop-off & Cart Abandonment",
      status: "OPEN",
      severity: "MEDIUM",
      started_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      dimensions: { method: "upi", issuer: "Multi-bank", step: "selection", reason: "checkout_abandoned" },
      baseline_success_rate: 0.85,
      current_success_rate: 0.62,
      z_score: -2.1,
      affected_count: 2,
      revenue_at_risk_paise: 2230000, // ₹22,300
      root_cause: "High friction at checkout selection step; high intent customers exiting.",
      recommended_approach: "Send personalized WhatsApp reminder with pre-filled Razorpay link.",
      evidence: [
        { key: "Intent Drop", value: "Abandoned within 2 minutes of cart entry" }
      ]
    },
    {
      id: "INC-904",
      merchant_id: "merchant_razor_01",
      title: "AutoPay e-Mandate Balance Debit Failures",
      status: "OPEN",
      severity: "LOW",
      started_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      dimensions: { method: "mandate", issuer: "SBI Bank", step: "debit", reason: "insufficient_funds" },
      baseline_success_rate: 0.86,
      current_success_rate: 0.72,
      z_score: -1.8,
      affected_count: 2,
      revenue_at_risk_paise: 2130000, // ₹21,300
      root_cause: "End-of-month salary cycle deficit; hard retry immediately will fail.",
      recommended_approach: "Schedule e-mandate retry window on predicted salary credit day (1st-3rd of month).",
      evidence: [
        { key: "Debit Failure Code", value: "INSUFFICIENT_FUNDS on recurring debit" }
      ]
    }
  ],
  recoveryCases: [
    ...hdfcUpiCohort,
    {
      id: "CASE-106",
      incident_id: "INC-902",
      merchant_id: "merchant_razor_01",
      provider_payment_id: "pay_N8x66r3M8v2",
      customer_name: "Amit Verma",
      customer_email: "amit.verma@example.com",
      customer_phone: "+919855544332",
      amount_paise: 1540000, // ₹15,400
      currency: "INR",
      status: "PLANNED",
      eligibility: "ELIGIBLE",
      failure_reason: {
        error_code: "BAD_REQUEST_ERROR",
        error_source: "customer",
        error_step: "payment_authentication",
        error_reason: "payment_cancelled_by_user",
        method: "card",
        issuer: "ICICI Bank"
      },
      current_plan: {
        diagnosis: "ICICI 3DS OTP delay caused user exit.",
        recoverability: { eligible: true, probability: 0.80, confidenceBand: "HIGH" },
        expectedEconomics: { grossRecoveryValuePaise: 1540000, actionCostPaise: 50, expectedNetValuePaise: 1539950 },
        actions: [
          { action: "SWITCH_METHOD", params: { suggestedMethod: "upi" }, reasonCodes: ["BYPASS_CARD_AUTHENTICATION"] },
          { action: "CREATE_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["UPI_LINK"] }
        ]
      },
      policy_decision: {
        decision: "ALLOW",
        matched_rules: ["Standard auto-execution allowed"],
        requires_approval: false
      },
      created_at: new Date(Date.now() - 4000000).toISOString()
    },
    {
      id: "CASE-107",
      incident_id: "INC-904",
      merchant_id: "merchant_razor_01",
      provider_payment_id: "pay_N8x77s4N9w1",
      customer_name: "Manish Joshi",
      customer_email: "manish.j@example.com",
      customer_phone: "+919844433221",
      amount_paise: 1240000, // ₹12,400
      currency: "INR",
      status: "PLANNED",
      eligibility: "ELIGIBLE",
      failure_reason: {
        error_code: "BAD_REQUEST_ERROR",
        error_source: "customer",
        error_step: "payment_authorization",
        error_reason: "insufficient_funds",
        method: "mandate",
        issuer: "SBI Bank"
      },
      current_plan: {
        diagnosis: "Temporary balance deficit on AutoPay e-mandate.",
        recoverability: { eligible: true, probability: 0.72, confidenceBand: "MEDIUM" },
        expectedEconomics: { grossRecoveryValuePaise: 1240000, actionCostPaise: 50, expectedNetValuePaise: 1239950 },
        actions: [
          { action: "WAIT", params: { waitMinutes: 1440 }, reasonCodes: ["SALARY_CYCLE_WINDOW"] },
          { action: "RETRY", params: { scheduledFor: "plus_24h" }, reasonCodes: ["OPTIMAL_DEBIT_RETRY"] }
        ]
      },
      policy_decision: {
        decision: "ALLOW",
        matched_rules: ["Scheduled retry permitted"],
        requires_approval: false
      },
      created_at: new Date(Date.now() - 5000000).toISOString()
    }
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
      details: "HDFC Bank UPI Success Rate dropped below -2.5 Z-score (88% -> 41%). Revenue at risk: ₹59,249.",
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
        // Ensure cases are deduplicated on load
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
    this.data.merchant.policy = { ...this.data.merchant.policy, ...policy };
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
    const existing = this.data.incidents.find(i => i.id === incident.id);
    if (existing) {
      Object.assign(existing, incident);
    } else {
      this.data.incidents.unshift(incident);
    }
    this.save();
    return incident;
  }

  getCases() { return this.data.recoveryCases; }
  getCaseById(id) { return this.data.recoveryCases.find(c => c.id === id); }
  addCase(caseItem) {
    const existingIndex = this.data.recoveryCases.findIndex(
      c => c.id === caseItem.id || (c.customer_name === caseItem.customer_name && c.amount_paise === caseItem.amount_paise)
    );
    if (existingIndex >= 0) {
      this.data.recoveryCases[existingIndex] = caseItem;
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
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      merchant_id: "merchant_razor_01",
      occurred_at: new Date().toISOString(),
      ...event
    };
    this.data.auditEvents.unshift(fullEvent);
    this.save();
    return fullEvent;
  }

  getBatchRuns() { return this.data.batchRuns; }
  addBatchRun(batchRun) {
    this.data.batchRuns.unshift(batchRun);
    this.save();
    return batchRun;
  }
}

export const db = new Database();
