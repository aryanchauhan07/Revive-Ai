# 🎙️ Revive AI: Hackathon Video & Presentation Master Script
### ⏱️ Target Duration: 3:00 – 4:30 Minutes | Focus: Action Cues + Deep Technical Architecture

---

## 🎬 Screen-by-Screen Action & Spoken Script

```
                                  PRESENTATION FLOW
 ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
 │ 1. Command Center│───▶│2. Payment Health │───▶│3. Recovery Cases │───▶│4. Approval Queue │
 │ (Dashboard & SRE)│    │ (Circuit Breaker)│    │ (AI Brain & Matrix)   │ (Safety & Policy)│
 └──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
                                                                                   │
 ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐              │
 │7. Summary & Wrap │◀───│6. 2k Benchmark   │◀───│5. Razorpay Pay   │◀─────────────┘
 │ (Audit & SHA-256)│    │ (Batch Engine)   │    │ (HMAC Verification)
 └──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

### 📍 STEP 1: Command Center & System Overview (0:00 – 0:50)
* **Tab to Open:** `Command Center` (Main Dashboard)
* **🖱️ Mouse Actions:** 
  1. Hover over the **4 Top Metric Cards** (Revenue Recovered, Recovery Success Rate, Risk Prevented, Pending Approvals).
  2. Point to the **Active Bank Outage Warning Banner** in the middle.
  3. Move mouse across the **6 Top Navigation Tabs** (Payment Health $\rightarrow$ Incidents $\rightarrow$ Recovery Cases $\rightarrow$ Approval Queue $\rightarrow$ Autonomy Policy $\rightarrow$ 2k Benchmark).
  4. Scroll down slightly to show the **Recent Failed Cases Table** on the left and the **Real-Time Audit Stream** on the right.

> **🗣️ WHAT YOU SAY:**
> 
> "Imagine this: You are booking movie tickets on **BookMyShow**, ordering dinner on **Zomato**, or buying sneakers during a **Diwali flash sale**. 
> 
> You enter your UPI PIN, the spinner keeps rotating, and suddenly — **'Payment Failed: Bank Server Timeout'**.
> 
> What happens next? 8 out of 10 Indian shoppers just close the app and give up.
> 
> In India, over **₹10,000 Crores of genuine transactions fail every single day** — not because customers lack money, but because of temporary bank server crashes, UPI latency, or recurring mandate timing deficits.
> 
> Today, merchants make two costly mistakes:
> 1. They blindly hammer broken bank rails with retries that lock customer accounts.
> 2. Or they panic and bleed profit margins giving away unnecessary 20% discount coupons.
> 
> **This is Revive AI** — an autonomous, policy-governed revenue recovery engine built directly on top of Razorpay infrastructure.
> 
> Before we dive in, let me give you a quick tour of our **Command Center Dashboard**:
> - At the top, we track our core KPIs: **₹2.41 Lakhs in verified recovered revenue**, an **88.4% recovery success rate**, and **₹3.42 Lakhs in risk prevented** by suppressing failing retries.
> - Below the metrics, we have an **Active Bank Outage Warning Banner** detecting live gateway anomalies.
> - On the lower left, we have our **Recent Failed Transactions Table**, and on the right, our **Real-Time SHA-256 Audit Stream** logging every decision.
> - And across the top navigation bar, we have architected **6 specialized modules**:
>   1. **Payment Health** — Real-time bank SRE monitoring and automated circuit breakers.
>   2. **Incidents** — Grouping failed transactions into bank outage cohorts.
>   3. **Recovery Cases** — Individual customer recovery powered by Google Gemini AI and live Razorpay checkout.
>   4. **Approval Queue** — Human-in-the-loop review for high-ticket VIP orders.
>   5. **Autonomy & Policy** — Merchant guardrail rules and 1-millisecond Kill Switch.
>   6. **2k Benchmark** — 2,000-event synthetic scale simulation measuring incremental revenue lift.
> 
> Now, let’s see how each of these technical layers works live!"

---

### 📍 STEP 2: SRE Telemetry & Circuit Breaker (0:35 – 1:05)
* **Tab to Open:** Click **`Payment Health`** in the top navigation bar.
* **🖱️ Mouse Actions:**
  1. Scroll down to the **HDFC Bank UPI Degradation** card.
  2. Point to the red **38% Success Rate** (crashed from 88% baseline) and the **Z-Score -4.2**.
  3. Highlight the green **`CIRCUIT BREAKER: TRIPPED`** badge.

> **🗣️ WHAT YOU SAY:**
> 
> "Revive starts with real-time payment telemetry. Over 5-minute sliding windows, our backend monitors error codes across issuers and methods.
> 
> Here, our system detected that **HDFC Bank UPI authorization success crashed from 88% down to 38%** with a **-4.2 Z-score anomaly**.
> 
> Instead of hammering HDFC UPI with blind retries, Revive **automatically tripped a Circuit Breaker**. It suppresses same-rail retries and shifts customers to healthy alternate rails like Cards or Netbanking."

---

### 📍 STEP 3: AI Decision Brain & Multi-Action Matrix (1:05 – 1:50)
* **Tab to Open:** Click **`Recovery Cases`** in the top navigation bar.
* **🖱️ Mouse Actions:**
  1. Select **`CASE-101 (Ananya Roy - ₹4,850)`**.
  2. Point to the **AI Root-Cause Diagnosis** badge (*Temporary HDFC UPI auth server timeout*).
  3. Scroll through the **8-Candidate Action Matrix** and highlight the optimal choice (*SWITCH_PAYMENT_METHOD*).
  4. (Optional) Click the purple **`AI Reason (Gemini 2.5)`** button to show the structured JSON tool-call schema.

> **🗣️ WHAT YOU SAY:**
> 
> "Let’s inspect **CASE-101 — Ananya Roy (₹4,850)**.
> 
> This is Revive’s **AI Decision Brain**, powered by Google Gemini 2.5 Flash and our deterministic recovery matrix.
> 
> Revive evaluates 8 candidate actions: *Wait, Retry, Switch Payment Method, Create Payment Link, WhatsApp Message, Dynamic Incentive, Human Escalation, or Stop*.
> 
> Crucially, Revive does **not** simply pick the highest probability action. It optimizes for **Expected Net Recovery**:
> $$\text{Expected Net} = P(\text{Recovery}) \times \text{Amount} - \text{Intervention Cost} - \text{Policy Penalty}$$
> 
> In this case, retrying UPI during an outage has an 84% failure rate. Revive recommends **Switch Payment Method + 1-Click Payment Link** via WhatsApp, delivering **₹4,849.50 in expected net recovery** with ₹0 wasted discounts."

---

### 📍 STEP 4: Approval Queue & Policy Guardrails (1:50 – 2:25)
* **Tab to Open:** Click **`Approval Queue`** in the top navigation bar.
* **🖱️ Mouse Actions:**
  1. Show **`CASE-103 (Rajesh Sharma - ₹34,999)`** flagged for review.
  2. Point to the yellow alert badge: **`RULE: HIGH_VALUE_FLOOR (₹34,999 ≥ ₹25,000)`**.
  3. Click the green **`Approve & Execute`** button.
  4. Notice the green confirmation toast and that the case vanishes from the pending review queue.

> **🗣️ WHAT YOU SAY:**
> 
> "Here is our core philosophy: **AI proposes, but Policy governs money movement.**
> 
> Before any action executes, Revive runs an **Execution-Time Fail-Closed Policy Check**:
> - If an order is high-value — like **Rajesh Sharma’s ₹34,999 purchase** — it requires explicit Senior Manager approval.
> - If the time is within **Quiet Hours (22:00 to 08:00 IST)**, outreach is scheduled for 08:00 IST.
> - If a customer sends **`STOP`**, outreach is permanently paused in a terminal state.
> 
> When I click **'Approve & Execute'**, manager sign-off is logged, and the recovery link is dispatched."

---

### 📍 STEP 5: Razorpay Checkout & Cryptographic HMAC Verification (2:25 – 3:10)
* **Tab to Open:** Go back to **`Recovery Cases`** $\rightarrow$ select **`CASE-101 (Ananya Roy)`**.
* **🖱️ Mouse Actions:**
  1. Click the blue **`Pay Link`** button to open the checkout modal.
  2. Click **`Proceed to Razorpay Checkout`** (or open official Razorpay test modal).
  3. Complete payment with test details.
  4. Point to the green **`HMAC Signature Verified & Settled`** badge, showing `Payment ID` and `Order ID`.
  5. Close modal $\rightarrow$ click the **`Recovered`** filter pill to show the case safely settled.

> **🗣️ WHAT YOU SAY:**
> 
> "Now let’s look at our **Razorpay Integration**:
> 
> 1. **Server-Side Orders API**: When checkout opens, our backend calls `POST /api/create-order` which invokes `razorpay.orders.create()`. This locks the exact payable amount on the server, preventing client-side price tampering.
> 2. **Client SDK**: We mount Razorpay’s official `checkout.js` SDK passing the verified `order_id`.
> 3. **Cryptographic HMAC-SHA256 Verification**: When payment completes, Razorpay returns a cryptographic signature. In `/api/verify-payment`, we recompute the HMAC-SHA256 hash using `crypto.timingSafeEqual` to prevent timing attacks.
> 
> **A case is ONLY marked `RECOVERED` when genuine payment cryptographic proof is validated.**
> 
> When verified, Revive automatically cancels all queued outreach actions, ensuring the customer is never spammed after paying."

---

### 📍 STEP 6: 2k Event Batch Measurement Benchmark (3:10 – 3:45)
* **Tab to Open:** Click **`2k Benchmark`** in the top navigation bar.
* **🖱️ Mouse Actions:**
  1. Click the blue button: **`Run 2,000 Event Benchmark`**.
  2. Wait 1 second for the benchmark grid to populate.
  3. Point to the comparison cards:
     - **Baseline A (No Action)**: Natural self-recovery rate (~12.2%).
     - **Baseline B (Generic Retries)**: High failure rate (~27.2%).
     - **Revive AI Agent (Winner)**: **74.9% recovery rate** with **₹2.79 Lakhs incremental net lift**.
  4. Point to **`0 Policy Violations`** and **`Deterministic Seed 20260828`**.

> **🗣️ WHAT YOU SAY:**
> 
> "Finally, we prove Revive’s performance with our **2,000-Event Batch Evaluation Engine**.
> 
> When I click **'Run 2,000 Event Benchmark'**, the backend executes a reproducible Monte Carlo simulation with a fixed PRNG seed (`20260828`) across 3 control groups:
> 1. **Baseline A**: Natural customer recovery with zero outreach ($12.2\%$).
> 2. **Baseline B**: Blind retries and generic reminders ($27.2\%$).
> 3. **Revive AI**: Achieves a **74.9% recovery rate**, delivering a **+47.6% incremental recovery lift** and **187x ROI** with **zero policy violations**.
> 
> This proves algorithmic consistency across thousands of transactions."

---

### 📍 STEP 7: Conclusion & Wrap-Up (3:45 – 4:00)
* **Tab to Open:** Click **`Command Center`**.
* **🖱️ Mouse Actions:** Scroll down to the **Append-Only SHA-256 Audit Stream** showing immutable audit blocks.

> **🗣️ WHAT YOU SAY:**
> 
> "To close: every state transition — from webhook ingress to AI reasoning to payment capture — is sealed in our **Append-Only SHA-256 Hash-Chained Audit Ledger**, verified by **8 passing automated test suites**.
> 
> **AI proposes. Policy governs. Razorpay executes. And verified outcomes teach the next decision.**
> 
> Revive AI turns lost transactions into recovered revenue. Thank you!"

---

## 🎯 Quick Rehearsal Cheat-Sheet

| Timestamp | Tab to Click | Key Highlight | Click Action |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:35** | `Command Center` | ₹2.41L Recovered, 88.4% Success Rate | Hover metrics & point at top nav |
| **0:35 – 1:05** | `Payment Health` | HDFC UPI 88% $\rightarrow$ 38% crash | Point at Tripped Circuit Breaker |
| **1:05 – 1:50** | `Recovery Cases` | $E[\text{Net}]$ Decision Matrix (8 Actions) | Select `CASE-101`, click `AI Reason` |
| **1:50 – 2:25** | `Approval Queue` | Fail-closed policy & ₹25k VIP floor | Click `Approve & Execute` on Rajesh Sharma |
| **2:25 – 3:10** | `Recovery Cases` | Server Order + HMAC Verification | Click `Pay Link` $\rightarrow$ Complete test payment |
| **3:10 – 3:45** | `2k Benchmark` | +47.6% lift vs generic control groups | Click `Run 2,000 Event Benchmark` |
| **3:45 – 4:00** | `Command Center` | SHA-256 sealed audit ledger | Scroll to Audit Stream & conclude |
