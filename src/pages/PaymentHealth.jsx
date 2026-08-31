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
  ChevronRight
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
      successRate: openIncidents.length > 0 ? 41 : 88, 
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment Health & Rails Monitor</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time success baselines across active Razorpay payment methods</p>
        </div>
        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-2xs shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-amber-600" />
          <span>Simulate Rail Degradation</span>
        </button>
      </div>

      {/* ACTIVE INCIDENT CARD - Clean, focused, uncrowded */}
      {openIncidents.length > 0 ? (
        <div className="space-y-3">
          {openIncidents.map((inc) => {
            const atRiskRupees = Math.round((inc.revenue_at_risk_paise || totalAtRiskPaise) / 100);
            const recoveredRupees = Math.round(totalRecoveredPaise / 100);

            return (
              <div 
                key={inc.id} 
                className="glass-panel rounded-2xl p-5 border border-rose-200 bg-white shadow-card space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                      {inc.id}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{inc.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">
                      Success: {Math.round(inc.current_success_rate * 100)}% (Baseline: {Math.round(inc.baseline_success_rate * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Root Cause & Recommendation Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Root Cause Isolation</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">{inc.root_cause}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-blue-950">
                    <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Recommended Action</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-1 rounded-lg bg-white border border-blue-200 font-bold text-slate-800 text-[11px]">1. WAIT 15m</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      <span className="px-2 py-1 rounded-lg bg-white border border-blue-200 font-bold text-indigo-700 text-[11px]">2. SWITCH_METHOD</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      <span className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]">3. CREATE_LINK</span>
                    </div>
                  </div>
                </div>

                {/* Impact & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center space-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Revenue at Risk</span>
                      <strong className="text-rose-700 font-extrabold text-sm">₹{atRiskRupees.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Affected Cohort</span>
                      <strong className="text-slate-800 font-extrabold text-sm">{affectedCount} Customers</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Already Recovered</span>
                      <strong className="text-emerald-700 font-extrabold text-sm">₹{recoveredRupees.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('incidents')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                    >
                      View Incident Cohort
                    </button>
                    <button
                      onClick={() => setActiveTab('cases')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      View Recovery Cases
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
              <h4 className="font-bold text-sm text-slate-900">All Payment Rails Healthy</h4>
              <p className="text-xs text-slate-500">No degradation incidents active across rolling success baselines.</p>
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

      {/* 4 RAIL PERFORMANCE CARDS - Clean & Spaced */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Payment Rail Success Rates</h3>
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
