# 📘 RECOVEROPS — Tab-by-Tab Plain English Guide & 5-Minute Video Pitch Script

---

# 📑 PART 1: Tab-by-Tab Plain English User Guide

This section explains what every single tab in the platform does in simple language, what features are on that page, and what outcome you should expect.

---

### 1. 📊 Command Center (`CommandCenter.jsx`)
* **What is this page for?**
  * This is the **executive cockpit** for the merchant's finance and payment operations team. It gives a real-time summary of revenue at risk, money already recovered, active recovery cases, and live system health.
* **Key Features on this Page:**
  * **Top Metric Cards:** Shows Total Revenue at Risk (e.g. ₹2.03 Lakhs), Recovered Revenue, Active Incidents, and Recovery Rate (84.8%).
  * **Payment Rail Health Curve:** Real-time visualization showing live success rate vs. historical baseline across UPI, Cards, Netbanking, and AutoPay.
  * **Active Cases Table:** List of failed transactions with customer names, amounts, failure reasons, and quick action buttons (`1-Click Link`, `WhatsApp`, `Voice Call`).
* **Expected Outcome:**
  * You immediately see the financial pulse of your store and can trigger 1-click interventions for any individual transaction.

---

### 2. ⚡ Payment Health — Payment SRE Intelligence (`PaymentHealth.jsx`)
* **What is this page for?**
  * This is the **Payment SRE (Site Reliability Engineering) layer**. Instead of treating every payment failure as a customer problem, this page determines if a failure is an **individual glitch** or part of a **massive bank/ecosystem outage**.
* **Key Features on this Page:**
  * **SRE Blast Radius Telemetry:** Shows how many transactions and how much revenue are at risk across degraded bank rails.
  * **Degraded Rail Cards:** Cards showing HDFC UPI (38% success), ICICI Cards (68%), and SBI AutoPay (72%).
  * **Recovery Circuit Breaker:** Shows `STATUS: TRIPPED`. When a bank is failing, the system **automatically stops useless retries** on that bank (preventing customer frustration and bank retry penalties) and steers customers to alternate methods (Cards/Netbanking).
  * **Trigger Live Anomaly Button:** A live demo button that simulates a bank outage in real time.
* **Expected Outcome:**
  * Proves that the platform intelligently isolates macro bank outages and prevents retry storms.

---

### 3. 🔍 Incidents — Revenue Incident Inspector (`IncidentInspector.jsx`)
* **What is this page for?**
  * Provides **closed-loop degradation diagnosis and customer cohort drill-down**.
* **Key Features on this Page:**
  * **Active Incidents List (Left Column):** 3 distinct incidents:
    1. `INC-901`: HDFC Bank UPI Authorization Degradation (5 Customers • ₹59,249)
    2. `INC-902`: ICICI Card 3DS Timeout (3 Customers • ₹47,300)
    3. `INC-904`: SBI AutoPay Balance Deficit (2 Customers • ₹21,300)
  * **Root-Cause Diagnosis & AI Approach (Right Top):** Plain-English explanation of why the rail failed and what AI recommends.
  * **Affected Customer Cohort Table (Right Bottom):** Shows the exact customers affected by that specific incident, their unique amounts (₹4,850 to ₹28,500), and individual recovery plans.
* **Expected Outcome:**
  * Clicking an incident immediately shows its specific root-cause evidence and individualized customer remediation list.

---

### 4. 🧠 Recovery Cases — Recovery Decision Brain & Omnichannel (`CaseTimeline.jsx`)
* **What is this page for?**
  * Demonstrates the **Recovery Decision Brain** and **Omnichannel Recovery Execution**.
* **Key Features on this Page:**
  * **8-Action Financial Utility Economics Matrix:** For any selected customer, calculates and displays:
    1. Estimated Recovery Probability (e.g. 78%)
    2. Gross Recovered Amount (e.g. ₹6,499)
    3. Cost of Intervention (e.g. ₹1.95)
    4. Policy / Risk Impact
    5. **Expected Net Recovery Value** (Chooses the action that maximizes net financial return).
  * **Interactive Omnichannel Action Buttons:**
    - 🎙️ **`Voice` Button:** Opens the **Hinglish Voice Call Sandbox** with real browser audio synthesis.
    - 💬 **`WhatsApp` Button:** Opens the **Interactive WhatsApp Drawer** with pre-filled Hinglish templates and payment links.
    - 💳 **`Pay Link` Button:** Opens the **Razorpay 1-Click Checkout Modal** to simulate customer payment capture in test mode with confetti.
  * **Promise-to-Pay (PTP) Tracker:** Interactive calendar picker where a customer's promised payment date can be set, automatically pausing outreach cadence until that date.
* **Expected Outcome:**
  * Demonstrates that the AI doesn't just guess—it mathematically calculates the highest ROI recovery action and executes it across Voice, WhatsApp, and Razorpay Links.

---

### 5. 🛡️ Approval Queue — Human-in-the-Loop Governance (`ApprovalCenter.jsx`)
* **What is this page for?**
  * The **compliance & governance gateway**. Ensures high-risk or high-value actions are never executed without human sign-off.
* **Key Features on this Page:**
  * **Policy Trigger Category Tabs:**
    - 👑 **`₹20k+ VIP`**: High-value transactions (Priya Patel ₹28,500, Aditya Verma ₹23,900).
    - 🏷️ **`Discount Review`**: Margin-protection reviews where a proposed dynamic discount exceeds the auto-limit (Sneha Mehta ₹6,499 with 3% discount).
    - 🟡 **`₹10k - ₹20k`**: Mid-tier high-value cases.
    - 🔵 **`₹1k - ₹10k`**: Standard orders.
    - 🛡️ **`Pending Approvals`** & **`Autonomous Cases`**.
  * **Explicit Policy Rule Box on Every Card:** Explains the exact rule name (e.g. `RULE: HIGH_VALUE_FLOOR_EXCEEDED` or `RULE: DYNAMIC_INCENTIVE_CAP_EXCEEDED`) and why human review is required.
  * **`Approve & Execute Action` Button:** Executes the action immediately and removes it from the pending queue.
  * **`Reject & Stop` Button:** Terminates outreach and blocks side effects.
* **Expected Outcome:**
  * Shows enterprise-grade compliance where low-risk actions run autonomously while VIP and sensitive cases are governed by human managers.

---

### 6. ⚙️ Autonomy & Policy — Control Engine (`AutonomyPolicy.jsx`)
* **What is this page for?**
  * The merchant's **governance control panel** where managers configure AI autonomy levels, quiet hours, and financial ceilings.
* **Key Features on this Page:**
  * **Autonomy Mode Selector:** `OBSERVE` (Read-only recommendation) vs `ASSIST` (Human-in-the-loop) vs `AUTOPILOT` (Full autonomy within bounds).
  * **DND Quiet Hours:** Configurable customer contact windows (default 22:00 to 08:00 IST) to respect anti-spam regulations.
  * **Financial Thresholds:** High-Value Approval Floor (₹), Auto-Discount Cap (%), and Max Absolute Discount Ceiling (%).
  * **Emergency Kill Switch:** Red master button that instantly freezes all autonomous messaging, payment retries, and discount dispatches across all rails.
  * **Save Policy with Floating Toast Notification:** Saving policy changes immediately triggers a green confirmation toast and re-evaluates all active customer queues in real time.
* **Expected Outcome:**
  * Changing a threshold (e.g. lowering the floor to ₹10,000) immediately reflects in the Approval Queue with zero page reloads.

---

### 7. 📈 2k Batch Evaluation — Attribution & Outcome Feedback (`BatchEvaluator.jsx`)
* **What is this page for?**
  * The **attribution and benchmark engine**. Proves that RECOVEROPS delivers measurable ROI over a massive batch of 2,000 real-world payment failure events.
* **Key Features on this Page:**
  * **Run 2,000-Event Simulation Button:** Executes a deterministic Mulberry32 seeded Monte Carlo simulation across 23 failure scenarios.
  * **Financial ROI Scorecard:**
    - Gross Revenue at Risk: **₹77.6 Lakhs**
    - Incremental Revenue Recovered: **₹65.8 Lakhs (84.8% Recovery Rate)**
    - Cost of Recovery: **₹1.82 Lakhs**
    - Net ROI Multiplier: **35.1x Return on Recovery Cost**
    - Policy Violations: **0 (100% Compliance)**
  * **Attribution Split:** Shows Natural Self-Recovery vs Incremental AI Recovered Revenue.
* **Expected Outcome:**
  * Proves statistically that the system produces verifiable financial ROI while maintaining 100% policy safety.

---

# 🎬 PART 2: 5-Minute Video Walkthrough Pitch Script

> **⏱️ Total Target Duration:** Exactly 5 Minutes (300 Seconds)  
> **🎯 Goal:** Walk the judges through the full end-to-end user journey showing the problem, intelligence, execution, governance, and measured ROI.

---

### ⏱️ [0:00 – 0:45] The Hook & Problem Statement
* **Screen:** Open **[http://localhost:5173](http://localhost:5173)** on the **Command Center**.
* **What to Say:**
  > *"Hello judges! Revenue loss in digital commerce rarely happens in one clean step. It happens when bank rails degrade, checkouts get abandoned, subscriptions fail, or corporate invoices go overdue.*
  >
  > *Most AI agents in the market are simple prompt wrappers that blindly recommend retrying. But retrying during a bank outage only creates retry storms, angers customers, and costs money.*
  >
  > *Welcome to **RECOVEROPS** — an autonomous Payment SRE Intelligence and AI Revenue Recovery Engine built specifically for the Razorpay ecosystem. It doesn't guess; it diagnoses payment failures, calculates expected net financial utility, executes bounded omnichannel recovery, and proves measured ROI with an immutable audit trail. Let's look at it live."*

---

### ⏱️ [0:45 – 1:45] Payment SRE Intelligence & Incidents
* **Action:** Click on the **"Payment Health"** tab in the navigation bar.
* **What to Point Out:** Point to the **SRE Blast Radius** cards and the **Circuit Breaker**.
* **What to Say:**
  > *"First, let's look at our **Payment SRE Intelligence layer**. Here on Payment Health, the system continuously analyzes rolling success rates across every payment rail.*
  >
  > *Notice that **HDFC Bank UPI** has experienced a sharp degradation down to 38%. Instead of spamming retries on a broken bank, RECOVEROPS has tripped a **Recovery Circuit Breaker** to suppress all same-rail retries and steer customers to alternate rails like Cards and Netbanking.*
  >
  > *(Click on the **'Incidents'** tab)*
  >
  > *Here in the **Revenue Incident Inspector**, the system isolates the incident into distinct cohorts. For example, `INC-901` isolates 5 affected customers with ₹59,249 at risk. We can see each customer's individualized diagnosis and AI recovery approach."*

---

### ⏱️ [1:45 – 2:45] Recovery Decision Brain & Interactive Omnichannel Execution
* **Action:** Click on the **"Recovery Cases"** tab. Select **Ananya Roy** or **Sneha Mehta**.
* **What to Point Out:** Show the **8-Action Economics Matrix**, then click the **`Voice`** button and **`Pay Link`** button.
* **What to Say:**
  > *"Now let's see how RECOVEROPS decides what action to take. In **Recovery Cases**, we see our **Recovery Decision Brain**.*
  >
  > *For every case, the system evaluates an **8-action financial utility matrix**: calculating estimated recovery probability, gross recovery, action cost, and expected net value. It strictly chooses the action that maximizes net financial recovery.*
  >
  > *Let's see how it executes:*
  >
  > 1. *(Click **'Simulate Voice Call'**)*: *'Here is our bilingual Hinglish voice agent powered by Web Speech API. It engages the customer politely in Hinglish, diagnoses their payment drop, and offers to send an instant recovery link directly to their WhatsApp.' (Play 5 seconds of audio).*
  > 2. *(Click **'Pay Link'**)*: *'Here is our Razorpay 1-Click Checkout simulator. When the customer completes checkout, payment is captured in test mode with zero API keys required, updating our Bayesian learning models in real time!'*
  > 3. *'We also feature a **Promise-to-Pay (PTP) tracker** to pause outreach until the customer's promised pay date.'*

---

### ⏱️ [2:45 – 3:45] Human-in-the-Loop Governance & Policy Control
* **Action:** Click on the **"Approval Queue"** tab, then switch to the **"Autonomy & Policy"** tab.
* **What to Point Out:** Show the **VIP Orders (≥ ₹20k)** and **Discount Reviews**, then adjust a threshold and click **Save Policy**.
* **What to Say:**
  > *"Next is our **Policy & Governance Gateway**. Real fintech systems require fail-closed compliance.*
  >
  > *In the **Approval Queue**, low-risk standard transactions run 100% autonomously, while high-value orders like **Priya Patel (₹28,500)** and dynamic discount reviews like **Sneha Mehta (3% discount)** are automatically flagged for human manager sign-off with clear policy rationale boxes.*
  >
  > *(Switch to **'Autonomy & Policy'** tab)*
  >
  > *In the Policy Control Engine, merchants can configure autonomy modes (OBSERVE, ASSIST, AUTOPILOT), DND quiet hours (22:00 to 08:00 IST), and financial floors. When we click **'Save Policy Changes'**, notice the real-time floating confirmation toast and how all queues dynamically re-evaluate in real time!"*

---

### ⏱️ [3:45 – 4:40] Attribution & 2,000-Event Benchmark
* **Action:** Click on the **"2k Batch Evaluation"** tab. Click the blue **"Run 2,000-Event Simulation"** button.
* **What to Point Out:** Show the **35.1x ROI**, **84.8% Recovery Rate**, and **0 Policy Violations**.
* **What to Say:**
  > *"Finally, we come to **The Bar** of Track 03: proving measured money recovered across a large batch.*
  >
  > *In the **2k Batch Evaluation** dashboard, we run a deterministic Monte Carlo simulation across 2,000 real-world payment failure scenarios with Mulberry32 seeded PRNG reproducibility.*
  >
  > *Out of **₹77.6 Lakhs** of revenue at risk, RECOVEROPS recovered **₹65.8 Lakhs** — achieving an **84.8% recovery rate** and an incredible **35.1x return on recovery cost**, with **zero policy violations** and a complete cryptographic audit trail."*

---

### ⏱️ [4:40 – 5:00] Conclusion & Razorpay Vision
* **Screen:** Return to the **Command Center** dashboard.
* **What to Say:**
  > *"To summarize: RECOVEROPS is not just another chatbot. It is a comprehensive, production-oriented Payment SRE and Revenue Recovery Engine that turns lost transactions into recovered gross revenue with enterprise safety and mathematical rigor.*
  >
  > *Thank you, judges! We look forward to your questions."*

---

### 💡 Pro-Tips for Your 5-Minute Recording:
1. **Resolution:** Record at 1080p (1920x1080) at 100% browser zoom for crisp text.
2. **Audio:** Unmute the browser tab before clicking "Simulate Voice Call" so the Web Speech API voice is clearly audible.
3. **Pacing:** Keep your mouse movements smooth and deliberate as you switch between tabs.
4. **Guided Banner:** You can also use the top **"Architecture Demo Journey"** banner to jump between steps effortlessly!
