# 🎙️ Revive AI: 5-Minute Hackathon Winning Presentation Script

> **Goal:** Complete line-by-line script in simple everyday English, starting with a **thorough Dashboard / Command Center walkthrough**, followed by the SRE engine, Google Gemini AI diagnosis, Policy approvals, and real Razorpay checkout.
> **Total Time:** 5 Minutes (300 seconds)

---

## ⏱️ Video & Presentation Timeline at a Glance

| Time | Page to Show | Screen Actions | What You Explain in Simple English |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:15** | **Command Center (Dashboard)** | Walk through the 4 top metrics, live incident banner, and activity stream | **The Hook & Dashboard:** Why ₹10k Cr fails daily, what Revive AI does, and how the dashboard tracks every recovered Rupee. |
| **1:15 – 2:00** | **Payment Health** | Show HDFC UPI drop (38%) & Circuit Breaker | **Payment SRE:** How Revive AI catches bank crashes before customers churn. |
| **2:00 – 3:00** | **Recovery Cases** | Click **"AI Reason"** on Ananya Roy | **Google Gemini AI:** Root-cause diagnosis and picking the cheapest fix (₹0 discount). |
| **3:00 – 3:50** | **Approval Queue & Policy** | Approve Rajesh Sharma (₹34k) & point to Kill Switch | **Safety & Governance:** High-value order controls and instant emergency stop. |
| **3:50 – 4:35** | **Recovery Cases (Live Checkout)** | Click **"Pay Link"** $\rightarrow$ complete test card | **Real Razorpay Checkout:** `checkout.js` modal + HMAC-SHA256 server signature check. |
| **4:35 – 5:00** | **Command Center & Wrap-up** | Point to SHA-256 Ledger & final ROI | **The Result:** 49.7% more revenue recovered without eating merchant profits. |

---

## 📜 Full Word-for-Word Spoken Script

---

### 🎬 ACT 1: Introduction & Dashboard Walkthrough (0:00 – 1:15)
📍 **Page:** `Command Center` (Main Dashboard)  
🖱️ **Actions:** 
1. Hover cursor over the **4 top metric cards** one by one.
2. Point to the **Active Incident Alert Banner** (HDFC Bank degradation).
3. Scroll down slightly to show the **Live Recovery Activity Stream**.

> **🗣️ WHAT YOU SAY:**
> 
> "Hello everyone and respected judges!
> 
> Did you know that every single day in India, over **₹10,000 Crores of valid online transactions fail** due to bank server timeouts, UPI glitches, and checkout drops?
> 
> When this happens, merchants lose customers forever, or they panic and give away huge 20% discounts that destroy their profit margins.
> 
> **Meet Revive AI** — an intelligent, autonomous revenue recovery agent built directly on top of Razorpay infrastructure.
> 
> Let's start right here on our **Command Center Dashboard**, which gives merchants a 360-degree real-time view of their recovered revenue:
> 
> - **Card 1: Total Revenue Recovered (₹2,41,400)** — This is real money that would have been lost to payment drop-offs, recovered with an 88.4% success rate.
> - **Card 2: Net Recovery Rate (49.7%)** — Nearly half of all failed checkout attempts are successfully rescued on autopilot.
> - **Card 3: Bank Outage Risk Prevented (₹3,42,000)** — Revenue saved by suppressing failing bank retries during outages.
> - **Card 4: Human Approvals Queue (0 Pending)** — Shows whether high-value VIP orders need manager attention.
> 
> Right below the numbers, our dashboard shows an **Active Bank Degradation Alert** and a **Live Real-Time Activity Feed** tracking every customer recovery as it happens."

---

### 🎬 ACT 2: Real-Time Payment SRE Intelligence (1:15 – 2:00)
📍 **Page:** Click on the `Payment Health` tab in the navbar.  
🖱️ **Action:** Scroll down to the **HDFC Bank UPI Authorization Degradation** card. Point to the red **38% Success Rate** and the green **Circuit Breaker Active** badge.

> **🗣️ WHAT YOU SAY:**
> 
> "Now let's see how Revive AI detects problems before customers even complain.
> 
> Under **Payment Health**, Revive AI acts as an SRE monitoring system for Indian payment rails.
> 
> Right here, our telemetry noticed that **HDFC Bank UPI success rates suddenly plummeted from 88% down to 38%**.
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
> "Now let’s look at how Revive AI handles individual customer cases.
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
2. **Cursor Movement:** Move your mouse smoothly to each button 1 second before you click it.
3. **Zoom Level:** Keep your browser at 100% (or 90%) for the best looking 1080p video recording.
