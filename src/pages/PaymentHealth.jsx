import React from 'react';
import { Zap, AlertTriangle, CheckCircle2, RefreshCw, Activity } from 'lucide-react';

export default function PaymentHealth({ incidents = [], onTriggerDemo }) {
  const healthData = [
    { method: 'UPI (GPay / PhonePe / Paytm)', successRate: 74, baseline: 88, status: 'DEGRADED', issuer: 'HDFC Bank', volume: '1,420 txns' },
    { method: 'Credit & Debit Cards', successRate: 91, baseline: 92, status: 'HEALTHY', issuer: 'Visa / Mastercard', volume: '840 txns' },
    { method: 'Netbanking (ICICI / SBI / Axis)', successRate: 95, baseline: 94, status: 'HEALTHY', issuer: 'Multi-bank', volume: '310 txns' },
    { method: 'AutoPay e-Mandates', successRate: 81, baseline: 86, status: 'HEALTHY', issuer: 'Recurring', volume: '190 txns' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment Health & Anomaly Detector</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">5-minute rolling success baselines by payment rail, issuer, and PSP gateway</p>
        </div>
        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Simulate Rail Anomaly</span>
        </button>
      </div>

      {/* Degradation Alert Banners */}
      {incidents.filter(i => i.status === 'OPEN').map(inc => (
        <div key={inc.id} className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-extrabold text-sm">{inc.title}</strong>
              <span className="text-xs font-mono bg-rose-100 px-2.5 py-0.5 rounded-full text-rose-800 border border-rose-200 font-bold">
                Z-Score: {inc.z_score}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-1">{inc.root_cause}</p>
            <div className="mt-3 flex items-center space-x-6 text-xs font-mono">
              <span>Baseline: <strong className="text-slate-900">{Math.round(inc.baseline_success_rate * 100)}%</strong></span>
              <span>Current: <strong className="text-rose-700">{Math.round(inc.current_success_rate * 100)}%</strong></span>
              <span>Revenue at Risk: <strong className="text-slate-900">₹{(inc.revenue_at_risk_paise / 100).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      ))}

      {/* Rail Health Cards */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Payment Rail Performance Monitor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.map((item, idx) => (
            <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{item.method}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  item.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Success Rate</span>
                  <span className={item.status === 'HEALTHY' ? 'text-emerald-700' : 'text-rose-700'}>{item.successRate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${item.successRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1 font-mono font-medium">
                <span>Baseline: {item.baseline}%</span>
                <span>Issuer: {item.issuer}</span>
                <span>Vol: {item.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
