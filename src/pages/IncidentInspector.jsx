import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, Layers, FileText } from 'lucide-react';

export default function IncidentInspector({ incidents = [], cases = [], onOpenCheckout }) {
  const activeIncident = incidents[0] || {
    id: "INC-901",
    title: "HDFC Bank UPI Success Rate Degradation",
    status: "OPEN",
    severity: "HIGH",
    dimensions: { method: "upi", issuer: "HDFC Bank", step: "authorization" },
    baseline_success_rate: 0.88,
    current_success_rate: 0.41,
    z_score: -3.8,
    affected_count: 42,
    revenue_at_risk_paise: 3840000,
    root_cause: "HDFC UPI Auth Gateway is experiencing intermittent timeouts. Direct retries are failing at 82%.",
    evidence: [
      { key: "UPI Success Drop", value: "88% -> 41% baseline delta" },
      { key: "Razorpay Status Match", value: "Partner HDFC UPI partner degraded status confirmed" },
      { key: "Method Concentration", value: "92% of failures are on UPI rail" }
    ]
  };

  const affectedCases = cases.filter(c => c.incident_id === activeIncident.id || !c.incident_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Incident Inspector</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Closed-loop degradation isolation, evidence trace, and cohort remediation</p>
      </div>

      {/* Incident Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
              {activeIncident.id}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{activeIncident.title}</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            Status: {activeIncident.status}
          </span>
        </div>

        {/* Root Cause Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <span className="text-slate-500 font-bold uppercase tracking-wider block">AI Root Cause Diagnosis</span>
          <p className="text-slate-800 text-sm leading-relaxed font-semibold">{activeIncident.root_cause}</p>
        </div>

        {/* Evidence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {activeIncident.evidence?.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 text-[11px] font-medium block">{item.key}</span>
              <span className="text-slate-900 font-bold mt-1 block">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Affected Customer Cohort Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Affected Cohort & Remediation Queue</h3>
          <span className="text-xs text-slate-500 font-mono font-medium">{affectedCases.length} cases in cohort</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Primary Remediation Plan</th>
                <th className="py-3 px-3">Policy Checks</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {affectedCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{c.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.customer_phone}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-emerald-700">
                      {c.current_plan?.actions?.map(a => a.action).join(' → ') || 'WAIT → SWITCH_METHOD → CREATE_LINK'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono font-medium">Prob: {Math.round((c.current_plan?.recoverability?.probability || 0.85)*100)}%</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {c.policy_decision?.decision || 'ALLOW'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                    ₹{(c.amount_paise / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onOpenCheckout(c)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors shadow-xs"
                    >
                      Remediate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
