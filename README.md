# RECOVEROPS (Revive AI) — Payment SRE & AI Revenue Recovery Engine
### Razorpay AI Buildathon — Track 03: AI Revenue Recovery

> **Target Submission:** A payment incident + revenue rescue agent that detects degradation across a batch, diagnoses likely root causes, chooses least-cost safe interventions, executes only within policy, recovers affected customer cohorts, and measures incremental net revenue with an auditable trail.

---

## 1. Production System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │            NEXT.JS / REACT UI CONTROL        │
                               │   - Command Center   - Incident Inspector    │
                               │   - Approval Queue   - Trust & Reliability   │
                               └──────────────────────┬───────────────────────┘
                                                      │ REST APIs / SSE Stream
 ┌────────────────────────────────────────────────────▼───────────────────────────────────────────────────┐
 │                                   NODE.JS ENGINE & BACKGROUND WORKERS                                 │
 │                                                                                                       │
 │ ┌─────────────────────────────────┐   ┌───────────────────────────────┐   ┌─────────────────────────┐ │
 │ │     Raw HMAC Ingress (401)      │   │   Statistical Health Detector │   │  AI Recovery Planner    │ │
 │ │ (Raw Bytes HMAC + Dedupe)       │   │   (5m Rolling Z-Score Anomaly)│   │  (LLM + Fallback Rules) │ │
 │ └────────────────┬────────────────┘   └───────────────┬───────────────┘   └────────────┬────────────┘ │
 │                  │                                    │                                │              │
 │ ┌────────────────▼────────────────────────────────────▼────────────────────────────────▼────────────┐ │
 │ │                             Deterministic Action-Level Policy Engine                                │ │
 │ │   (Per-Action Decisions • Technical Outage ₹0 Discount • Quiet Hours • High-Value Floor • Kill Switch) │ │
 │ └─────────────────────────────────────────────────┬───────────────────────────────────────────────────┘ │
 │                                                   │                                                     │
 │ ┌─────────────────────────────────────────────────▼───────────────────────────────────────────────────┐ │
 │ │                      Stable Idempotency Execution Adapters & Recheck                                │ │
 │ │   (Razorpay Live Test Mode API • WhatsApp Outreach • Mandate Scheduler • Self-Recovery Cancel)         │ │
 │ └───────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
 └────────────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                      │
 ┌────────────────────────────────────────────────────▼───────────────────────────────────────────────────┐
 │                            PERSISTENCE & AUDIT TRAIL LAYER                                            │
 │  - PostgreSQL / SQLite (Canonical Events, Cases, Action-Level Decisions, Audit Trail)                 │
 └────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Real vs. Simulated Matrix

| Component / Layer | Production Real Path | Demo / Simulation Mode Path |
| :--- | :--- | :--- |
| **Razorpay Webhooks** | Real raw-body HMAC signature validation (`request.rawBody`) with `RAZORPAY_WEBHOOK_SECRET` | Synthetic event generator with automatic signature fallback |
| **Razorpay Payment Links** | Live Razorpay API (`/v1/payment_links`) when `RAZORPAY_KEY_ID` & `SECRET` set | Interactive Razorpay Checkout Sandbox Modal |
| **Customer Messaging** | Live WhatsApp Business API / Twilio SMS | Interactive WhatsApp Chat Sandbox & Hinglish Voice Call Drawer |
| **AI Diagnosis Engine** | OpenAI / Gemini structured JSON Schema validation | `FallbackRecoveryPlanner` deterministic rules engine |
| **Batch Benchmark** | Seeded LCG PRNG (`seed=20260828`) producing byte-for-byte reproducible metrics | Live interactive 2,000-event benchmark simulation |

---

## 3. Quickstart & Testing

### Running the Application
```bash
# 1. Install dependencies
npm install

# 2. Run automated principal-engineer test suite
npm test

# 3. Start backend API server (Port 3001)
npm run server

# 4. In a second terminal, start frontend dev server (Port 5175)
npm run dev
```

Open **[http://localhost:5175](http://localhost:5175)** in your browser.

---

## 4. Final 5-Minute Demo Script (Section 14 Specification)

| Time | Scenario / Feature | Demo Beat & Judge Takeaway |
| :--- | :--- | :--- |
| **0:00–0:35** | **Problem & Live Feed** | Explain same 'failed payment' requires opposite actions. *This is an incident orchestration problem, not a messaging bot.* |
| **0:35–1:35** | **UPI Issuer Degradation** | Trigger HDFC UPI Anomaly $\rightarrow$ Statistical Z-score drop $\rightarrow$ ₹0 discount recommendation (margin protected) $\rightarrow$ switch rail. |
| **1:35–2:20** | **Insufficient Balance / Mandate** | No incident opened; schedule salary window retry. *Contextual per-case recovery.* |
| **2:20–3:05** | **High-Value Case (Priya Patel ₹28,500)** | Policy flags order for manager approval. Manager approves $\rightarrow$ action executes. *Bounded autonomy.* |
| **3:05–3:40** | **Reliability & Security Boundary** | Send invalid HMAC webhook $\rightarrow$ 401 rejected. Send duplicate event $\rightarrow$ 200 `DUPLICATE_IGNORED`. *Graceful production failure handling.* |
| **3:40–4:25** | **Seeded 2k Batch Evaluation** | Run deterministic benchmark (Seed 20260828) comparing Baseline A, Baseline B, and RECOVEROPS. *Measured incremental money recovered.* |
| **4:25–5:00** | **Architecture & Audit Explorer** | Show live SSE audit stream tracing Event $\rightarrow$ Diagnosis $\rightarrow$ Action-level Policy $\rightarrow$ Execution. |

---

## 5. Verification Results
Run `npm test` to execute the automated verification test suite:
- ✅ Raw Webhook HMAC Signature Validation
- ✅ Invalid Signature Rejection Boundary (HTTP 401)
- ✅ Webhook Event-ID Deduplication (No-Op)
- ✅ Technical Outage Zero Discount Policy Enforcement
- ✅ Customer Self-Recovery Cancels Queued Actions
- ✅ Seeded Benchmark Determinism & Byte-for-Byte Reproducibility
- ✅ Stable Idempotency Key & Action Execution Authorization

---
*RECOVEROPS — Final Specification & Architecture Baseline • Razorpay Track 03*
