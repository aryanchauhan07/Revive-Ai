import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Users,
  IndianRupee,
  ShieldAlert,
  Flame
} from 'lucide-react';

export default function IncidentInspector({ 
  incidents = [], 
  cases = [], 
  onOpenCheckout = () => {}
}) {
  // Deduplicate open incidents strictly by Title so that each distinct incident appears ONLY once
  const openIncidentsMap = new Map();
  (incidents || [])
    .filter(i => i.status === 'OPEN')
    .forEach(i => {
      const key = i.title || (i.dimensions?.issuer + '_' + i.dimensions?.method) || i.id;
      if (!openIncidentsMap.has(key)) {
        openIncidentsMap.set(key, i);
      }
    });
  const openIncidents = Array.from(openIncidentsMap.values());

  const [selectedIncidentId, setSelectedIncidentId] = useState(openIncidents[0]?.id || 'INC-901');
  const activeIncident = openIncidents.find(i => i.id === selectedIncidentId) || openIncidents[0] || {
    id: "INC-901",
    title: "HDFC Bank UPI Authorization Degradation",
    status: "OPEN",
    severity: "HIGH",
    dimensions: { method: "upi", issuer: "HDFC Bank", step: "authorization" },
    baseline_success_rate: 0.88,
    current_success_rate: 0.38,
    affected_count: 5,
    revenue_at_risk_paise: 5924900,
    root_cause: "HDFC UPI partner gateway timeouts detected. Direct retries failing at 84%.",
    recommended_approach: "Suppress same-rail retries; dispatch alternate method payment link via WhatsApp."
  };

  // Filter cohort cases strictly belonging to active incident
  const cohortCases = (cases || []).filter(c => {
    if (c.incident_id) {
      return c.incident_id === activeIncident.id;
    }
    // Fallback matching by issuer/method if legacy case
    return activeIncident.id === 'INC-901' && c.failure_reason?.issuer === 'HDFC Bank';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Incident Inspector</h2>
        <p className="text-xs text-slate-500 font-medium">
          Closed-loop payment degradation isolation, root-cause diagnosis, and customer cohort remediation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Distinct Incidents */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Active Incidents</h3>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {openIncidents.length} Distinct
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[520px] custom-scrollbar">
            {openIncidents.map((inc) => {
              const isSelected = activeIncident.id === inc.id || activeIncident.title === inc.title;
              const atRiskRupees = Math.round((inc.revenue_at_risk_paise || 0) / 100);
              const matchingCases = (cases || []).filter(c => c.incident_id === inc.id);
              const customerCount = matchingCases.length || inc.affected_count || inc.sre_blast_radius?.affected_customers || 3;

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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      inc.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{inc.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                    <span>{customerCount} Customers</span>
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
                Degraded Rail: <strong className="text-slate-800 font-bold">{activeIncident.dimensions?.issuer} ({activeIncident.dimensions?.method?.toUpperCase()})</strong> • Status: <span className="text-rose-600 font-bold">ACTIVE DEGRADATION</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xl font-extrabold text-rose-700">
                ₹{Math.round((activeIncident.revenue_at_risk_paise || 0) / 100).toLocaleString()}
              </span>
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
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Affected Customer Cohort ({cohortCases.length} Customers)
              </h4>
              <span className="text-xs text-slate-400 font-medium">Individualized customer interventions</span>
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
                  {cohortCases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400 font-medium">
                        No active failure cases under this incident.
                      </td>
                    </tr>
                  ) : (
                    cohortCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.id} • {c.customer_phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-amber-800">{c.failure_reason?.error_reason}</span>
                          <span className="text-[10px] text-slate-400 block">{c.failure_reason?.issuer} ({c.failure_reason?.method?.toUpperCase()})</span>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
