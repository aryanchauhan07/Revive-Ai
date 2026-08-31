import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Users,
  IndianRupee
} from 'lucide-react';

export default function IncidentInspector({ 
  incidents = [], 
  cases = [], 
  onOpenCheckout = () => {}
}) {
  // Deduplicate open incidents by ID
  const openIncidents = Array.from(
    new Map((incidents || []).filter(i => i.status === 'OPEN').map(i => [i.id, i])).values()
  );

  const [selectedIncidentId, setSelectedIncidentId] = useState(openIncidents[0]?.id || 'INC-901');
  const activeIncident = openIncidents.find(i => i.id === selectedIncidentId) || openIncidents[0] || {
    id: "INC-901",
    title: "HDFC Bank UPI Authorization Degradation",
    status: "OPEN",
    severity: "HIGH",
    dimensions: { method: "upi", issuer: "HDFC Bank", step: "authorization" },
    baseline_success_rate: 0.88,
    current_success_rate: 0.41,
    affected_count: 5,
    revenue_at_risk_paise: 5924900,
    root_cause: "HDFC UPI Auth Gateway timeouts detected. Direct retries are failing at 82%.",
    recommended_approach: "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp.",
    evidence: [
      { key: "UPI Success Drop", value: "88% -> 41% baseline delta" },
      { key: "Razorpay Downtime Match", value: "HDFC PSP degraded status confirmed" },
      { key: "Method Concentration", value: "92% of failures on UPI rail" }
    ]
  };

  // Filter cohort cases belonging to selected incident
  const cohortCases = (cases || []).filter(c => c.incident_id === activeIncident.id || (!c.incident_id && activeIncident.id === 'INC-901'));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Incident Inspector</h2>
        <p className="text-xs text-slate-500 font-medium">
          Closed-loop degradation isolation and customer cohort remediation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Incidents */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Active Incidents</h3>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {openIncidents.length} Open
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar">
            {openIncidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const atRiskRupees = Math.round((inc.revenue_at_risk_paise || 0) / 100);
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200">
                      {inc.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{inc.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                    <span>{inc.affected_count || 5} Customers</span>
                    <strong className="text-rose-700 font-bold">₹{atRiskRupees.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Selected Incident View */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-5">
          {/* Incident Detail Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                  {activeIncident.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{activeIncident.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Method: <strong className="text-slate-800 font-bold">{activeIncident.dimensions?.method?.toUpperCase()}</strong> • Issuer: <strong className="text-slate-800 font-bold">{activeIncident.dimensions?.issuer}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xl font-extrabold text-rose-700">₹{Math.round((activeIncident.revenue_at_risk_paise || 0) / 100).toLocaleString()}</span>
              <span className="text-xs text-slate-400 block font-medium">Revenue at Risk</span>
            </div>
          </div>

          {/* Root Cause & Recommended Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Root Cause Diagnosis</span>
              <p className="text-slate-800 font-semibold leading-relaxed">{activeIncident.root_cause}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 text-blue-950">
              <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Recommended Approach</span>
              </span>
              <p className="text-blue-900 font-semibold leading-relaxed">
                {activeIncident.recommended_approach || "Suppress same-rail retries; dispatch alternate method link via WhatsApp."}
              </p>
            </div>
          </div>

          {/* Affected Customer Cohort Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Affected Customer Cohort ({cohortCases.length})</h4>
              <span className="text-xs text-slate-400 font-medium">Customer-specific AI recommendations</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Failure Reason</th>
                    <th className="py-2.5 px-3">AI Plan</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-amber-800">{c.failure_reason?.error_reason}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-blue-700">
                        {c.current_plan?.actions?.map(a => a.action).join(' → ') || 'WAIT → SWITCH_METHOD'}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        ₹{(c.amount_paise / 100).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenCheckout(c)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-2xs"
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
      </div>
    </div>
  );
}
