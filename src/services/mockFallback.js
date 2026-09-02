// Comprehensive fallback data for client-side resilience
export const fallbackIncidents = [
  {
    id: "INC-901",
    rail_key: "upi_hdfc",
    title: "HDFC Bank UPI Systemic Degradation",
    status: "INVESTIGATING",
    severity: "HIGH",
    baseline_success_rate: 0.94,
    current_success_rate: 0.38,
    affected_customers_count: 5,
    value_at_risk_paise: 5924900,
    circuit_breaker: {
      status: "TRIPPED",
      suppress_same_rail_retries: true,
      recommended_alternate_rail: "Cards / Netbanking",
      cooldown_remaining_minutes: 18
    },
    started_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "INC-902",
    rail_key: "cards_icici",
    title: "ICICI Cards 3DS Auth Latency Spike",
    status: "MONITORING",
    severity: "MEDIUM",
    baseline_success_rate: 0.91,
    current_success_rate: 0.52,
    affected_customers_count: 3,
    value_at_risk_paise: 4730000,
    circuit_breaker: {
      status: "TRIPPED",
      suppress_same_rail_retries: true,
      recommended_alternate_rail: "UPI / Netbanking",
      cooldown_remaining_minutes: 12
    },
    started_at: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: "INC-904",
    rail_key: "mandate_sbi",
    title: "SBI AutoPay Recurring Mandate Failure Spikes",
    status: "INVESTIGATING",
    severity: "MEDIUM",
    baseline_success_rate: 0.88,
    current_success_rate: 0.44,
    affected_customers_count: 2,
    value_at_risk_paise: 2130000,
    circuit_breaker: {
      status: "TRIPPED",
      suppress_same_rail_retries: true,
      recommended_alternate_rail: "Salary-Window Sequenced Retry (1st-3rd)",
      cooldown_remaining_minutes: 45
    },
    started_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const fallbackCases = [
  {
    id: "CASE-101",
    incident_id: "INC-901",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_hdfc_01",
    customer_name: "Ananya Roy",
    customer_email: "ananya.roy@example.com",
    customer_phone: "+919876543210",
    amount_paise: 485000,
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
    policy_decision: { decision: "ALLOW", requires_approval: false, matched_rules: ["Standard guardrails passed"], reason: "Within autonomous policy limits." },
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
    amount_paise: 720000,
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
    policy_decision: { decision: "ALLOW", requires_approval: false, matched_rules: ["Standard guardrails passed"], reason: "Within autonomous policy limits." },
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
    amount_paise: 2850000,
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
        { action: "HUMAN_ESCALATION", params: { reason: "High-value order >= ₹20,000 threshold" }, reasonCodes: ["MONEY_SAFETY_FLOOR"] },
        { action: "SWITCH_METHOD", params: { suggestedMethod: "card_or_netbanking" }, reasonCodes: ["BYPASS_DEGRADED_RAIL"] },
        { action: "CREATE_LINK", params: { expiresMinutes: 180 }, reasonCodes: ["MANAGER_APPROVED_LINK"] }
      ]
    },
    policy_decision: { decision: "REVIEW", requires_approval: true, matched_rules: ["HIGH_VALUE_THRESHOLD (₹28,500 >= ₹20,000)"], reason: "High-value order requires human manager sign-off." },
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
    amount_paise: 649900,
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
      recoverability: { eligible: true, probability: 0.86, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 649900, actionCostPaise: 19500, expectedNetValuePaise: 539400 },
      actions: [
        { action: "INCENTIVE", params: { discountPct: 3 }, reasonCodes: ["APPLY_DYNAMIC_3_PCT_DISCOUNT"] },
        { action: "CREATE_PAYMENT_LINK", params: { expiresMinutes: 60 }, reasonCodes: ["CHECKOUT_RESUME_LINK"] }
      ]
    },
    policy_decision: { decision: "ALLOW", requires_approval: false, matched_rules: ["Dynamic discount authorized (3%)"], reason: "Approved dynamic cart recovery discount." },
    created_at: new Date(Date.now() - 4200000).toISOString()
  },
  {
    id: "CASE-401",
    incident_id: "INC-904",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_sbi_01",
    customer_name: "Karan Malhotra",
    customer_email: "karan.malhotra@example.com",
    customer_phone: "+919844455566",
    amount_paise: 1240000,
    currency: "INR",
    status: "PLANNED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "GATEWAY_ERROR",
      error_source: "issuer_bank",
      error_step: "payment_authorization",
      error_reason: "insufficient_funds",
      method: "mandate",
      issuer: "SBI Bank"
    },
    current_plan: {
      diagnosis: "End-of-month salary cycle deficit on recurring SBI AutoPay mandate.",
      recoverability: { eligible: true, probability: 0.89, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 1240000, actionCostPaise: 50, expectedNetValuePaise: 1103600 },
      actions: [
        { action: "WAIT", params: { waitMinutes: 1440 }, reasonCodes: ["SALARY_CYCLE_WINDOW"] },
        { action: "RETRY", params: { scheduledFor: "plus_24h" }, reasonCodes: ["OPTIMAL_DEBIT_RETRY"] }
      ]
    },
    policy_decision: { decision: "ALLOW", requires_approval: false, matched_rules: ["Mandate retry sequencer active"], reason: "Scheduled for salary credit window." },
    created_at: new Date(Date.now() - 5000000).toISOString()
  },
  {
    id: "CASE-501",
    incident_id: "INC-905",
    merchant_id: "merchant_razor_01",
    provider_payment_id: "pay_b2b_01",
    customer_name: "Acme Technologies (B2B)",
    customer_email: "finance@acmetech.com",
    customer_phone: "+919800011122",
    amount_paise: 8500000,
    currency: "INR",
    status: "PLANNED",
    eligibility: "ELIGIBLE",
    failure_reason: {
      error_code: "INVOICE_OVERDUE",
      error_source: "corporate_buyer",
      error_step: "invoice_settlement",
      error_reason: "net_30_aging_past_due",
      method: "bank_transfer",
      issuer: "Corporate RTGS"
    },
    current_plan: {
      diagnosis: "Corporate B2B invoice past Net-30 terms. Requires formal Virtual Account reconciliation.",
      recoverability: { eligible: true, probability: 0.91, confidenceBand: "HIGH" },
      expectedEconomics: { grossRecoveryValuePaise: 8500000, actionCostPaise: 100, expectedNetValuePaise: 7734900 },
      actions: [
        { action: "CREATE_PAYMENT_LINK", params: { type: "smart_collect_virtual_account" }, reasonCodes: ["VIRTUAL_ACCOUNT_RECONCILIATION"] }
      ]
    },
    policy_decision: { decision: "ALLOW", requires_approval: false, matched_rules: ["B2B Virtual Account collection rule"], reason: "Virtual Account generated for corporate ledger." },
    created_at: new Date(Date.now() - 6000000).toISOString()
  }
];

export const fallbackAuditEvents = [
  {
    id: "AUDIT-101",
    sequence_id: 1,
    prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    block_hash: "3a8b4f12e89d71c450bf0289a311ce20fbc89a01e457f9208a3d5821c10d8a4e",
    occurred_at: new Date(Date.now() - 3600000).toISOString(),
    actor_type: "system",
    actor_id: "sre_anomaly_detector",
    action: "CIRCUIT_BREAKER_TRIPPED",
    correlation_id: "INC-901",
    details: "HDFC UPI success rate dropped to 38%. Circuit breaker tripped to suppress failing same-rail retries."
  },
  {
    id: "AUDIT-102",
    sequence_id: 2,
    prev_hash: "3a8b4f12e89d71c450bf0289a311ce20fbc89a01e457f9208a3d5821c10d8a4e",
    block_hash: "9f01c87e2b10a44d852e90cfa14e7a83d091e2b4f981ca30e128b9d4f008e1a7",
    occurred_at: new Date(Date.now() - 3000000).toISOString(),
    actor_type: "system",
    actor_id: "decision_brain",
    action: "ARGMAX_POLICY_OPTIMIZED",
    correlation_id: "CASE-101",
    details: "Calculated Net Utility: SWITCH_PAYMENT_METHOD (Cards/Netbanking) chosen as optimal candidate plan (+₹4,849.50 Net)."
  }
];
