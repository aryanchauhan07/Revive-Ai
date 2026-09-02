/**
 * Revive AI — Privacy, DND, Quiet Hours & Opt-Out Guardrail Engine
 */

export class PrivacyEngine {
  constructor() {
    this.optOutList = new Set();
    this.customerTouchpoints = new Map(); // phone -> Array of timestamps
  }

  isOptedOut(phoneOrEmail) {
    if (!phoneOrEmail) return false;
    return this.optOutList.has(phoneOrEmail.trim().toLowerCase());
  }

  recordOptOut(phoneOrEmail, reason = "CUSTOMER_REQUESTED_STOP") {
    if (!phoneOrEmail) return false;
    this.optOutList.add(phoneOrEmail.trim().toLowerCase());
    return true;
  }

  isQuietHours(timeZone = 'Asia/Kolkata') {
    try {
      const now = new Date();
      // Format current hour in IST
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour12: false, hour: "numeric" });
      const currentHour = parseInt(istString, 10);

      // Quiet hours between 22:00 (10 PM) and 09:00 (9 AM) IST
      if (currentHour >= 22 || currentHour < 9) {
        return { isQuiet: true, currentHour, allowedWindow: "09:00 - 22:00 IST" };
      }
      return { isQuiet: false, currentHour, allowedWindow: "09:00 - 22:00 IST" };
    } catch (err) {
      return { isQuiet: false, error: err.message };
    }
  }

  checkFrequencyBudget(phone, maxTouches24h = 2) {
    if (!phone) return { allowed: true };
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let touches = this.customerTouchpoints.get(phone) || [];
    touches = touches.filter(ts => ts > oneDayAgo);
    this.customerTouchpoints.set(phone, touches);

    if (touches.length >= maxTouches24h) {
      return {
        allowed: false,
        touchesCount: touches.length,
        maxTouches24h,
        reason: `Frequency budget exceeded (${touches.length}/${maxTouches24h} touches in 24h)`
      };
    }

    return { allowed: true, touchesCount: touches.length, maxTouches24h };
  }

  recordTouchpoint(phone) {
    if (!phone) return;
    const touches = this.customerTouchpoints.get(phone) || [];
    touches.push(Date.now());
    this.customerTouchpoints.set(phone, touches);
  }

  evaluateCommunicationEligibility(customer = {}, caseItem = {}) {
    const phone = customer.phone || caseItem.customer_phone;
    const email = customer.email || caseItem.customer_email;

    // 1. Opt-out / DND Check
    if (this.isOptedOut(phone) || this.isOptedOut(email)) {
      return {
        eligible: false,
        reasonCode: "OPTED_OUT_DND",
        reason: "Customer has opted out with STOP keyword. Outreach strictly forbidden."
      };
    }

    // 2. Promise-to-Pay (PTP) Pause Check
    if (caseItem.ptp_date) {
      const ptpDate = new Date(caseItem.ptp_date);
      if (ptpDate > new Date()) {
        return {
          eligible: false,
          reasonCode: "PTP_ACTIVE_PAUSE",
          reason: `Active Promise-to-Pay commitment on file until ${caseItem.ptp_date}. Outreach paused.`
        };
      }
    }

    // 3. Frequency Cap Check
    const freqCheck = this.checkFrequencyBudget(phone);
    if (!freqCheck.allowed) {
      return {
        eligible: false,
        reasonCode: "FREQUENCY_CAP_EXCEEDED",
        reason: freqCheck.reason
      };
    }

    // 4. Quiet Hours Check
    const quietCheck = this.isQuietHours();
    if (quietCheck.isQuiet) {
      return {
        eligible: false,
        reasonCode: "QUIET_HOURS_RESTRICTION",
        reason: `Quiet hours active (${quietCheck.currentHour}:00 IST). Outreach scheduled for 09:00 IST.`
      };
    }

    return { eligible: true, reason: "All communication privacy guardrails passed." };
  }
}

export const privacyEngine = new PrivacyEngine();
