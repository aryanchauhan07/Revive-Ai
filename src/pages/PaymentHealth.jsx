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
  Flame
} from 'lucide-react';

export default function PaymentHealth({ 
  incidents = [], 
  cases = [], 
  setActiveTab = () => {}, 
  onTriggerDemo = () => {},
  onOpenCheckout = () => {}
}) {
  // Deduplicate open anomaly incidents by ID
  const openIncidents = Array.from(
    new Map((incidents || []).filter(i => i.status === 'OPEN').map(i => [i.id, i])).values()
  );

  // Summary Metrics
  const totalAtRiskPaise = (cases || []).reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const recoveredCases = (cases || []).filter(c => c.status === 'RECOVERED');
  const totalRecoveredPaise = recoveredCases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const affectedCount = (cases || []).length || 5;

  // Rail Performance Cards
  const healthData = [
    { 
      method: 'UPI (GPay / PhonePe / Paytm)', 
      successRate: openIncidents.length > 0 ? 38 : 88, 
      baseline: 88, 
      status: openIncidents.length > 0 ? 'DEGRADED' : 'HEALTHY', 
      volume: '1,420 txns',
      riskRupees: openIncidents.length > 0 ? Math.round(totalAtRiskPaise / 100) : 0
    },
    { 
      method: 'Credit & Debit Cards', 
      successRate: 91, 
      baseline: 92, 
      status: 'HEALTHY', 
      volume: '840 txns',
      riskRupees: 0
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
      successRate: 81, 
      baseline: 86, 
      status: 'WATCH', 
      volume: '190 txns',
      riskRupees: 12400
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
          <p className="text-xs text-slate-500 font-medium">Real-time payment ecosystem observability, blast-radius analysis, and recovery circuit breakers</p>
        </div>
        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-2xs shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-amber-600" />
          <span>Simulate Systemic Outage</span>
        </button>
      </div>

      {/* SRE BLAST RADIUS & CIRCUIT BREAKER ALERT CARD */}
      {openIncidents.length > 0 ? (
        <div className="space-y-3">
          {openIncidents.map((inc) => {
            const atRiskRupees = Math.round((inc.revenue_at_risk_paise || totalAtRiskPaise) / 100);
            const recoveredRupees = Math.round(totalRecoveredPaise / 100);

            return (
              <div 
                key={inc.id} 
                className="glass-panel rounded-2xl p-5 border border-rose-300 bg-white shadow-card space-y-4"
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
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-extrabold shadow-xs flex items-center space-x-1.5 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>CIRCUIT BREAKER: TRIPPED</span>
                    </span>
                  </div>
                </div>

                {/* SRE Blast Radius Telemetry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Incident Scope</span>
                    <strong className="text-slate-900 font-bold text-xs block">SYSTEMIC ISSUER OUTAGE</strong>
                    <span className="text-[10px] text-slate-500 font-medium">Ecosystem-wide failure</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Degraded Rail</span>
                    <strong className="text-rose-700 font-bold text-xs block">HDFC Bank UPI</strong>
                    <span className="text-[10px] text-rose-600 font-medium">Success dropped to 38%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Blast Radius (Impact)</span>
                    <strong className="text-slate-900 font-bold text-xs block">5 Users • 5 Transactions</strong>
                    <span className="text-[10px] text-slate-500 font-medium">₹59,249 Revenue at Risk</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-0.5 text-emerald-950">
                    <span className="text-emerald-900 font-bold uppercase tracking-wider text-[10px]">Circuit Breaker Action</span>
                    <strong className="text-emerald-800 font-bold text-xs block">Same-Rail Retries Suppressed</strong>
                    <span className="text-[10px] text-emerald-700 font-medium">Fallback to Cards & Netbanking</span>
                  </div>
                </div>

                {/* Root Cause & Action Strategy */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950">
                  <div>
                    <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px] block">Payment SRE Diagnosis</span>
                    <p className="text-slate-800 font-semibold mt-0.5">{inc.root_cause}</p>
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
        <div className="glass-panel rounded-2xl p-4 border border-emerald-200 bg-emerald-50/50 text-emerald-900 flex items-center justify-between shadow-card">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Payment Ecosystem SRE Healthy</h4>
              <p className="text-xs text-slate-500">No systemic gateway or rail degradation detected. Circuit Breakers in NORMAL state.</p>
            </div>
          </div>
          <button
            onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-2xs"
          >
            Simulate Outage
          </button>
        </div>
      )}

      {/* 4 RAIL PERFORMANCE CARDS */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Payment Rail Success Rates & Volume</h3>
          <span className="text-xs font-mono text-slate-400 font-medium">4 Monitored Rails</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthData.map((item, idx) => {
            const isDegraded = item.status === 'DEGRADED';
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 line-clamp-1">{item.method}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Success Rate</span>
                    <span className={isDegraded ? 'text-rose-700' : 'text-emerald-700'}>
                      {item.successRate}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isDegraded ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${item.successRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Base: {item.baseline}%</span>
                  <span>Vol: {item.volume}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
