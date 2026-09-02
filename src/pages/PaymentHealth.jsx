import React, { useState } from 'react';
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
  Clock,
  Loader2,
  X,
  Radio,
  ChevronDown,
  Building2
} from 'lucide-react';

export default function PaymentHealth({ 
  incidents = [], 
  cases = [], 
  setActiveTab = () => {}, 
  onTriggerDemo = () => {},
  onOpenCheckout = () => {}
}) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [sreNotification, setSreNotification] = useState(null);
  
  // Custom Dynamic Bank Selector State
  const [selectedBank, setSelectedBank] = useState('Axis Bank');
  const [selectedMethod, setSelectedMethod] = useState('upi');

  const MAJOR_BANKS = [
    'Axis Bank',
    'Kotak Mahindra Bank',
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Punjab National Bank (PNB)',
    'Bank of Baroda',
    'Yes Bank',
    'IndusInd Bank',
    'Canara Bank',
    'Federal Bank'
  ];

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

  const handleSimulateOutage = async (bank, method, title, dropRate) => {
    setIsSimulating(true);
    try {
      await onTriggerDemo(bank, method);
      setSreNotification({
        id: Date.now(),
        title: `🚨 SRE Anomaly Triggered: ${title}!`,
        details: `Success Rate dropped to ${dropRate} (-2.8 Z-score). Circuit Breaker automatically TRIPPED to suppress failing same-rail retries for ${bank}.`,
        timestamp: new Date().toLocaleTimeString()
      });

      setTimeout(() => {
        setSreNotification(null);
      }, 5000);
    } catch (err) {
      console.error("Outage simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Floating SRE Outage Alert Notification */}
      {sreNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white border-2 border-rose-500 rounded-xl p-3 shadow-xl shadow-rose-500/10 animate-slide-in-right space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs leading-tight">
                  {sreNotification.title}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium font-mono">
                  SRE Circuit Breaker Activated • {sreNotification.timestamp}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSreNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10.5px] text-slate-600 font-medium leading-normal pl-9">
            {sreNotification.details}
          </p>
        </div>
      )}

      {/* Header & Universal Anomaly Generator Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment SRE Intelligence & Rail Health</h2>
          <p className="text-xs text-slate-500 font-medium">
            Universal payment ecosystem observability across all Indian banks, card networks, and AutoPay rails
          </p>
        </div>

        {/* Universal Bank Anomaly Simulation Bar */}
        <div className="flex items-center flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
          <div className="flex items-center space-x-1.5 pl-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBank}
              onChange={e => setSelectedBank(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
            >
              {MAJOR_BANKS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 uppercase font-mono text-[11px]"
          >
            <option value="upi">UPI Rail</option>
            <option value="card">Cards 3DS</option>
            <option value="mandate">AutoPay Mandate</option>
          </select>

          <button
            disabled={isSimulating}
            onClick={() => handleSimulateOutage(
              selectedBank, 
              selectedMethod, 
              `${selectedBank} ${selectedMethod.toUpperCase()} Outage`, 
              selectedMethod === 'upi' ? '38%' : selectedMethod === 'card' ? '68%' : '72%'
            )}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5" />
                <span>Simulate Outage</span>
              </>
            )}
          </button>
        </div>
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
                      {inc.sre_blast_radius?.degraded_rail || inc.title}
                    </strong>
                    <span className="text-[10px] text-rose-600 font-medium">
                      Success dropped to {Math.round((inc.current_success_rate || 0.38) * 100)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Blast Radius (Impact)</span>
                    <strong className="text-slate-900 font-bold text-xs block">
                      {inc.sre_blast_radius?.affected_customers || inc.affected_count || 3} Users • {inc.sre_blast_radius?.affected_txns || 3} Transactions
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

                {/* Root Cause & Diagnostic Signals */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-900 block">Root-Cause Diagnosis</span>
                    <p className="text-slate-600 font-medium">{inc.root_cause || "Issuer bank auth server timeout. Spike in gateway technical errors."}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('incidents')}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center space-x-1 transition-all shrink-0 shadow-2xs"
                  >
                    <span>Inspect Cohort</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-2 border border-slate-200 bg-white shadow-card">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">All Payment Rails Healthy</h3>
          <p className="text-xs text-slate-500">Zero active ecosystem degradation incidents detected.</p>
        </div>
      )}

      {/* Real-Time Payment Rail Performance Telemetry Matrix */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Real-Time Payment Rail Performance Matrix</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono font-medium">5-minute rolling window</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthData.map((rail, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                rail.status === 'DEGRADED' 
                  ? 'bg-rose-50/50 border-rose-300 shadow-2xs' 
                  : rail.status === 'WATCH' 
                    ? 'bg-amber-50/40 border-amber-300' 
                    : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">{rail.method}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getStatusBadge(rail.status)}`}>
                  {rail.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  {rail.successRate}%
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Baseline: {rail.baseline}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-mono">
                <span>Vol: {rail.volume}</span>
                {rail.riskRupees > 0 && (
                  <span className="font-bold text-rose-700">₹{rail.riskRupees.toLocaleString()} at risk</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
