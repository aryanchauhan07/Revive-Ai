# RECOVEROPS: Complete System Mechanics & Architecture Guide
**Razorpay AI Buildathon 2026 • Track 03: AI Revenue Recovery**

---

## 1. Executive Summary & Problem Context

In online payments, **revenue loss rarely happens in a single clean step**. Transactions degrade across complex failure modes:
- Intermittent bank/PSP authorization gateway degradation (e.g. HDFC UPI timeout).
- High-intent checkout cart drop-offs.
- Temporary balance deficit on recurring AutoPay e-mandates.
- High-value transactions requiring human manager compliance approvals.

Traditional recovery systems rely on **blind spamming** (sending 5 repetitive SMS alerts) or **fixed blind retries** (retrying failing rails repeatedly). This annoys customers, burns gateway fees, and fails during systemic outages.

**RECOVEROPS** is an **Autonomous AI Payment SRE & Revenue Recovery Engine** that closes the loop:
1. **Detects** payment degradation across batches in real time.
2. **Triages** whether the issue is an *isolated customer failure* or a *systemic payment ecosystem outage*.
3. **Calculates** the mathematical Expected Net Recovery across 8 candidate interventions.
4. **Executes** the least-cost, policy-bounded recovery workflow (Razorpay Payment Links, WhatsApp, Hinglish AI Voice, Promise-to-Pay).
5. **Measures** true incremental net revenue recovered with an immutable audit trail.

---

## 2. End-to-End System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              1. PAYMENT INGESTION LAYER                                 │
│  • Raw HMAC SHA-256 Signature Verification                                              │
│  • Webhook Inbox Deduplication (x-razorpay-event-id)                                    │
│  • Monotonic State Machine (Never regresses RECOVERED state)                            │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                  2. PAYMENT SRE INTELLIGENCE & BLAST RADIUS ANALYSIS                    │
│  • Statistical Anomaly Detector (Z-score & Rolling Success Deltas)                      │
│  • Incident Scope Triage (SYSTEMIC_ISSUER_OUTAGE vs ISOLATED_CUSTOMER_FAILURE)          │
│  • Blast Radius Computation (Affected Txns, Customers, Revenue at Risk)                 │
│  • Recovery Circuit Breaker (Same-rail retry suppression & adaptive rerouting)          │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            3. RECOVERY DECISION BRAIN                                   │
│  • Evaluates 8-Candidate Action Matrix (WAIT, RETRY, SWITCH_METHOD, CREATE_LINK, etc.)  │
│  • Utility Optimization: Expected Net Recovery = P(Success)×Amount - Cost - Risk        │
│  • Structured LLM Diagnosis with deterministic FallbackRecoveryPlanner                  │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          4. POLICY & GOVERNANCE GATEWAY                                 │
│  • Per-Action Policy Decisions (ALLOW / REVIEW / BLOCK / SCHEDULE)                      │
│  • Quiet Hours DND Enforcement (22:00 – 08:00 IST)                                      │
│  • High-Value Floor Gate (Orders ≥ ₹25,000 require Manager Approval)                   │
│  • Execution-Time Policy Recheck (Fail-closed guard)                                    │
│  • 1-Click Merchant Emergency Kill Switch                                               │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           5. IDEMPOTENT ACTION EXECUTOR                                 │
│  • Stable Idempotency Key: action:{case_id}:{plan_version}:{action_id}                  │
│  • Razorpay Test Mode API Adapter (1-Click Recovery Payment Links)                     │
│  • Omnichannel Delivery: Pre-approved WhatsApp, Hinglish AI Voice, Promise-to-Pay (PTP) │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    6. RECOVERY MEASUREMENT & ATTRIBUTION ENGINE                         │
│  • Disentangles Natural Self-Recovery from True Incremental AI Lift                     │
│  • Self-Recovery Cancellation (payment.captured cancels queued chasers)                 │
│  • Net ROI Accounting: Net Recovered / Total Intervention Cost                          │
│  • Real-Time Server-Sent Events (SSE) Audit Trail                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Breakdown of the 3 Production Differentiators

### 🚀 Differentiator 1: Recovery Decision Brain (Mathematical Action Selection)
Instead of asking an LLM to blindly pick a random action, the Decision Brain models recovery as a **constrained expected utility optimization problem**.

For every payment failure, it evaluates an **8-Candidate Action Matrix**:

| Action ID | Candidate Action | Typical Use Case | $P(\text{Success})$ | Typical Cost |
| :--- | :--- | :--- | :--- | :--- |
| `WAIT` | Hold for cooldown / salary | Outages or salary cycle | 20% – 35% | ₹0 |
| `RETRY` | Direct payment re-attempt | Non-outage soft decline | 0% (outage) – 38% | ₹1.00 gateway fee |
| `SWITCH_PAYMENT_METHOD` | Alternate payment rail | UPI/Bank outage fallback | 65% – 88% | ₹0.50 |
| `CREATE_PAYMENT_LINK` | 1-Click Razorpay link | High-intent checkout drops | 82% – 85% | ₹0.50 |
| `WHATSAPP_MESSAGE` | Pre-approved outreach | Customer assist | 72% – 78% | ₹0.50 WhatsApp fee |
| `INCENTIVE` | Margin-safe dynamic discount | Cart drops (₹0 on outages) | 38% (outage) – 88% | 3% Order Value |
| `HUMAN_ESCALATION` | Route to manager approval | Orders $\ge$ ₹25,000 | 95% | ₹5.00 op cost |
| `STOP` | Safe stopping rule | Terminal expired card | 0% | ₹0 (prevents spam) |

#### Optimization Objective Equation:
$$\text{Expected Net Recovery Value} = \Big( P(\text{success} \mid \text{action}) \times \text{Gross Amount} \Big) - \text{Intervention Cost} - \text{Risk/Friction Penalty}$$

Where:
- $\text{Intervention Cost} = \text{Discount Value} + \text{Messaging API Fee (₹0.50)}$.
- $\text{Risk Penalty} = \text{Customer Spam Friction} + \text{Ecosystem Penalty}$ (heavy penalty for retrying during outages or giving discounts for bank failures).

The action with the **highest Expected Net Recovery** that is **`ALLOW`ed by the Policy Engine** is selected as the optimal strategy.

---

### 🛡️ Differentiator 2: Payment SRE Intelligence & Blast Radius Analysis
The system actively distinguishes **isolated individual customer declines** from **systemic payment rail/issuer outages**:

1. **Incident Scope Triage**:
   - `SYSTEMIC_ISSUER_OUTAGE`: Rolling success rate drops below dynamic baseline with high issuer concentration (e.g. HDFC UPI drop from 88% to 38%).
   - `ISOLATED_CUSTOMER_FAILURE`: Single customer balance or OTP friction without ecosystem anomaly.
2. **Blast Radius Analysis**:
   - **Affected Transactions**: Number of failures within the anomaly window.
   - **Affected Customers**: Unique customer cohort.
   - **Revenue at Risk**: Total gross value in jeopardy.
   - **Degraded Rail**: Specific rail/issuer (e.g. `HDFC Bank UPI`).
3. **Recovery Circuit Breaker**:
   - **TRIPPED State**: When a systemic outage is active, the Circuit Breaker trips immediately:
     - **Suppresses Same-Rail Retries**: Blocks wasteful retries that would fail 100% of the time.
     - **Adaptive Rerouting**: Recommends unaffected alternate rails (Cards & Netbanking).
     - **Cooldown Window**: Waits for rolling success rate stabilization before executing cohort outreach.

---

### 📊 Differentiator 3: Recovery Measurement & Attribution Engine
Most platforms claim inflated recovery numbers by counting money customers would have paid anyway. RECOVEROPS provides **statistically non-circular attribution**:

```
Total Revenue at Risk (100%)
  ├── 1. Natural Self-Recovery (Money customer would have paid without intervention)
  ├── 2. Incremental Lift from RECOVEROPS (True value added solely by RECOVEROPS)
  └── 3. Unrecoverable / Terminal Declines (Hard declines safely stopped)
```

#### Key Economic Metrics:
- **Net Incremental Recovery**:
  $$\text{Net Incremental Lift} = \text{RECOVEROPS Net Recovered} - \text{Baseline B (Generic Retries) Net Recovered}$$
- **Return on Investment (ROI)**:
  $$\text{ROI Multiplier} = \frac{\text{Net Incremental Recovery}}{\text{Total Intervention Cost (Discounts + Messaging)}}$$
- **Customer Self-Recovery Cancellation (S15)**:
  If a customer retries independently and a `payment.captured` webhook is received, the engine **instantly cancels all queued recovery messages/retries**, tags attribution as `SELF_RECOVERED`, and prevents double-charging.

---

## 4. Omnichannel Recovery Execution Features

1. **Razorpay Test Mode / Sandbox Payment Links**: Generates secure 1-click Razorpay payment URLs with pre-applied discounts and order references.
2. **WhatsApp Business API Outreach**: Dispatches templated, friendly recovery messages with payment links.
3. **Hinglish AI Voice Recovery Call Sandbox**: Simulates an automated phone call in natural Hinglish with animated waveform and live speech-to-text transcript:
   > *"Namaste Rahul ji! Main Razorpay Revive AI se bol raha hoon. Aapka ₹7,200 ka payment HDFC Bank server timeout ki wajah se complete nahi ho paya tha. Kya main aapko alternate link WhatsApp kar doon?"*
4. **Promise-to-Pay (PTP) Date Tracker**: Allows setting customer-promised payment dates (e.g. *Sept 2nd*), temporarily pausing all automated chasers until that day.

---

## 5. Governance, Policy & Bounded Autonomy

The AI planner **never has direct execution authority**. All actions pass through the Deterministic Policy Engine:
- **Autonomy Modes**:
  - `OBSERVE`: Read-only. AI plans actions, but executes zero customer contact.
  - `ASSIST`: Low-risk actions execute autonomously; high-value cases require manager review.
  - `AUTOPILOT`: Fully autonomous execution within strict guardrail boundaries.
- **Quiet Hours DND (S22)**: Any communication between 22:00 and 08:00 IST is automatically scheduled for 08:00 IST.
- **High-Value Floor Gate (S17)**: Orders $\ge$ ₹25,000 require explicit human manager approval in the Approval Queue.
- **Discount Ceiling**: Autonomous discounts capped at 2%; 2–5% requires review; >5% is blocked.
- **Emergency Kill Switch**: 1-click merchant freeze instantly halting all background actions.

---

## 6. Real vs. Simulated Integration Matrix

| Subsystem | Demo / Sandbox Mode | Production Mode |
| :--- | :--- | :--- |
| **Razorpay Ingress** | Simulated webhook dispatcher with raw HMAC validation | Live Razorpay Webhook URL (`/api/webhooks/razorpay`) with secret verification |
| **Payment Links** | Interactive Razorpay Checkout Sandbox (`is_simulated: true`) | Live Razorpay API (`https://api.razorpay.com/v1/payment_links`) via `RAZORPAY_KEY_ID` |
| **WhatsApp Comms** | Interactive WhatsApp Chat Sandbox Modal | WhatsApp Business Cloud API (`messages` endpoint) |
| **Voice Recovery** | Hinglish AI Voice Sandbox Drawer with Waveform & Transcript | Exotel / Twilio / Bland.ai Voice API Webhook |
| **Evaluation** | 2,000-event Mulberry32 Seeded Synthetic PRNG | Live Merchant Transaction Data Warehouse (Postgres/BigQuery) |

---

## 7. Component Map & Key Files Reference

| File | Purpose & Responsibilities |
| :--- | :--- |
| [server/core/webhookIngress.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/webhookIngress.js) | Raw HMAC SHA-256 verification, event deduplication, and self-recovery cancellation. |
| [server/core/recoveryPlanner.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/recoveryPlanner.js) | **Recovery Decision Brain**: 8-action matrix, Expected Net Recovery optimization, and LLM fallback. |
| [server/core/policyEngine.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/policyEngine.js) | Per-action policy evaluation, DND quiet hours, high-value floor gates, and execution rechecks. |
| [server/core/actionExecutor.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/actionExecutor.js) | Stable action idempotency keys (`action:{case_id}:{ver}:{action_id}`) and Razorpay API adapters. |
| [server/simulation/batchSimulator.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/simulation/batchSimulator.js) | **Attribution Engine**: 2,000-event Mulberry32 seeded benchmark simulator with ROI & lift attribution. |
| [server/simulation/scenarioLibrary.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/simulation/scenarioLibrary.js) | Real-world scenario library (S1 to S23) covering bank outages, cart drops, and PTP dates. |
| [src/pages/CommandCenter.jsx](file:///c:/Users/User/OneDrive/Revive%20AI/src/pages/CommandCenter.jsx) | Executive revenue command center, KPI cards, anomaly success curve, and active cases table. |
| [src/pages/PaymentHealth.jsx](file:///c:/Users/User/OneDrive/Revive%20AI/src/pages/PaymentHealth.jsx) | **Payment SRE Telemetry**: Blast radius stats, rail health, and Recovery Circuit Breakers. |
| [src/pages/IncidentInspector.jsx](file:///c:/Users/User/OneDrive/Revive%20AI/src/pages/IncidentInspector.jsx) | Incident root-cause diagnosis, evidence signals, and affected customer cohort drilldown. |
| [src/pages/CaseTimeline.jsx](file:///c:/Users/User/OneDrive/Revive%20AI/src/pages/CaseTimeline.jsx) | **Decision Brain Matrix**: Interactive 8-action economics table, PTP date selector, and action triggers. |
| [src/pages/ApprovalCenter.jsx](file:///c:/Users/User/OneDrive/Revive%20AI/src/pages/ApprovalCenter.jsx) | Human manager approval queue for high-value ($\ge$ ₹25,000) transactions. |
| [src/pages/BatchEvaluator.jsx](file:///c:/Users/User/OneDrive/Revive%20AI/src/pages/BatchEvaluator.jsx) | **Attribution Dashboard**: Natural recovery vs incremental AI lift split and ROI multiplier. |
| [tests/unit.test.js](file:///c:/Users/User/OneDrive/Revive%20AI/tests/unit.test.js) | Automated unit/integration test suite (`npm test` 100% pass rate). |
