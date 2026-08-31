# RECOVEROPS: Complete System Mechanics & Architecture Guide
**Track 03: AI Revenue Recovery • Razorpay AI Buildathon 2026**

---

## 1. The Big Picture: What Problem Does RECOVEROPS Solve?

### The Traditional Problem (How Most Companies Lose Money)
When an online payment fails today, most companies do one of two dumb things:
1. **Blind Retries / Spam Dunning**: They immediately send 5 SMS messages saying *"Your payment failed, click here to try again!"* or blindly retry the card 10 times.
2. **Do Nothing**: If a customer drops off at checkout, the merchant assumes they changed their mind and loses the sale forever.

### Why This Is Broken:
- If **HDFC Bank's UPI server is down**, asking the customer to retry UPI right away will **fail 100% of the time**, frustrating the customer and burning SMS costs.
- If a customer had **insufficient balance on the 28th of the month**, retrying immediately will fail. But waiting until **salary day (1st of the month)** will succeed!
- If a customer **abandons a ₹6,499 shopping cart**, a personalized WhatsApp message with an alternate payment link or a 3% nudge can win back the order.
- If an order is **₹28,500 (High-Value)**, an AI should **never give an unauthorized discount** without a human manager's sign-off.

---

## 2. The Core Concept: A "Closed-Loop Payment SRE Agent"

Think of **RECOVEROPS** like an **Automated Emergency Room for Failed Payments**:

```
[ 1. DETECT ]  -->  [ 2. DIAGNOSE ]  -->  [ 3. POLICY CHECK ]  -->  [ 4. RECOVER ]  -->  [ 5. RECONCILE ]
Statistical          AI isolates root      Deterministic rules        Executes Pay       Measures exact
Anomaly on           cause (Bank outage    enforce budget, quiet      Link / WhatsApp    net profit &
Razorpay rails       vs Cart Drop)         hours & ₹25k approval      / Hinglish Voice   cancels stale retries
```

---

## 3. How It Works Step-by-Step (The 5-Step Engine)

### Step 1: Real-Time Anomaly Detection (Statistical Signal)
Instead of looking at one transaction in isolation, the detector monitors rolling streams of payments grouped by:
- **Payment Method**: UPI, Credit Cards, Netbanking, AutoPay.
- **Issuing Bank / PSP**: HDFC, ICICI, SBI, Axis, etc.

If HDFC UPI success rate suddenly plummets from **88% baseline down to 41%**, the engine flags an **Incident (`INC-901`)** with mathematical confidence.

---

### Step 2: Root-Cause Diagnosis & Individualized Planning
The AI Planner (or deterministic `FallbackRecoveryPlanner`) analyzes the failure reason and customer intent to build an **Action Ladder**:

| Failure Scenario | AI Diagnosis | Intelligent Strategy |
| :--- | :--- | :--- |
| **Bank Outage** (HDFC UPI Down) | `BANK_DOWNTIME` | **₹0 discount** (money isn't the problem). Suppress same-rail retries $\rightarrow$ Offer Card/Netbanking Pay Link. |
| **High-Intent Cart Drop** | `CHECKOUT_ABANDONMENT` | Dispatch WhatsApp checkout link with a dynamic 3% incentive. |
| **AutoPay Balance Deficit** | `FUNDS_UNAVAILABLE` | Pause retries $\rightarrow$ Schedule retry window for the 1st of the month (salary cycle). |
| **High-Value Order** (₹28,500) | `HIGH_VALUE_TRANSACTION` | Flag for **Human Manager Approval** before any incentive is dispatched. |

---

### Step 3: The Deterministic Policy Engine (The Safety Guardrails)
The AI is **never allowed to directly touch money or send messages without policy verification**. 
The Policy Engine evaluates **every single action** against hard merchant rules:
- **Quiet Hours DND**: If current time is 01:00 AM IST, messages are automatically scheduled for 08:00 AM IST.
- **High-Value Floor Gate**: Any order $\ge$ ₹25,000 is put in `APPROVAL_REQUIRED` mode.
- **Discount Ceiling**: Autonomous discounts capped at 2%; discounts up to 5% require manager review; discounts >5% are blocked.
- **Emergency Kill Switch**: Merchant can freeze all autonomous actions instantly with 1 click.

---

### Step 4: Omnichannel Action Execution
Once approved, the Idempotent Action Executor triggers the optimal communication channel:
1. **Razorpay Test Mode / Sandbox Payment Links**: Generates clean, secure 1-click payment links.
2. **WhatsApp Outreach**: Sends friendly notification with the payment recovery link.
3. **Hinglish AI Voice Call Sandbox**: Simulates an automated phone call in natural Hinglish (*"Namaste Rahul ji! Main Razorpay Revive AI se bol raha hoon..."*).
4. **Promise-to-Pay (PTP) Tracker**: If a customer promises to pay on a specific date (e.g. Sept 2nd), the agent pauses all automated chasers until that day.

---

### Step 5: Self-Recovery Cancellation & Revenue Reconciliation
- **Customer Self-Recovers**: If a customer retries on their own and succeeds, RECOVEROPS detects the `payment.captured` webhook and **immediately cancels all queued recovery messages**.
- **No Double Charging**: A customer is never asked to pay for an order that is already completed.
- **Measured Profit Math**:
  $$\text{Net Incremental Revenue} = \text{Recovered Money} - \text{Discounts Given} - \text{WhatsApp Messaging Costs} - \text{Baseline Recovery}$$

---

## 4. Technical Architecture & System Design

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                 WEBHOOK INGRESS & SRE                   │
                     │  • Raw HMAC SHA-256 Buffer Verification                 │
                     │  • Event Deduplication (x-razorpay-event-id)            │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │              AI RECOVERY PLANNER & SRE                  │
                     │  • Structured LLM Planner (3s Timeout Guard)            │
                     │  • FallbackRecoveryPlanner (Deterministic Rules)        │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │               POLICY & GOVERNANCE ENGINE                │
                     │  • Per-Action Policy Decisions (ALLOW / REVIEW / BLOCK) │
                     │  • Execution-Time Recheck Guard (Fail-Closed)           │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │               IDEMPOTENT ACTION EXECUTOR                │
                     │  • Stable Key: action:{case_id}:{plan_ver}:{action_id}  │
                     │  • Razorpay Test Mode API / Interactive Sandbox         │
                     │  • WhatsApp / Hinglish Voice Sandbox / PTP Tracker      │
                     └─────────────────────────────────────────────────────────┘
```

---

## 5. Summary of Key Files

- [server/core/webhookIngress.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/webhookIngress.js): Raw HMAC signature verification, idempotency deduplication, and self-recovery cancellation.
- [server/core/recoveryPlanner.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/recoveryPlanner.js): Structured diagnosis, candidate action ladders, and `FallbackRecoveryPlanner`.
- [server/core/policyEngine.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/policyEngine.js): Per-action rule evaluation, DND quiet hours, and high-value floor gates.
- [server/core/actionExecutor.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/actionExecutor.js): Stable idempotency keys, execution-time rechecks, and Razorpay API adapters.
- [server/simulation/batchSimulator.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/simulation/batchSimulator.js): 2,000-event Mulberry32 seeded benchmark simulator.
- [tests/unit.test.js](file:///c:/Users/User/OneDrive/Revive%20AI/tests/unit.test.js): Automated engineering unit test suite (`npm test`).
