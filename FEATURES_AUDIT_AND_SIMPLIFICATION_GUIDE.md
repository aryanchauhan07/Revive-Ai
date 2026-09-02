# 📊 Revive AI: Feature Audit & Simplification Guide

> **Goal:** Identify which features are **mission-critical** to win Razorpay Track 03 (AI Revenue Recovery), which features are **secondary / bloat**, and what you can safely hide or streamline for a crisp 3-minute demo.

---

## 🏆 1. The Core 5: Mission-Critical Features (Must Keep)

These 5 features directly fulfill the core evaluation criteria of **Razorpay Hackathon Track 03**:

| # | Feature | Why Judges Need It | Status |
|---|---|---|---|
| **1** | **Payment SRE Anomaly Detection** (`Payment Health` tab) | Shows Revive AI detecting real bank degradations (HDFC/SBI/Axis) before customer churn occurs. | 🟢 **Essential** |
| **2** | **Google Gemini 2.5 Flash Decision Agent** (`AI Reason` button) | Proves autonomous LLM reasoning with root-cause diagnosis and explainable financial utility. | 🟢 **Essential** |
| **3** | **Policy & Governance Gateway** (`Approval Queue` & `Kill Switch`) | Demonstrates enterprise safety floors (₹20k VIP limit, discount caps, DND quiet hours). | 🟢 **Essential** |
| **4** | **Real Razorpay Web Checkout** (`Pay Link` button) | Uses official `checkout.js` + server-side HMAC-SHA256 signature verification. | 🟢 **Essential** |
| **5** | **Signed Webhook Replay Sandbox** (`Navbar` button) | Allows judges to test HMAC-signed webhooks in 1 click without waiting hours for real card drops. | 🟢 **Essential** |

---

## ⚠️ 2. Low-Value / Bloat Features (Can Simplify or Hide)

These features added depth during development, but are **not strictly necessary** for the hackathon judging presentation and may add visual clutter:

### 1. 📉 **2k Batch Evaluation Tab**
* **What it does:** Runs a Monte Carlo simulation over 2,000 synthetic transactions to calculate aggregate true vs false intervention rates.
* **Why it's secondary:** In a 3-minute pitch, judges will not wait to inspect 2,000 synthetic data rows. They care about 1 live end-to-end recovery story on real Razorpay rails.
* **Recommendation:** Keep it as a tab for technical judges who specifically ask, but **do not spend presentation time on it**.

---

### 2. 📞 **Hinglish AI Voice Call Sandbox Modal**
* **What it does:** Simulates an interactive automated phone call in Hinglish with an AI voice agent.
* **Why it's secondary:** Razorpay Track 03 is primarily about **payment gateways, WhatsApp links, and webhook recovery loops**. A simulated voice call is flashy, but judges know it's not a native Razorpay API.
* **Recommendation:** Keep as a secondary demo button; focus the main demo on the **WhatsApp 1-Click Razorpay Pay Link**.

---

### 3. 🧩 **Over-Detailed 8-Action Economics Matrix Table**
* **What it does:** Displays an 8-row table comparing gross recovery, outreach cost, discount loss, and expected net value for all 8 actions.
* **Why it's secondary:** While mathematically rigorous, displaying all 8 actions on screen at once can make the UI feel overwhelming or cluttered.
* **Recommendation:** Keep the collapsed / simplified 3-card recommendation view as the primary view.

---

### 4. 🗂️ **Excess Scenario Options in the Simulation Dropdown**
* **What it does:** Dropdown offers 5 different scenarios (HDFC UPI, ICICI Card, SBI Mandate, B2B Invoice, etc.).
* **Why it's secondary:** Having 5 different scenarios can cause demo paralysis or confusion.
* **Recommendation:** Focus the live demo on **Scenario 1 (HDFC UPI Anomaly)** and **Scenario 2 (High-Value VIP Order)**.

---

## 🎯 3. Recommended 3-Minute Hackathon Demo Script

To make your presentation sharp, clean, and impressive, follow this 4-step story:

```
Step 1: Payment SRE (Payment Health)
  ↳ Show HDFC Bank UPI dropping to 38% success rate
  ↳ Show Circuit Breaker suppressing failing retries

Step 2: AI Autonomous Reasoning (Command Center / AI Reason)
  ↳ Click "AI Reason" on Ananya Roy (₹4,850)
  ↳ Show Google Gemini 2.5 Flash recommending alternate rail (Cards/Netbanking) with ₹0 discount

Step 3: Enterprise Policy & Kill Switch (Autonomy & Policy)
  ↳ Show how high-value orders (> ₹20,000) or Kill Switch engagement routes cases to Approval Queue
  ↳ Show 1-click human manager approval

Step 4: Real Razorpay Web Checkout (Recovery Cases)
  ↳ Click "Pay Link" → opens authentic Razorpay checkout modal (checkout.js)
  ↳ Complete test payment → watch server verify HMAC-SHA256 signature and seal the append-only ledger block!
```
