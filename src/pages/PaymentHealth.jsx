import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Activity,
  Flame,
  Clock
} from 'lucide-react';

export default function PaymentHealth({ 
  incidents = [], 
  cases = [], 
  setActiveTab = () => {}, 
  onTriggerDemo = () => {},
  onOpenCheckout = () => {}
}) {
  // Deduplicate open anomaly incidents strictly by unique Title
  const openIncidentsMap = new Map();
  (incidents || [])
    .filter(i => i.status === 'OPEN')
    .forEach(i => {
      const key = i.title || i.id;
      if (!openIncidentsMap.has(key)) {
        openIncidentsMap.set(key, i);
      }
    });
  const openIncidents = Array.from(openIncidentsMap.values());

  // Summary Metrics
  const totalAtRiskPaise = (cases || []).reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const recoveredCases = (cases || []).filter(c => c.status === 'RECOVERED');
  const totalRecoveredPaise = recoveredCases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);

  // Rail Performance Cards
  const isUpiDegraded = openIncidents.some(i => i.dimensions?.method === 'upi' || i.title?.includes('UPI'));
  const isCardDegraded = openIncidents.some(i => i.dimensions?.method === 'card' || i.title?.includes('Card'));
  const isMandateDegraded = openIncidents.some(i => i.dimensions?.method === 'mandate' || i.title?.includes('Mandate'));

  const healthData = [
    { 
      method: 'UPI (GPay / PhonePe / Paytm)', 
      successRate: isUpiDegraded ? 38 : 88, 
      baseline: 88, 
      status: isUpiDegraded ? 'DEGRADED' : 'HEALTHY', 
      volume: '1,420 txns',
      riskRupees: isUpiDegraded ? 59249 : 0
    },
    { 
      method: 'Credit & Debit Cards', 
      successRate: isCardDegraded ? 68 : 91, 
      baseline: 92, 
      status: isCardDegraded ? 'WATCH' : 'HEALTHY', 
      volume: '840 txns',
      riskRupees: isCardDegraded ? 47300 : 0
    },
    { 
      method: 'Netbanking (ICICI / SBI / Axis)', 
      successRate: 95, 
      baseline: 94, 
      status: 'HEALTHY', 
      volume: '310 txns',
      riskRupees: 0
    },
    { 
      method: 'AutoPay e-Mandates', 
      successRate: isMandateDegraded ? 72 : 86, 
      baseline: 86, 
      status: isMandateDegraded ? 'WATCH' : 'HEALTHY', 
      volume: '190 txns',
      riskRupees: isMandateDegraded ? 21300 : 0
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'WATCH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DEGRADED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment SRE Intelligence & Rail Health</h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time payment ecosystem observability, blast-radius analysis, and recovery circuit breakers
          </p>
        </div>
        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-2xs shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-amber-600" />
          <span>Simulate Systemic Outage</span>
        </button>
      </div>

      {/* SRE BLAST RADIUS & CIRCUIT BREAKER ALERT CARDS */}
      {openIncidents.length > 0 ? (
        <div className="space-y-4">
          {openIncidents.map((inc) => {
            const atRiskRupees = Math.round((inc.revenue_at_risk_paise || totalAtRiskPaise) / 100);
            const isTripped = inc.circuit_breaker?.status === 'TRIPPED';

            return (
              <div 
                key={inc.id} 
                className="glass-panel rounded-2xl p-5 border border-rose-300 bg-white shadow-card space-y-4 animate-fade-in"
              >
                {/* Header with Scope & Circuit Breaker status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                      {inc.id}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{inc.title}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-white font-mono text-xs font-extrabold shadow-xs flex items-center space-x-1.5 ${
                      isTripped ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                    }`}>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>CIRCUIT BREAKER: {inc.circuit_breaker?.status || 'TRIPPED'}</span>
                    </span>
                  </div>
                </div>

                {/* SRE Blast Radius Telemetry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Incident Scope</span>
                    <strong className="text-slate-900 font-bold text-xs block">
                      {inc.sre_blast_radius?.incident_scope || 'SYSTEMIC ISSUER OUTAGE'}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">Ecosystem-wide failure</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Degraded Rail</span>
                    <strong className="text-rose-700 font-bold text-xs block">
                      {inc.sre_blast_radius?.degraded_rail || 'HDFC Bank UPI'}
                    </strong>
                    <span className="text-[10px] text-rose-600 font-medium">
                      Success dropped to {Math.round((inc.current_success_rate || 0.38) * 100)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Blast Radius (Impact)</span>
                    <strong className="text-slate-900 font-bold text-xs block">
                      {inc.sre_blast_radius?.affected_customers || inc.affected_count || 5} Users • {inc.sre_blast_radius?.affected_txns || 5} Transactions
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ₹{atRiskRupees.toLocaleString()} Revenue at Risk
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-0.5 text-emerald-950">
                    <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">Circuit Breaker Action</span>
                    <strong className="text-emerald-800 font-bold text-xs block">Same-Rail Retries Suppressed</strong>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Fallback to {inc.circuit_breaker?.recommended_alternate_rail || 'Cards & Netbanking'}
                    </span>
                  </div>
                </div>

                {/* SRE Root Cause & Navigation Actions */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px] block">Payment SRE Diagnosis</span>
                    <p className="text-slate-700 font-medium mt-0.5">{inc.root_cause}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('incidents')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 hover:bg-blue-50 text-blue-900 text-xs font-bold transition-all shadow-2xs"
                    >
                      View Incident Cohort
                    </button>
                    <button
                      onClick={() => setActiveTab('cases')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Inspect Cases
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center space-x-3 shadow-card">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold text-xs">All payment rails operating within baseline health tolerances. No systemic outages detected.</span>
        </div>
      )}

      {/* Payment Rails Health Cards */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm">Payment Rail Success Rates & Volume</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthData.map((rail, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(rail.status)}`}>
                  {rail.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{rail.volume}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1">{rail.method}</h4>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className={`text-2xl font-extrabold ${rail.status === 'DEGRADED' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {rail.successRate}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ {rail.baseline}% baseline</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Revenue at Risk</span>
                <strong className={rail.riskRupees > 0 ? 'text-rose-600 font-bold' : 'text-slate-400 font-semibold'}>
                  ₹{rail.riskRupees.toLocaleString()}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
