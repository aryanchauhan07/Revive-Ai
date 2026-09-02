# 🎙️ Revive AI: 5-Minute Hackathon Winning Presentation Script

> **Goal:** Complete line-by-line script in simple everyday English, starting with a **thorough Dashboard & Platform Features Overview**, followed by the SRE engine, Google Gemini AI diagnosis, Policy approvals, and real Razorpay checkout.
> **Total Time:** 5 Minutes (300 seconds)

---

## ⏱️ Video & Presentation Timeline at a Glance

| Time | Page to Show | Screen Actions | What You Explain in Simple English |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:20** | **Command Center (Dashboard)** | Walk through top 4 metrics, alert banner, activity feed, and **point along the top navigation bar tabs** | **The Hook & Platform Roadmap:** Why ₹10k Cr fails daily, dashboard metrics, and a quick tour of all 6 core features built. |
| **1:20 – 2:00** | **Payment Health** | Show HDFC UPI drop (38%) & Circuit Breaker | **Payment SRE:** How Revive AI catches bank crashes before customers churn. |
| **2:00 – 3:00** | **Recovery Cases** | Click **"AI Reason"** on Ananya Roy | **Google Gemini AI:** Root-cause diagnosis and picking the cheapest fix (₹0 discount). |
| **3:00 – 3:50** | **Approval Queue & Policy** | Approve Rajesh Sharma (₹34k) & point to Kill Switch | **Safety & Governance:** High-value order controls and instant emergency stop. |
| **3:50 – 4:35** | **Recovery Cases (Live Checkout)** | Click **"Pay Link"** $\rightarrow$ complete test card | **Real Razorpay Checkout:** `checkout.js` modal + HMAC-SHA256 server signature check. |
| **4:35 – 5:00** | **Command Center & Wrap-up** | Point to SHA-256 Ledger & final ROI | **The Result:** 49.7% more revenue recovered without eating merchant profits. |

---

## 📜 Full Word-for-Word Spoken Script

---

### 🎬 ACT 1: Introduction, Dashboard & Platform Feature Tour (0:00 – 1:20)
📍 **Page:** `Command Center` (Main Dashboard)  
🖱️ **Actions:** 
1. Hover cursor over the **4 top metric cards** (Total Recovered ₹2.41L, Success Rate 88.4%, Risk Prevented ₹3.42L).
2. Point to the **Active Bank Alert Banner** and the **Live Activity Feed**.
3. **Move mouse across the top navigation bar tabs** to introduce the 6 core pillars of the platform.

> **🗣️ WHAT YOU SAY:**
> 
> "Hello everyone and respected judges!
> 
> Did you know that every single day in India, over **₹10,000 Crores of valid online transactions fail** due to bank server timeouts, UPI glitches, and checkout drop-offs?
> 
> When this happens, merchants lose customers forever, or they panic and give away huge 20% discounts that destroy their profit margins.
> 
> **Meet Revive AI** — an intelligent, autonomous revenue recovery agent built directly on top of Razorpay infrastructure.
> 
> Right here on our **Command Center Dashboard**, merchants get a real-time 360-degree view of their revenue health:
> - **Card 1: Total Revenue Recovered (₹2,41,400)** — Recovered with an 88.4% success rate.
> - **Card 2: Net Recovery Rate (49.7%)** — Nearly half of all failed checkout attempts rescued on autopilot.
> - **Card 3: Outage Risk Prevented (₹3,42,000)** — Money saved by stopping blind retries during bank crashes.
> - **Card 4: Human Approval Queue (0 Pending)** — Tracks high-value VIP orders needing manager attention.
> 
> Below, we have a live **Bank Outage Warning Banner** and a real-time **Activity Stream**.
> 
> To solve this problem end-to-end, we built **6 core interconnected pillars** you can see in our top bar:
> 1. **Payment Health** — Real-time bank SRE monitoring and automated circuit breakers.
> 2. **Incidents** — Grouping failed transactions into bank cohorts.
> 3. **Recovery Cases** — Individual customer recovery powered by Google Gemini AI and live Razorpay checkout.
> 4. **Approval Queue** — Human-in-the-loop governance for VIP high-ticket orders.
> 5. **Autonomy & Policy** — 1-click sliders for merchant safety rules and autonomy modes.
> 6. **2k Batch Benchmark** — Simulation engine proving algorithmic consistency at enterprise scale.
> 
> Let’s dive in and see how these work together live!"

---

### 🎬 ACT 2: Real-Time Payment SRE Intelligence (1:20 – 2:00)
📍 **Page:** Click on the `Payment Health` tab in the navbar.  
🖱️ **Action:** Scroll down to the **HDFC Bank UPI Authorization Degradation** card. Point to the red **38% Success Rate** and the green **Circuit Breaker Active** badge.

> **🗣️ WHAT YOU SAY:**
> 
> "Let’s start with where the revenue bleed begins: **Payment Health**.
> 
> Think of this page like an SRE health monitor for all payment methods in India.
> 
> Right here, Revive AI noticed that **HDFC Bank UPI success rates suddenly plummeted from 88% down to 38%**.
> 
> A standard payment gateway would keep blindly retrying the failing HDFC UPI rail, which fails again and blocks the customer's bank account.
> 
> But Revive AI instantly triggered an automated **Circuit Breaker**. It suppressed same-rail retries to prevent customer frustration and bank penalty fees, and prepared an alternate recovery rail."

---

### 🎬 ACT 3: Autonomous AI Diagnosis with Google Gemini (2:00 – 3:00)
📍 **Page:** Click on the `Recovery Cases` tab.  
🖱️ **Action:** 
1. Point to customer **Ananya Roy (₹4,850 - HDFC UPI)**.
2. Click the blue **"AI Reason"** button to open the Gemini Decision Modal.
3. Show the 3 clean sections: *1. What Happened*, *2. Recommended Action*, *3. Guardrails Verified*.

> **🗣️ WHAT YOU SAY:**
> 
> "Now let’s look at how Revive AI handles individual customer cases under **Recovery Cases**.
> 
> Here is Ananya Roy, who was trying to complete a ₹4,850 order during the HDFC UPI outage.
> 
> Let’s click **'AI Reason'** to inspect the AI's thought process.
> 
> Powered by **Google Gemini 2.5 Flash**, the AI analyzes the live failure telemetry:
> 
> 1. **What Happened?** Gemini explains in plain English: this was a temporary bank server timeout during checkout. Ananya's account was not charged.
> 2. **What is the best fix?** Instead of giving away a wasteful discount, Gemini calculated that sending a **1-Click WhatsApp Pay Link switching her to Cards or Netbanking** has an **88% chance of immediate recovery** with **₹0 discount cost**.
> 3. **Are we safe?** It automatically verified that the order is within safety limits and sent during active daytime hours."

---

### 🎬 ACT 4: Human Approval Queue & Emergency Kill Switch (3:00 – 3:50)
📍 **Page:** Click on `Approval Queue` tab, then show `Autonomy & Policy` tab.  
🖱️ **Action:** 
1. In the **Approval Queue**, point to Rajesh Sharma's high-value order (₹34,999).
2. Click the green **"Approve & Execute Action"** button.
3. In the top navbar, point to the **Kill Switch** and the **Autonomy Mode Switcher** (`OBSERVE`, `ASSIST`, `AUTOPILOT`).

> **🗣️ WHAT YOU SAY:**
> 
> "Enterprise merchants will never trust an AI without strict safety guardrails. That’s why Revive AI has **Human-in-the-Loop Policy Governance**.
> 
> In **`ASSIST` mode**, standard small orders are recovered automatically. But if an order is large — like Rajesh Sharma's ₹34,999 VIP order — it is held right here in the **Approval Queue** for a manager's 1-click authorization.
> 
> In the top bar, merchants can switch between 3 modes:
> - **`OBSERVE`**: Read-only shadow mode for testing.
> - **`ASSIST`**: Hybrid mode (AI handles small cases, humans approve high-value).
> - **`AUTOPILOT`**: 100% autonomous recovery for high-traffic flash sales.
> 
> And if there is ever an emergency, one click on the **Emergency Kill Switch** halts all automated outreach in under 1 millisecond."

---

### 🎬 ACT 5: Real Razorpay Web Checkout & Server Signature (3:50 – 4:35)
📍 **Page:** Back to `Recovery Cases` tab.  
🖱️ **Action:** 
1. Click the green **"Pay Link"** button on Ananya Roy.
2. Click **"Launch Razorpay Standard Modal (All Methods)"**.
3. The official Razorpay modal opens. Enter test card: `4111 1111 1111 1111`, expiry `12/28`, CVV `123`, and click Success.
4. Watch the green **"Payment Verified & Settled!"** screen appear.

> **🗣️ WHAT YOU SAY:**
> 
> "Now let’s look at the real payment flow.
> 
> When the customer clicks their WhatsApp recovery link, it opens the official **Razorpay Standard Checkout modal** (`checkout.js`) with UPI, Cards, and Netbanking.
> 
> Notice what happens behind the scenes:
> 1. Our backend generated a real server-authorized Razorpay Order ID to lock the price.
> 2. When I pay with this test card, Razorpay sends the payment ID and signature back to our server.
> 3. Our backend cryptographically verifies the **HMAC-SHA256 signature** before marking the order as **RECOVERED**.
> 
> This is a complete, closed-loop recovery pipeline on real Razorpay rails."

---

### 🎬 ACT 6: Tamper-Proof Audit Trail & Conclusion (4:35 – 5:00)
📍 **Page:** Click on the `Command Center` tab.  
🖱️ **Action:** Scroll down to the **Append-Only Audit Ledger** (SHA-256 SEALED) and end on the main overview.

> **🗣️ WHAT YOU SAY:**
> 
> "Finally, every action taken — from webhook ingress to AI diagnosis to verified payment capture — is cryptographically sealed into an **Append-Only SHA-256 Audit Ledger**. This gives finance teams a 100% tamper-proof audit trail.
> 
> In summary, Revive AI delivers:
> - **49.7% higher revenue recovery** from failed payments.
> - **Zero wasted discounts** by using smart payment rail switching.
> - **100% enterprise safety and governance** with real Razorpay signature verification.
> 
> Revive AI turns lost transactions into recovered profit. Thank you!"

---

## 💡 Quick Tips for a Smooth Recording:
1. **Pacing:** Speak clearly and calmly. Don't rush; the timing above leaves comfortable pauses between sentences.
2. **Cursor Movement:** Move your mouse smoothly across the top tabs when doing the feature roadmap introduction.
3. **Zoom Level:** Keep your browser at 100% (or 90%) for the best looking 1080p video recording.
