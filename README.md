# RECOVEROPS (Revive AI) — Payment SRE & AI Revenue Recovery Engine
### Razorpay AI Buildathon — Track 03: AI Revenue Recovery

RECOVEROPS is an autonomous, compliant **AI Revenue Recovery Platform** that closes the loop from detecting payment degradation to diagnosing root causes, choosing least-cost interventions, executing bounded recovery workflows, and proving measured money recovered across batches with an audit trail.

---

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run backend API & webhook server (Port 3001)
npm run server

# 3. In a new terminal, run frontend UI (Port 5175)
npm run dev
```

Open **[http://localhost:5175](http://localhost:5175)** in your browser.

---

## Documentation
- [PLATFORM_GUIDE.md](file:///c:/Users/User/OneDrive/Revive%20AI/PLATFORM_GUIDE.md) — Comprehensive step-by-step user & judge guide.
- [PROBLEM_STATEMENT.md](file:///c:/Users/User/OneDrive/Revive%20AI/PROBLEM_STATEMENT.md) — Problem breakdown, Razorpay ecosystem touchpoints, and technical architecture.

---

## Key Features

1. **Statistical Anomaly Detector:** 5-minute rolling window Z-score detector for payment rail degradation.
2. **Error Model Normalization:** Classifies Razorpay failure parameters (`GATEWAY_ERROR`, `insufficient_funds`, `issuer_bank`, `checkout_abandoned`).
3. **Prioritized Action Ladder:** `WAIT` $\rightarrow$ `RETRY` $\rightarrow$ `SWITCH_METHOD` $\rightarrow$ `CREATE_LINK` $\rightarrow$ `MESSAGE` $\rightarrow$ `INCENTIVE` $\rightarrow$ `HUMAN_ESCALATION` $\rightarrow$ `STOP`.
4. **Deterministic Policy Engine:** Fail-closed governance enforcing DND Quiet Hours (22:00–08:00 IST), max retry caps, discount floors, and human escalation gates ($\ge$ ₹25,000).
5. **2,000-Event Benchmark Evaluator:** Measures incremental money recovered and policy compliance against control baselines.
6. **Zero API Key Requirement:** Built-in Razorpay Checkout & WhatsApp sandboxes so it runs 100% out-of-the-box!

---
*Built for Razorpay AI Buildathon 2026 — Track 03*
