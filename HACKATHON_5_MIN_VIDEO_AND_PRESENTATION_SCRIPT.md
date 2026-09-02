# 🎙️ Revive AI: 5-Minute Hackathon Winning Presentation & Video Script

> **Track:** Razorpay Hackathon Track 03 — AI Revenue Recovery  
> **Target Duration:** Exactly 5 Minutes (300 seconds)  
> **Tone:** Confident, clear, professional, and easy to follow. No robotic jargon.

---

## ⏱️ Video & Presentation Timeline Overview

| Timestamp | Duration | Tab / Screen | Action on Screen | Core Message |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | 45 sec | **Intro / Command Center** | Point to metrics (₹2.41L Recovered, 88.4% ROI). | The ₹10,000 Cr silent revenue bleed in Indian payments. |
| **0:45 – 1:30** | 45 sec | **Payment Health** | Show HDFC UPI drop (38%) & Circuit Breaker. | Real-time Payment SRE anomaly detection. |
| **1:30 – 2:30** | 60 sec | **Recovery Cases** | Click **"AI Reason"** on Ananya Roy (₹4,850). | Google Gemini 2.5 Flash Autonomous Diagnosis. |
| **2:30 – 3:30** | 60 sec | **Approval Queue & Policy** | Show VIP order approval & toggle Kill Switch. | Policy Guardrails, Safety Limits & Human Governance. |
| **3:30 – 4:20** | 50 sec | **Recovery Cases (Live Checkout)** | Click **"Pay Link"** $\rightarrow$ complete test payment. | Real Razorpay Web Checkout (`checkout.js`) & HMAC verification. |
| **4:20 – 5:00** | 40 sec | **Command Center & Wrap-up** | Point to Sealed Audit Ledger & Final ROI. | The impact: 49.7% higher recovery with zero margin loss. |

---

## 📜 Line-by-Line Script & Action Guide

---

### 🎬 ACT 1: The Problem & Introduction (0:00 – 0:45)
**Screen to Show:** `Command Center` tab  
**Action on Screen:** Move cursor smoothly over the top 4 metric cards (₹2.41L Recovered, 88.4% Success Rate, ₹3.42L Risk Prevented).

> **🗣️ YOU SAY:**
> 
> "Hello judges and team Razorpay! 
> 
> Did you know that every single day in India, over **₹10,000 Crores** of valid e-commerce and SaaS transactions fail due to bank server timeouts, UPI glitches, and checkout drop-offs?
> 
> When a customer's payment fails, merchants make two major mistakes:
> 1. They spam the customer with blind retries that get blocked by banks.
> 2. Or they throw away huge 10% to 20% discounts that eat up their entire profit margin.
> 
> **Meet Revive AI** — an autonomous, policy-bounded revenue recovery agent built directly on top of Razorpay infrastructure. 
> 
> Instead of guessing, Revive AI detects bank failures in real time, uses **Google Gemini 2.5 Flash** to diagnose the exact root cause, and dispatches the most profitable recovery action with zero margin loss."

---

### 🎬 ACT 2: Real-Time Payment SRE Intelligence (0:45 – 1:30)
**Screen to Show:** Click on the `Payment Health` tab in the navbar.  
**Action on Screen:** 
1. Scroll down to show the **HDFC Bank UPI Authorization Degradation** card.
2. Point to the red **38% Success Rate** and the green **Circuit Breaker Active** badge.

> **🗣️ YOU SAY:**
> 
> "Let’s start with where the revenue bleed begins: **Payment Health**.
> 
> Revive AI acts as an SRE monitoring engine for payments. Right here, our telemetry detected that **HDFC Bank UPI success rates plummeted from 88% down to 38%**.
> 
> An ordinary system would blindly retry the same broken UPI gateway and fail again. 
> 
> But look what Revive AI did: it instantly tripped an automated **Circuit Breaker**. It stopped all failing UPI retries to prevent customer frustration and bank penalty fees, and prepared an alternate recovery rail."

---

### 🎬 ACT 3: Autonomous AI Diagnosis with Google Gemini (1:30 – 2:30)
**Screen to Show:** Click on the `Recovery Cases` tab.  
**Action on Screen:** 
1. Hover over the first customer case: **Ananya Roy (₹4,850 - HDFC UPI)**.
2. Click the blue **"AI Reason"** button to open the Gemini Decision Modal.
3. Show the 3 clean cards: *What Happened*, *Recommended Action*, and *Guardrails Verified*.

> **🗣️ YOU SAY:**
> 
> "Now let’s look at how Revive AI handles individual customer cases.
> 
> Here is Ananya Roy, who was trying to complete a ₹4,850 order during the HDFC outage. 
> 
> Let's open the **AI Inspector** to see what our AI decided.
> 
> Powered by **Google Gemini 2.5 Flash**, the AI diagnosed that this was a temporary issuer bank timeout, meaning Ananya's account was not charged.
> 
> Instead of offering an unnecessary discount, Gemini calculated that sending a **1-Click WhatsApp Pay Link switching her to Cards or Netbanking** has an **88% probability of instant recovery** with **₹0 discount cost**.
> 
> And look below: it automatically verified our merchant guardrails — confirming the order is within safe limits and within active daytime hours."

---

### 🎬 ACT 4: Policy Guardrails, Approval Queue & Kill Switch (2:30 – 3:30)
**Screen to Show:** Click on the `Approval Queue` tab, then show the `Autonomy & Policy` tab.  
**Action on Screen:** 
1. In the **Approval Queue**, point to high-value orders (e.g. Rajesh Sharma ₹34,999) awaiting manager approval.
2. Click the **"Approve & Execute Action"** button.
3. In the top navbar, point to the **Kill Switch** button and the **Autonomy Mode Switcher** (`OBSERVE`, `ASSIST`, `AUTOPILOT`).

> **🗣️ YOU SAY:**
> 
> "Enterprise merchants will never trust an AI without strict safety controls. That’s why Revive AI has a **Human-in-the-Loop Policy Gateway**.
> 
> In **`ASSIST` mode**, standard low-ticket cases are recovered on autopilot. But if an order exceeds ₹20,000 — like Rajesh Sharma's ₹34,999 order — it is held right here in the **Approval Queue** for a manager's 1-click authorization.
> 
> We also give CFOs 3 autonomy modes:
> - **`OBSERVE`** for read-only shadow testing.
> - **`ASSIST`** for hybrid human approval.
> - **`AUTOPILOT`** for 100% autonomous recovery during flash sales.
> 
> And if anything ever goes wrong, one click on the **Emergency Kill Switch** halts all automated outreach in under 1 millisecond."

---

### 🎬 ACT 5: Real Razorpay Web Checkout & Verified Attribution (3:30 – 4:20)
**Screen to Show:** Back to `Recovery Cases` tab.  
**Action on Screen:** 
1. Click the green **"Pay Link"** button on Ananya Roy.
2. Click **"Launch Razorpay Standard Modal (All Methods)"** to pop open the real Razorpay Checkout modal.
3. Enter test card details: `4111 1111 1111 1111`, `12/28`, `123` $\rightarrow$ click Success.
4. Watch the modal show **"Payment Verified & Settled!"** with the green checkmark.

> **🗣️ YOU SAY:**
> 
> "Now for the most important part: **The Real Payment Execution Loop**.
> 
> When the customer clicks their recovery link, it opens the authentic **Razorpay Standard Web Checkout modal** (`checkout.js`) with UPI, Cards, and Netbanking.
> 
> Behind the scenes:
> 1. Our backend generated a real server-authorized Razorpay Order ID.
> 2. When I complete the test card payment, the frontend sends the payment ID and signature to our `/api/verify-payment` endpoint.
> 3. Our server verifies the cryptographic **HMAC-SHA256 signature** before marking the case as **RECOVERED**.
> 
> This is a complete, closed-loop recovery pipeline on real Razorpay rails."

---

### 🎬 ACT 6: Immutable Audit Trail & Conclusion (4:20 – 5:00)
**Screen to Show:** Click on `Command Center` tab.  
**Action on Screen:** 
1. Scroll down to show the **Append-Only Audit Ledger** (SHA-256 SEALED) and the **Live Activity Feed**.
2. End with a smile on the main dashboard overview.

> **🗣️ YOU SAY:**
> 
> "Finally, every action taken — from webhook ingress to AI diagnosis to verified payment capture — is cryptographically hashed into an **Append-Only SHA-256 Audit Ledger**. This guarantees an un-tamperable audit trail for finance teams.
> 
> To summarize:
> - **49.7% higher revenue recovered** from failed checkouts.
> - **Zero wasted discounts** by using intelligent rail-switching.
> - **100% enterprise policy bounded** with real Razorpay signature verification.
> 
> Revive AI turns lost revenue into captured profit. Thank you!"

---

## 💡 Quick Tips for Recording:
1. **Resolution:** Record at **1080p (1920x1080)** with browser zoom at 100% or 90% for clean layout.
2. **Speed:** Speak at a calm, natural pace. You don't need to rush; 5 minutes is plenty of time.
3. **Cursor:** Use smooth mouse movements—let the mouse rest on what you are talking about for 1–2 seconds before clicking.
