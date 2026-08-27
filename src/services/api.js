const API_BASE = '/api';

export async function fetchMerchant() {
  const res = await fetch(`${API_BASE}/merchant`);
  return res.json();
}

export async function updateMerchantPolicy(policyData) {
  const res = await fetch(`${API_BASE}/merchant/policy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policyData)
  });
  return res.json();
}

export async function toggleKillSwitch(enabled) {
  const res = await fetch(`${API_BASE}/merchant/kill-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  });
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  return res.json();
}

export async function fetchCases() {
  const res = await fetch(`${API_BASE}/cases`);
  return res.json();
}

export async function executeCase(caseId, action = null, reviewerId = 'human_manager') {
  const res = await fetch(`${API_BASE}/cases/${caseId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, reviewerId })
  });
  return res.json();
}

export async function fetchAuditEvents() {
  const res = await fetch(`${API_BASE}/audit`);
  return res.json();
}

export async function triggerDemoIncident(bank = 'HDFC Bank', method = 'upi') {
  const res = await fetch(`${API_BASE}/demo/trigger-incident`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bank, method })
  });
  return res.json();
}

export async function triggerDemoPaymentFailure(payload) {
  const res = await fetch(`${API_BASE}/demo/trigger-payment-failure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function runBatchEvaluation(batchSize = 2000) {
  const res = await fetch(`${API_BASE}/evaluation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchSize })
  });
  return res.json();
}

export async function fetchBatchHistory() {
  const res = await fetch(`${API_BASE}/evaluation/history`);
  return res.json();
}
