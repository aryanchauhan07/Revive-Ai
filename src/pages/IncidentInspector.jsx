import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Users,
  IndianRupee,
  Activity,
  Filter
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
    z_score: -3.8,
    affected_count: 5,
    revenue_at_risk_paise: 5924900,
    root_cause: "HDFC UPI Auth Gateway is experiencing intermittent timeouts. Direct retries are failing at 82%.",
    recommended_approach: "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp.",
    evidence: [
      { key: "UPI Success Drop", value: "88% -> 41% baseline delta" },
      { key: "Razorpay Downtime Match", value: "Partner HDFC UPI partner degraded status confirmed" },
      { key: "Method Concentration", value: "92% of failures localized to UPI rail" }
    ]
  };

  // Filter cohort cases belonging to selected incident
  const cohortCases = (cases || []).filter(c => c.incident_id === activeIncident.id || (!c.incident_id && activeIncident.id === 'INC-901'));

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Revenue Incident Inspector</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Closed-loop degradation isolation, evidence trace, and customer cohort remediation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Compact List of Unique Incidents */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Active Incidents List</h3>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {openIncidents.length} Active
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[560px] custom-scrollbar pr-1">
            {openIncidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const atRiskRupees = Math.round((inc.revenue_at_risk_paise || 0) / 100);
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-slate-200">
                      {inc.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{inc.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                    <span>{inc.affected_count || 5} Customers</span>
                    <strong className="text-rose-700 font-bold">₹{atRiskRupees.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Selected Incident View */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-6">
          {/* Incident Detail Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                  {activeIncident.id}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">{activeIncident.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Method: <strong className="text-slate-800 font-bold">{activeIncident.dimensions?.method?.toUpperCase()}</strong> • Issuer: <strong className="text-slate-800 font-bold">{activeIncident.dimensions?.issuer}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-rose-700">₹{Math.round((activeIncident.revenue_at_risk_paise || 0) / 100).toLocaleString()}</span>
              <span className="text-xs text-slate-500 block font-medium">Total Revenue at Risk</span>
            </div>
          </div>

          {/* Root Cause & Recommended Approach Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider block">AI Root Cause Diagnosis</span>
              <p className="text-slate-800 leading-relaxed font-semibold">{activeIncident.root_cause}</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1.5 text-blue-900">
              <span className="text-blue-950 font-bold uppercase tracking-wider block flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Recommended Cohort Approach</span>
              </span>
              <p className="text-blue-900 leading-relaxed font-semibold">
                {activeIncident.recommended_approach || "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp."}
              </p>
            </div>
          </div>

          {/* Evidence Grid */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2 text-xs">
            <span className="text-amber-900 font-bold uppercase tracking-wider block">Detection Evidence & Evidence Signals</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(activeIncident.evidence || []).map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200 text-[11px]">
                  <span className="text-slate-500 font-medium block">{item.key}</span>
                  <strong className="text-slate-900 font-bold block mt-0.5">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Customer Cohort Table (Individual Customer Cases) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Affected Customer Cohort ({cohortCases.length} Customers)</h4>
              <span className="text-xs text-slate-500 font-medium">Individualized AI Recommendations</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Failure Reason</th>
                    <th className="py-3 px-3">Individual AI Plan</th>
                    <th className="py-3 px-3">Policy Gate</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{c.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.id}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-amber-700">{c.failure_reason?.error_reason}</div>
                        <div className="text-[11px] text-slate-500">{c.failure_reason?.issuer} • {c.failure_reason?.method?.toUpperCase()}</div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-blue-700">
                        {c.current_plan?.actions?.map(a => a.action).join(' → ') || 'WAIT → SWITCH_METHOD'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          c.policy_decision?.decision === 'REVIEW' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {c.policy_decision?.decision || 'ALLOW'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                        ₹{(c.amount_paise / 100).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onOpenCheckout(c)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-xs"
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
