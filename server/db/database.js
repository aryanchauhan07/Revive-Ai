import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'data.json');

// Initial default database structure
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
      title: "HDFC Bank UPI Success Rate Degradation",
      status: "OPEN",
      severity: "HIGH",
      started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      dimensions: { method: "upi", issuer: "HDFC Bank", step: "authorization", reason: "gateway_technical_error" },
      baseline_success_rate: 0.88,
      current_success_rate: 0.41,
      z_score: -3.8,
      affected_count: 42,
      revenue_at_risk_paise: 3840000, // ₹38,400
      root_cause: "HDFC UPI Auth Gateway is experiencing intermittent timeouts. Direct retries are failing at 82%.",
      evidence: [
        { key: "UPI Success Drop", value: "88% -> 41% baseline delta" },
        { key: "Razorpay Status Match", value: "Partner HDFC UPI partner degraded status confirmed" },
        { key: "Method Concentration", value: "92% of failures are on UPI rail" }
      ]
    }
  ],
  recoveryCases: [
    {
      id: "CASE-101",
      incident_id: "INC-901",
      merchant_id: "merchant_razor_01",
      provider_payment_id: "pay_N8x29f9A0k1",
      customer_name: "Rahul Sharma",
      customer_email: "rahul.sharma@example.com",
      customer_phone: "+919876543210",
      amount_paise: 849900, // ₹8,499
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
        recoverability: { eligible: true, probability: 0.85, confidenceBand: "HIGH" },
        expectedEconomics: { grossRecoveryValuePaise: 849900, actionCostPaise: 50, expectedNetValuePaise: 849850 },
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
      incident_id: null,
      merchant_id: "merchant_razor_01",
      provider_payment_id: "pay_N8x99k1P9a3",
      customer_name: "Priya Patel",
      customer_email: "priya.p@example.com",
      customer_phone: "+919812345678",
      amount_paise: 2850000, // ₹28,500
      currency: "INR",
      status: "APPROVAL_REQUIRED",
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
        diagnosis: "Checkout drop-off post authentication window.",
        recoverability: { eligible: true, probability: 0.65, confidenceBand: "MEDIUM" },
        expectedEconomics: { grossRecoveryValuePaise: 2850000, actionCostPaise: 85500, expectedNetValuePaise: 2764500 },
        actions: [
          { action: "INCENTIVE", params: { discountPct: 3, code: "REVIVE3" }, reasonCodes: ["HIGH_VALUE_CART_RECOVERY"] },
          { action: "HUMAN_ESCALATION", params: { reason: "Amount >= ₹25,000 requires human review" }, reasonCodes: ["POLICY_HIGH_VALUE"] }
        ]
      },
      policy_decision: {
        decision: "REVIEW",
        matched_rules: ["Order value >= ₹25,000 threshold triggered"],
        requires_approval: true
      },
      created_at: new Date(Date.now() - 3600000).toISOString()
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
      details: "HDFC Bank UPI Success Rate dropped below -2.5 Z-score (88% -> 41%). Revenue at risk: ₹38,400.",
      occurred_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "AUDIT-002",
      merchant_id: "merchant_razor_01",
      actor_type: "model",
      actor_id: "recovery_planner_v1",
      action: "PLAN_PROPOSED",
      correlation_id: "CASE-101",
      details: "Proposed plan: WAIT 15m -> SWITCH_METHOD -> CREATE_LINK -> MESSAGE (WhatsApp). Expected Net: ₹8,498.50.",
      occurred_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "AUDIT-003",
      merchant_id: "merchant_razor_01",
      actor_type: "system",
      actor_id: "policy_engine_v1",
      action: "POLICY_EVALUATED",
      correlation_id: "CASE-101",
      details: "Policy Evaluation: ALLOW. 6 rules passed. 0 policy violations.",
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
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn("Could not read DB_FILE, creating fresh database state:", err.message);
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
    this.data.incidents.unshift(incident);
    this.save();
    return incident;
  }

  getCases() { return this.data.recoveryCases; }
  getCaseById(id) { return this.data.recoveryCases.find(c => c.id === id); }
  addCase(caseItem) {
    this.data.recoveryCases.unshift(caseItem);
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
