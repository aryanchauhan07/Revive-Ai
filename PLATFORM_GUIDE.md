# User Guide & Platform Overview — RECOVEROPS (Revive AI)
## Payment SRE & AI Revenue Recovery Engine for Razorpay Track 03

---

## 1. What RECOVEROPS Is About

**RECOVEROPS (Revive AI)** is an autonomous, compliant **AI Revenue Recovery platform** designed specifically for **Razorpay AI Buildathon Track 03: AI Revenue Recovery**.

### The Core Problem
Revenue loss rarely happens in a single clean step. It slips away across multiple leaky touchpoints:
- **Payment Degradation:** Bank server downtime, network glitches, or card issuer timeouts (e.g. HDFC UPI auth failures).
- **Checkout Drop-Offs:** Customers exiting checkout post-authentication or during OTP verification.
- **Failed Subscriptions & Mandates:** e-Mandate debit retries hitting empty accounts on non-salary days.
- **Overdue B2B Invoices:** Unpaid invoices straining merchant cash flow.

### The Closed-Loop AI Solution
Unlike simple cart-nudge tools or blind retries, **RECOVEROPS operates as a Payment SRE (Site Reliability Engineer)**:
1. **Detects** revenue incidents using statistical Z-score rolling baselines.
2. **Diagnoses** root causes by correlating Razorpay error codes (`GATEWAY_ERROR`, `insufficient_funds`, `issuer_bank`) with bank status APIs.
3. **Plans** least-cost safe interventions via a prioritized Action Ladder (`WAIT` $\rightarrow$ `RETRY` $\rightarrow$ `SWITCH_METHOD` $\rightarrow$ `CREATE_LINK` $\rightarrow$ `MESSAGE` $\rightarrow$ `INCENTIVE` $\rightarrow$ `HUMAN_ESCALATION` $\rightarrow$ `STOP`).
4. **Governs** every action with a strict, fail-closed Policy Engine (DND quiet hours 22:00–08:00 IST, max discount floor caps, human escalation gates).
5. **Executes & Measures** incremental money recovered across batches with a complete, tamper-proof audit trail.

---

## 2. Key Architecture & Differentiators

| Capability | Generic Retry Tools | RECOVEROPS (Revive AI) |
| :--- | :--- | :--- |
| **Anomaly Detection** | Blind instant retries | Statistical Z-score rolling baseline (detects merchant vs. bank outage) |
| **Root Cause Analysis** | None (treats all failures same) | Error parameter normalization (`error_code`, `error_source`, `issuer`) |
| **Action Selection** | Always sends discount / reminder | Prioritized Action Ladder (suppresses retries during bank downtime) |
| **Compliance & Guardrails** | Can spam users anytime | Enforces DND Quiet Hours (22:00–08:00 IST), max 3 contacts, kill switch |
| **Human Handoff** | Full autonomy without bounds | Human Approval Queue for high-value orders ($\ge$ ₹25,000) |
| **Value Verification** | Claims all later payments | Seeded 2,000-event benchmark comparing Baseline A, Baseline B & Agent |

---

## 3. How to Use the Platform (Step-by-Step Guide)

### Step 1: Open the Application
Launch your browser and navigate to:
👉 **[http://localhost:5175](http://localhost:5175)**

---

### Step 2: Explore the 7 Core Screens

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Command Center] [Payment Health] [Incidents] [Cases] [Approvals] [Policy] [2k Batch] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Command Center (Dashboard)
- **Top Metrics:** At-Risk Revenue (₹), Gross Recovered Revenue (₹), Recovery Rate (%), Active Incidents.
- **Hourly Trend Chart:** Real-time success rate baseline vs actual degradation curve.
- **Recovered Revenue by Rail Bar Chart:** Visual breakdown of money recovered by payment rail.
- **Active Recovery Cases Table:** Live table with search bar and status filters.
- **Live Audit Stream:** Server-Sent Events (SSE) real-time feed logging every state change.

#### 2. Payment Health
- Monitor rolling success rates across **UPI**, **Credit/Debit Cards**, **Netbanking**, and **AutoPay e-Mandates**.
- View active degradation alert banners (e.g. *"HDFC Bank UPI Success Rate dropped 88% $\rightarrow$ 38%"*).

#### 3. Revenue Incident Inspector
- Inspect open revenue incidents, AI root cause diagnosis summaries, and evidence traces.
- View the affected customer cohort queue and execute batch remediation.

#### 4. Recovery Case Manager
- Select an individual payment failure to inspect its lifecycle.
- View expected economics (Recoverability Probability %, Expected Net Value ₹).
- Review the typed Action Plan Ladder and policy decision results.

#### 5. Human Approval Queue (Human-in-the-Loop)
- View high-value cases ($\ge$ ₹25,000) or custom discount requests requiring human approval.
- Click **Approve & Execute Action** or **Reject & Stop**.

#### 6. Autonomy & Policy Controls
- Switch autonomy modes:
  - `OBSERVE`: Read-only recommendations (no side effects).
  - `ASSIST`: Low-risk actions execute inside policy; high-value requires approval.
  - `AUTOPILOT`: Full autonomous execution inside policy bounds.
- Configure Quiet Hours (22:00 to 08:00 IST), max retry caps, and high-value floors.
- Toggle the emergency **Kill Switch**.

#### 7. 2k Batch Evaluation Benchmark
- Run a seeded 2,000-event synthetic evaluation benchmark.
- Compare **Baseline A** (No action), **Baseline B** (Generic retries), and **RECOVEROPS Agent** on money recovered, net profit, and policy compliance.

---

## 4. How to Test Interactive Simulators & Demos

### Scenario 1: Inject a Payment Failure Incident
1. Click **"Simulate Scenario"** in the top navigation bar.
2. Select **HDFC Bank UPI Timeout** (or *Checkout Card Drop-Off* / *Overdue Mandate*).
3. Watch the dashboard update live via real-time WebSockets/SSE!

### Scenario 2: Test Customer Payment Link Checkout
1. In the Active Recovery Cases table, click **"Pay Link"** on any case.
2. The **Razorpay Checkout Modal Sandbox** will open.
3. Select an alternative payment method (e.g., *ICICI Netbanking* or *Card*).
4. Click **Complete Payment** $\rightarrow$ Watch the payment captured and money recovered stats update instantly!

### Scenario 3: Test WhatsApp Customer Outreach
1. Click **"WhatsApp"** on any case in the table.
2. The **WhatsApp Business Chat Sandbox** drawer will open on the right.
3. Inspect the automated Hinglish recovery message and interactive 1-click Razorpay payment link.

---

## 5. API Keys Reference

> **Note:** Zero API keys are required to run or evaluate the platform!

| Key | Purpose | Out-of-the-Box Fallback |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` | LLM text synthesis | Heuristic Decision Ladder & Template Engine |
| `RAZORPAY_KEY_ID` & `SECRET` | Live Razorpay API links | Built-in Razorpay Checkout Modal Sandbox |
| `RAZORPAY_WEBHOOK_SECRET` | Live Webhook HMAC | Synthetic Ingress & Webhook Generator |

---
*RECOVEROPS — Production Architecture & Platform Specification • Razorpay Track 03*
