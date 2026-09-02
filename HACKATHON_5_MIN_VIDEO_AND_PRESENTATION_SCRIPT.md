# 🎙️ Revive AI: Simple & Clear 5-Minute Hackathon Presentation Script

> **Goal:** Explain Revive AI in **plain, simple everyday English** so any judge or listener instantly understands what you built, how the tech works, and why it's a game-changer.
> **Total Time:** 5 Minutes (300 seconds)

---

## ⏱️ Video & Presentation Timeline at a Glance

| Time | Page to Show | What You Click | What You Explain in Simple Words |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:50** | **Command Center** | Hover over top 4 numbers | The Problem: Why ₹10,000 Cr of online orders fail every day in India. |
| **0:50 – 1:40** | **Payment Health** | Scroll to HDFC Bank card | How Revive AI catches bank crashes before customers complain. |
| **1:40 – 2:40** | **Recovery Cases** | Click **"AI Reason"** on Ananya Roy | How Google Gemini AI diagnoses the problem and picks the cheapest fix. |
| **2:40 – 3:40** | **Approval Queue** | Click **"Approve"** on Rajesh Sharma | Safety & Control: Why high-value orders need human manager sign-off. |
| **3:40 – 4:30** | **Recovery Cases** | Click **"Pay Link"** $\rightarrow$ complete test card | Real Razorpay checkout modal with cryptographic server verification. |
| **4:30 – 5:00** | **Command Center** | Point to ledger & wrap up | Summary: 49.7% more revenue recovered without giving away wasteful discounts. |

---

## 📜 Full Spoken Script (Word-for-Word in Simple English)

---

### 🎬 ACT 1: Introduction & The Problem (0:00 – 0:50)
📍 **Page:** `Command Center` (Main Dashboard)  
🖱️ **Action:** Slowly hover mouse over the top 4 metric boxes (Total Recovered ₹2.41L, Success Rate 88.4%).

> **🗣️ WHAT YOU SAY:**
> 
> "Hello everyone! 
> 
> Imagine you are shopping online. You add something to your cart, click Pay with UPI, but your bank server times out and the transaction fails. 
> 
> What happens next? Most customers just give up and leave.
> 
> In India, over **₹10,000 Crores of valid payments fail every single day** because of temporary bank glitches, network drops, or confusing checkout screens.
> 
> When this happens, merchants make two big mistakes:
> 1. They keep retrying the broken bank, which fails again and again.
> 2. Or they panic and send a huge 10% or 20% discount code, which kills their profit margin.
> 
> **That is why we built Revive AI.** 
> 
> Revive AI is an intelligent revenue recovery agent built on top of Razorpay. It catches payment failures in real time, uses **Google Gemini AI** to understand why it failed, and recovers the order with **zero wasted discounts**."

---

### 🎬 ACT 2: Detecting Bank Failures in Real Time (0:50 – 1:40)
📍 **Page:** Click on the `Payment Health` tab in the top navigation bar.  
🖱️ **Action:** Scroll down to the **HDFC Bank UPI Authorization Degradation** box. Point to the red **38% Success Rate** and the green **Circuit Breaker** badge.

> **🗣️ WHAT YOU SAY:**
> 
> "Let’s start by looking at **Payment Health**.
> 
> Think of this page like an SRE health monitor for all payment methods in India.
> 
> Right here, Revive AI noticed that **HDFC Bank UPI success rates suddenly crashed from 88% down to 38%**.
> 
> An ordinary payment system would keep spamming the broken HDFC UPI rail. 
> 
> But Revive AI is smarter: it automatically turned on a **Circuit Breaker**. 
> 
> This means it stops all failing UPI retries so the customer’s bank account doesn't get blocked with penalty fees, and automatically switches to healthy payment rails like Cards or Netbanking."

---

### 🎬 ACT 3: AI Diagnosis with Google Gemini 2.5 Flash (1:40 – 2:40)
📍 **Page:** Click on the `Recovery Cases` tab.  
🖱️ **Action:** 
1. Point to the first customer: **Ananya Roy (₹4,850 - HDFC UPI)**.
2. Click the blue **"AI Reason"** button to open the modal.
3. Show the 3 clean sections inside: *1. What Happened*, *2. Recommended Action*, *3. Guardrails Verified*.

> **🗣️ WHAT YOU SAY:**
> 
> "Now let's see how our AI handles individual customer cases.
> 
> Here is Ananya Roy. She tried to buy something for ₹4,850 during the HDFC UPI downtime.
> 
> Let’s click **'AI Reason'** to see what the AI decided.
> 
> Powered by **Google Gemini 2.5 Flash**, the AI looks at the transaction telemetry in real time:
> 
> 1. **What Happened?** Gemini tells us: this was a temporary bank server timeout. Ananya's money was not deducted.
> 2. **What should we do?** Instead of giving away a discount, Gemini recommends sending a **1-Click WhatsApp Pay Link allowing her to pay via Cards or Netbanking**. This has an **88% recovery chance** with **₹0 discount waste**.
> 3. **Are we following safety rules?** It automatically confirms that the order value is safe and sent during active daytime hours."

---

### 🎬 ACT 4: Human Approval Queue & Emergency Kill Switch (2:40 – 3:40)
📍 **Page:** Click on the `Approval Queue` tab, then show the `Autonomy & Policy` tab.  
🖱️ **Action:** 
1. In the **Approval Queue**, point to Rajesh Sharma's high-value order (₹34,999).
2. Click the green **"Approve & Execute Action"** button (watch it approve live!).
3. Point to the **Kill Switch** and **Mode Switcher** in the top navbar.

> **🗣️ WHAT YOU SAY:**
> 
> "Businesses will never let an AI run wild without human supervision. That is why Revive AI has built-in **Human-in-the-Loop Governance**.
> 
> In **`ASSIST` mode**, standard small orders are recovered automatically. But if an order is large — like Rajesh Sharma's ₹34,999 order — it is held right here in the **Approval Queue** so a human manager can approve it with one click.
> 
> We also give merchants 3 simple modes:
> - **`OBSERVE`**: Read-only mode for testing.
> - **`ASSIST`**: The AI handles standard cases and asks humans for high-risk ones.
> - **`AUTOPILOT`**: 100% automatic recovery for busy flash sales.
> 
> And if there is ever an emergency, clicking the **Kill Switch** stops all automated actions in less than a millisecond."

---

### 🎬 ACT 5: Real Razorpay Web Checkout (3:40 – 4:30)
📍 **Page:** Go back to `Recovery Cases` tab.  
🖱️ **Action:** 
1. Click the green **"Pay Link"** button on Ananya Roy.
2. In the drawer, click **"Launch Razorpay Standard Modal (All Methods)"**.
3. The official Razorpay modal opens. Enter test card: `4111 1111 1111 1111`, expiry `12/28`, CVV `123`, and click Success.
4. Watch the green **"Payment Verified & Settled!"** screen appear.

> **🗣️ WHAT YOU SAY:**
> 
> "Now let’s look at the real payment flow.
> 
> When the customer clicks their WhatsApp recovery link, it opens the official **Razorpay Standard Checkout modal** (`checkout.js`) with UPI, Cards, and Netbanking.
> 
> Notice what happens behind the scenes:
> 1. Our backend created a real Razorpay Order ID to lock the price.
> 2. When I pay with this test card, Razorpay sends the payment ID and signature back to our server.
> 3. Our backend cryptographically verifies the **HMAC-SHA256 signature** before marking the money as recovered.
> 
> This is not a mockup — this is a real, policy-bounded payment recovery loop on live Razorpay rails."

---

### 🎬 ACT 6: Tamper-Proof Audit Trail & Conclusion (4:30 – 5:00)
📍 **Page:** Click on the `Command Center` tab.  
🖱️ **Action:** Scroll down to show the **Append-Only Audit Ledger** (SHA-256 SEALED) and end on the main overview.

> **🗣️ WHAT YOU SAY:**
> 
> "Finally, every action — from the initial bank failure to the AI decision to the verified payment — is sealed into a **SHA-256 Hash-Chained Audit Ledger**. This gives finance teams a 100% tamper-proof record of all recovered revenue.
> 
> In short, Revive AI provides:
> - **49.7% higher revenue recovery** from failed payments.
> - **Zero wasted discounts** by using smart payment rail switching.
> - **100% safety and control** with real Razorpay signature verification.
> 
> Revive AI turns lost transactions into recovered revenue. Thank you!"

---

## 🎯 Presentation Tips:
1. **Talk like you are telling a story:** You are solving a real problem that every online shopper in India faces.
2. **Move your mouse deliberately:** Hover on the button you are about to click for 1 second before clicking.
3. **Keep browser zoom at 100% or 90%:** Makes all cards look sharp and modern on 1080p video.
