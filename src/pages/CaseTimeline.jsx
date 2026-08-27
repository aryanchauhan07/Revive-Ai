import React, { useState } from 'react';
import { Layers, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, MessageSquare } from 'lucide-react';

export default function CaseTimeline({ cases = [], onOpenCheckout, onOpenWhatsApp, onExecuteAction }) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'CASE-101');
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  if (!selectedCase) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recovery Case Manager & Lifecycle</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Single-payment failure diagnosis, structured action plan, and policy audit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cases List */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
          <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Select Recovery Case</h3>
          <div className="space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedCaseId === c.id
                    ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{c.customer_name}</span>
                  <span className="text-[11px] font-mono font-bold text-slate-900">₹{(c.amount_paise / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="text-slate-500 font-mono">{c.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                    c.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Case Deep-Dive */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedCase.customer_name}</h3>
                <span className="text-xs font-mono text-slate-500">({selectedCase.customer_email})</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Order Ref: {selectedCase.provider_payment_id}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900">₹{(selectedCase.amount_paise / 100).toLocaleString()}</span>
              <span className="text-xs text-slate-500 block font-mono">INR</span>
            </div>
          </div>

          {/* Diagnosis & Economics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider block">Failure Diagnosis</span>
              <p className="text-amber-800 font-bold">{selectedCase.current_plan?.diagnosis}</p>
              <div className="text-slate-500 font-mono text-[11px] pt-1">
                Reason: {selectedCase.failure_reason?.error_reason} ({selectedCase.failure_reason?.issuer})
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider block">Expected Economics</span>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Recoverability Probability:</span>
                <strong className="text-emerald-700 font-bold">{Math.round((selectedCase.current_plan?.recoverability?.probability || 0.85) * 100)}%</strong>
              </div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Expected Net Value:</span>
                <strong className="text-slate-900 font-bold">₹{((selectedCase.current_plan?.expectedEconomics?.expectedNetValuePaise || selectedCase.amount_paise) / 100).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Action Sequence Ladder */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Typed Action Plan Ladder</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {selectedCase.current_plan?.actions?.map((act, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center space-x-1 font-bold text-blue-700">
                    <span className="text-slate-400 font-mono">#{idx + 1}</span>
                    <span>{act.action}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">{act.reasonCodes?.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Decision Summary */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs flex items-start space-x-3 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="text-blue-950 block font-bold">Authoritative Policy Decision: {selectedCase.policy_decision?.decision}</strong>
              <p className="mt-0.5 text-blue-900 font-medium">{selectedCase.policy_decision?.reason || 'All standard merchant guardrails passed.'}</p>
            </div>
          </div>

          {/* Execute Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => onOpenWhatsApp(selectedCase)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Simulate WhatsApp Outreach</span>
            </button>

            <button
              onClick={() => onOpenCheckout(selectedCase)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Razorpay Pay Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
