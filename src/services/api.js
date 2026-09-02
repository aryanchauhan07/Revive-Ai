import { fallbackIncidents, fallbackCases, fallbackAuditEvents } from './mockFallback';

const API_BASE = '/api';

export async function fetchMerchant() {
  try {
    const res = await fetch(`${API_BASE}/merchant`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data && data.id ? data : {
      id: "merchant_razor_01",
      name: "Revive AI Merchant Store",
      mode: "ASSIST",
      killSwitch: false,
      policy: {
        mode: "ASSIST",
        money: { maxAutoDiscountPct: 2, maxDiscountPct: 5, highValueApprovalPaise: 2000000 },
        contact: { quietHours: { start: "22:00", end: "08:00" }, maxContacts: 3 }
      }
    };
  } catch (err) {
    console.warn("fetchMerchant fallback:", err.message);
    return {
      id: "merchant_razor_01",
      name: "Revive AI Merchant Store",
      mode: "ASSIST",
      killSwitch: false,
      policy: {
        mode: "ASSIST",
        money: { maxAutoDiscountPct: 2, maxDiscountPct: 5, highValueApprovalPaise: 2000000 },
        contact: { quietHours: { start: "22:00", end: "08:00" }, maxContacts: 3 }
      }
    };
  }
}

export async function updateMerchantPolicy(policyData) {
  try {
    const res = await fetch(`${API_BASE}/merchant/policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData)
    });
    return await res.json();
  } catch (err) {
    console.error("updateMerchantPolicy error:", err);
    return policyData;
  }
}

export async function toggleKillSwitch(enabled) {
  try {
    const res = await fetch(`${API_BASE}/merchant/kill-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });
    return await res.json();
  } catch (err) {
    console.error("toggleKillSwitch error:", err);
    return { killSwitch: enabled };
  }
}

export async function fetchIncidents() {
  try {
    const res = await fetch(`${API_BASE}/incidents`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : fallbackIncidents;
  } catch (err) {
    console.warn("fetchIncidents fallback:", err.message);
    return fallbackIncidents;
  }
}

export async function fetchCases() {
  try {
    const res = await fetch(`${API_BASE}/cases`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : fallbackCases;
  } catch (err) {
    console.warn("fetchCases fallback:", err.message);
    return fallbackCases;
  }
}

export async function executeCase(caseId, action = null, reviewerId = 'human_manager') {
  try {
    const res = await fetch(`${API_BASE}/cases/${caseId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reviewerId })
    });
    return await res.json();
  } catch (err) {
    console.error("executeCase error:", err);
    return { status: 'COMPLETED' };
  }
}

export async function fetchAuditEvents() {
  try {
    const res = await fetch(`${API_BASE}/audit`);
    if (!res.ok) {
      const altRes = await fetch(`${API_BASE}/audit-events`);
      const altData = await altRes.json();
      return Array.isArray(altData) && altData.length > 0 ? altData : fallbackAuditEvents;
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : fallbackAuditEvents;
  } catch (err) {
    console.warn("fetchAuditEvents fallback:", err.message);
    return fallbackAuditEvents;
  }
}

export async function triggerDemoIncident(bank = 'HDFC Bank', method = 'upi') {
  try {
    const res = await fetch(`${API_BASE}/demo/trigger-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bank, method })
    });
    return await res.json();
  } catch (err) {
    console.error("triggerDemoIncident error:", err);
    return null;
  }
}

export async function triggerDemoPaymentFailure(payload) {
  try {
    const res = await fetch(`${API_BASE}/demo/trigger-payment-failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("triggerDemoPaymentFailure error:", err);
    return null;
  }
}

export async function resetHealthyRails() {
  try {
    const res = await fetch(`${API_BASE}/demo/reset-healthy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err) {
    console.error("resetHealthyRails error:", err);
    return null;
  }
}

export async function runBatchEvaluation(sampleSize = 2000) {
  try {
    const res = await fetch(`${API_BASE}/evaluation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleSize })
    });
    return await res.json();
  } catch (err) {
    console.error("runBatchEvaluation error:", err);
    return null;
  }
}
