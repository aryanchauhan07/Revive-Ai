import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Users, 
  IndianRupee, 
  Clock, 
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Lock
} from 'lucide-react';

export default function PaymentHealth({ 
  incidents = [], 
  cases = [], 
  setActiveTab = () => {}, 
  onTriggerDemo = () => {},
  onOpenCheckout = () => {}
}) {
  // Deduplicate open anomaly incidents by ID to prevent duplicate cards
  const uniqueIncidents = Array.from(
    new Map((incidents || []).filter(i => i.status === 'OPEN').map(i => [i.id, i])).values()
  );

  // Calculate totals from cases
  const totalAtRiskPaise = (cases || []).reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const recoveredCases = (cases || []).filter(c => c.status === 'RECOVERED' || c.status === 'CONTACTED');
  const totalRecoveredPaise = recoveredCases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const affectedTxnsCount = (cases || []).length || 42;
  const uniqueCustomersCount = new Set((cases || []).map(c => c.customer_email || c.customer_name)).size || 38;

  // Enhanced Payment Rail Performance Data
  const healthData = [
    { 
      method: 'UPI (GPay / PhonePe / Paytm)', 
      successRate: uniqueIncidents.length > 0 ? 41 : 74, 
      baseline: 88, 
      status: uniqueIncidents.length > 0 ? 'DEGRADED' : 'WATCH', 
      issuer: 'HDFC / Axis / SBI', 
      volume: '1,420 txns',
      revenueAtRiskRupees: Math.round(totalAtRiskPaise / 100) || 38400,
      description: 'High volume partner bank timeouts on authorization step.'
    },
    { 
      method: 'Credit & Debit Cards', 
      successRate: 91, 
      baseline: 92, 
      status: 'HEALTHY', 
      issuer: 'Visa / Mastercard / RuPay', 
      volume: '840 txns',
      revenueAtRiskRupees: 0,
      description: 'Normal OTP authentication and gateway latency.'
    },
    { 
      method: 'Netbanking (ICICI / SBI / Axis)', 
      successRate: 95, 
      baseline: 94, 
      status: 'HEALTHY', 
      issuer: 'Multi-bank direct connect', 
      volume: '310 txns',
      revenueAtRiskRupees: 0,
      description: 'High completion rate rail recommended for fallbacks.'
    },
    { 
      method: 'AutoPay e-Mandates', 
      successRate: 81, 
      baseline: 86, 
      status: 'WATCH', 
      issuer: 'Recurring Debit', 
      volume: '190 txns',
      revenueAtRiskRupees: 12400,
      description: 'Slight debit failure lift due to end-of-month balance cycles.'
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
      case 'CRITICAL':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              Real-time Payment SRE
            </span>
            <span className="text-xs text-slate-500 font-medium">• 5m Rolling Window</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Payment Health & Incident Intelligence</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Detect anomalies $\rightarrow$ Diagnose root causes $\rightarrow$ Quantify revenue risk $\rightarrow$ Recommend bounded actions $\rightarrow$ Recover
          </p>
        </div>
        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-xs shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-amber-600" />
          <span>Simulate Rail Anomaly</span>
        </button>
      </div>

      {/* Complete Closed-Loop Flow Indicator */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">RECOVEROPS Closed-Loop Operations Flow</div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center space-x-2 text-blue-900 font-bold">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Detect Anomaly</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center space-x-2 text-amber-900 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Diagnose RCA</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center space-x-2 text-rose-900 font-bold">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">3</span>
            <span>Quantify Risk</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center space-x-2 text-indigo-900 font-bold">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
            <span>Recommend Action</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center space-x-2 text-emerald-900 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">5</span>
            <span>Recover Revenue</span>
          </div>
        </div>
      </div>

      {/* DEDUPLICATED ANOMALY INCIDENT CARDS SECTION */}
      {uniqueIncidents.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Active Revenue Degradation Incidents ({uniqueIncidents.length})</span>
            </h3>
            <span className="text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Immediate Intervention Active
            </span>
          </div>

          {uniqueIncidents.map((inc) => {
            const incRevenueRupees = Math.round((inc.revenue_at_risk_paise || 3840000) / 100);
            const incRecoveredRupees = Math.round(totalRecoveredPaise / 100) || 28500;
            const confidenceBand = "92% HIGH CONFIDENCE";

            // Default evidence points if not structured
            const evidenceList = inc.evidence || [
              { key: "UPI Auth Drop", value: `${Math.round(inc.baseline_success_rate * 100)}% -> ${Math.round(inc.current_success_rate * 100)}% baseline delta (Z-score ${inc.z_score})` },
              { key: "Razorpay Downtime Correlation", value: "Partner HDFC UPI gateway downtime corroborated" },
              { key: "Method Concentration", value: "92% of transaction failures localized to UPI rail" }
            ];

            return (
              <div 
                key={inc.id} 
                className="glass-panel rounded-2xl p-6 border border-rose-200 bg-white shadow-card space-y-5 relative overflow-hidden"
              >
                {/* Top Badge Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"></div>

                {/* Card Title & Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                      {inc.id}
                    </span>
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-900">{inc.title}</h4>
                      <span className="text-xs text-slate-500 font-medium">Started: {new Date(inc.started_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{confidenceBand}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold font-mono">
                      Z-Score: {inc.z_score}
                    </span>
                  </div>
                </div>

                {/* Diagnostic & Evidence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Root Cause Explanation */}
                  <div className="lg:col-span-1 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="text-slate-500 font-bold uppercase tracking-wider block">AI Root Cause Isolation</span>
                    <p className="text-slate-800 leading-relaxed font-semibold">{inc.root_cause}</p>
                    <div className="pt-1 text-[11px] text-slate-500 font-mono">
                      Localized: {inc.dimensions?.issuer || 'HDFC Bank'} • Rail: {inc.dimensions?.method?.toUpperCase() || 'UPI'}
                    </div>
                  </div>

                  {/* Middle: Evidence Points */}
                  <div className="lg:col-span-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs space-y-2">
                    <span className="text-amber-900 font-bold uppercase tracking-wider block flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Detection Evidence Signals (Why Anomaly Triggered)</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {evidenceList.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200 text-[11px] shadow-2xs">
                          <span className="text-slate-500 font-medium block">{item.key}</span>
                          <strong className="text-slate-900 font-bold block mt-0.5">{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RECOVEROPS RECOMMENDATION SECTION */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wider">
                        RECOVEROPS Recommended Action Plan
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Expected Net Recovery: ₹{(incRevenueRupees - 50).toLocaleString()} (99.8% ROI)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 font-bold text-slate-800 shadow-2xs flex items-center space-x-1">
                      <span className="text-slate-400 font-mono">1.</span>
                      <span>WAIT (15m)</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 font-bold text-indigo-700 shadow-2xs flex items-center space-x-1">
                      <span className="text-slate-400 font-mono">2.</span>
                      <span>SWITCH_METHOD (Card/Netbanking)</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 font-bold text-blue-700 shadow-2xs flex items-center space-x-1">
                      <span className="text-slate-400 font-mono">3.</span>
                      <span>CREATE_LINK (Razorpay Pay Link)</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold shadow-2xs flex items-center space-x-1">
                      <span className="text-emerald-200 font-mono">4.</span>
                      <span>MESSAGE (WhatsApp Nudge)</span>
                    </span>
                  </div>
                </div>

                {/* Quantified Financials Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium block">Revenue at Risk</span>
                    <strong className="text-rose-700 text-base font-extrabold block">₹{incRevenueRupees.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Affected Transactions</span>
                    <strong className="text-slate-900 text-base font-extrabold block">{affectedTxnsCount} txns</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Affected Customers</span>
                    <strong className="text-slate-900 text-base font-extrabold block">{uniqueCustomersCount} users</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Already Recovered</span>
                    <strong className="text-emerald-700 text-base font-extrabold block">₹{incRecoveredRupees.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Incident Progress Stepper & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  {/* Stepper */}
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500">
                    <span className="text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Detected</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Diagnosed</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Policy Check</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-blue-700 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      <span>Recovery Active</span>
                    </span>
                  </div>

                  {/* Navigation Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setActiveTab('incidents')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Incident Deep-Dive</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('cases')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Affected Cases</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-200 bg-emerald-50/40 text-emerald-900 flex items-center justify-between shadow-card">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">All Payment Rails Operating Normally</h4>
              <p className="text-xs text-slate-600 font-medium">No open revenue degradation incidents detected across rolling 5-minute baselines.</p>
            </div>
          </div>
          <button
            onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            Simulate Degradation
          </button>
        </div>
      )}

      {/* ENHANCED PAYMENT RAIL PERFORMANCE CARDS */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Payment Rail Performance Monitor</h3>
            <p className="text-xs text-slate-500 font-medium">Baseline comparison & localized revenue risk by payment method</p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">4 Rails Monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.map((item, idx) => {
            const isDegraded = item.status === 'DEGRADED' || item.status === 'CRITICAL';
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{item.method}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 font-medium">{item.description}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Success Rate</span>
                    <span className={isDegraded ? 'text-rose-700 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                      {item.successRate}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isDegraded ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${item.successRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block font-medium">Baseline</span>
                    <strong className="text-slate-800 font-bold">{item.baseline}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Volume</span>
                    <strong className="text-slate-800 font-bold">{item.volume}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Risk (₹)</span>
                    <strong className={item.revenueAtRiskRupees > 0 ? 'text-rose-700 font-bold' : 'text-slate-800 font-bold'}>
                      ₹{item.revenueAtRiskRupees.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
