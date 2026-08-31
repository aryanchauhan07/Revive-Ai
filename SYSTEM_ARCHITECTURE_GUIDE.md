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

## 2. The Core Concept: An Autonomous AI Payment SRE & Revenue Recovery Engine

Think of **RECOVEROPS** like an **Automated Emergency Room & SRE Control Plane for Failed Payments**:

```
[ 1. INGEST & DEDUPE ]  ──►  [ 2. PAYMENT SRE & BLAST RADIUS ]  ──►  [ 3. RECOVERY DECISION BRAIN ]  ──►  [ 4. POLICY GATEWAY ]  ──►  [ 5. IDEMPOTENT EXEC ]  ──►  [ 6. ATTRIBUTION & ROI ]
Raw HMAC Verification        Isolates Outage vs Individual        8-Candidate Action Matrix          ALLOW / REVIEW / BLOCK         Razorpay Link / WhatsApp   Disentangles Natural
& Webhook Idempotency        & Trips Circuit Breaker             Expected Net Recovery Optimization  Quiet Hours & ₹25k Floor       Hinglish Voice / PTP       Recovery vs Incremental Lift
```

---

## 3. The Three Key Differentiators

### Differentiator 1: Recovery Decision Brain (Mathematical Action Selection)
Instead of asking an LLM to recommend an action blindly, the Decision Brain models recovery as an **Expected Utility Optimization Problem**.

For every failure case, it evaluates an **8-Candidate Action Matrix**:
1. `WAIT`: Hold for gateway cooldown or salary cycle.
2. `RETRY`: Direct payment retry (suppressed during bank outages).
3. `SWITCH_PAYMENT_METHOD`: Offer alternative rail (e.g. Card/Netbanking when UPI is degraded).
4. `CREATE_PAYMENT_LINK`: Issue a dedicated 1-click Razorpay payment link.
5. `WHATSAPP_MESSAGE`: Send a pre-approved recovery notification.
6. `INCENTIVE`: Dynamic margin-safe discount (3% on high-intent cart drop; ₹0 on technical bank outage).
7. `HUMAN_ESCALATION`: Route to manager for sensitive $\ge$ ₹25,000 orders.
8. `STOP`: Safe stopping rule (for terminal declines or expired cards to prevent spam).

#### Decision Equation:
$$\text{Expected Net Recovery Value} = \Big( P(\text{success} \mid \text{action}) \times \text{Gross Amount} \Big) - \text{Intervention Cost} - \text{Risk/Friction Penalty}$$

The action with the **highest Expected Net Recovery** that is **`ALLOW`ed by Policy** is selected and executed.

---

### Differentiator 2: Payment SRE Intelligence & Blast Radius Analysis
The system determines whether a failure is an **isolated customer problem** or a **systemic payment ecosystem incident** (e.g., HDFC UPI down):

1. **Blast Radius Computation**:
   - **Affected Transactions**: 5 transactions in current window.
   - **Affected Unique Customers**: 5 customers.
   - **Revenue at Risk**: ₹59,249.
   - **Degraded Rail**: `HDFC Bank UPI`.
2. **Recovery Circuit Breaker**:
   - **TRIPPED State**: Instantly pauses wasteful same-rail retries.
   - **Adaptive Fallback**: Directs customers to unaffected rails (Card / Netbanking).
   - **Stabilization Cooldown**: Waits for success baseline recovery before releasing cohort outreach.

---

### Differentiator 3: Recovery Measurement & Attribution Engine
Disentangles natural customer recovery from true **incremental revenue lift**:

```
Total Revenue at Risk (100%)
  ├── 1. Natural Self-Recovery (Money customer would have paid anyway without our help)
  ├── 2. Incremental Lift from RECOVEROPS (Money saved purely because of intelligent intervention)
  └── 3. Unrecoverable / Terminal Declines (Hard declines safely stopped)
```

- **Net Incremental Recovery Math**:
  $$\text{Net Incremental Lift} = \text{RECOVEROPS Net Recovered} - \text{Baseline B (Generic Retries) Net Recovered}$$
- **Self-Recovery Cancellation**: If `payment.captured` is received before outreach, queued actions are canceled immediately with attribution tagged as `SELF_RECOVERED`.

---

## 4. Technical Architecture & File Map

| Layer | Responsibility | File Link |
| :--- | :--- | :--- |
| **Ingress & Security** | Raw HMAC SHA-256 validation & event deduplication | [webhookIngress.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/webhookIngress.js) |
| **Recovery Decision Brain** | 8-Action candidate matrix, Expected Net Recovery optimization, and LLM fallback | [recoveryPlanner.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/recoveryPlanner.js) |
| **Payment SRE & Telemetry** | Anomaly detection, Blast Radius analysis, and Recovery Circuit Breakers | [apiRoutes.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/routes/apiRoutes.js) |
| **Policy Governance** | Per-action policy checks, quiet hours, and execution-time rechecks | [policyEngine.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/policyEngine.js) |
| **Idempotent Executor** | Stable idempotency keys (`action:{case_id}:{ver}:{action_id}`) & API adapters | [actionExecutor.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/core/actionExecutor.js) |
| **Attribution Engine** | 2,000-event Mulberry32 seeded benchmark simulator with ROI & lift attribution | [batchSimulator.js](file:///c:/Users/User/OneDrive/Revive%20AI/server/simulation/batchSimulator.js) |
| **Unit Tests** | Automated engineering unit test suite (`npm test` 100% pass rate) | [unit.test.js](file:///c:/Users/User/OneDrive/Revive%20AI/tests/unit.test.js) |
