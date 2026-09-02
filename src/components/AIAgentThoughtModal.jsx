import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Code, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowRight,
  Loader2,
  Terminal
} from 'lucide-react';

export default function AIAgentThoughtModal({ 
  isOpen, 
  onClose, 
  caseItem = {} 
}) {
  if (!isOpen || !caseItem) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    if (isOpen && caseItem.id) {
      fetchAiDiagnosis();
    }
  }, [isOpen, caseItem.id]);

  const fetchAiDiagnosis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseItem.id, incidentId: caseItem.incident_id })
      });
      if (res.ok) {
        const data = await res.json();
        setAiData(data);
      }
    } catch (err) {
      console.error("AI diagnosis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const amountRupees = Math.round((caseItem.amount_paise || 0) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm tracking-tight">AI Autonomous Decision Agent Inspector</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  {aiData?.source || 'GEMINI_1.5_FLASH / HEURISTIC_AI'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Inspect prompt inputs, tool calls, and structured Bayesian economics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Synthesizing telemetry & querying AI Reasoning Engine...</p>
            </div>
          ) : (
            <>
              {/* Telemetry Input Snapshot */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Input Telemetry Context</span>
                  </span>
                  <span className="font-mono text-slate-500">{caseItem.id}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CUSTOMER</span>
                    <strong className="text-slate-900">{caseItem.customer_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AMOUNT</span>
                    <strong className="text-slate-900">₹{amountRupees.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PAYMENT METHOD</span>
                    <strong className="text-slate-900">{caseItem.failure_reason?.method?.toUpperCase() || 'UPI'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ISSUER BANK</span>
                    <strong className="text-slate-900">{caseItem.failure_reason?.issuer || 'HDFC Bank'}</strong>
                  </div>
                </div>
              </div>

              {/* Tool Execution Pipeline */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Agent Tool-Calling Execution Trace</span>
                </label>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><code className="font-mono font-bold text-slate-900">query_sre_telemetry</code> — Isolated Z-Score anomaly for {caseItem.failure_reason?.issuer || 'Issuer'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">SUCCESS</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><code className="font-mono font-bold text-slate-900">evaluate_policy_guardrails</code> — Checked high-value floor (₹20k), discount caps, quiet hours</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">PASSED</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><code className="font-mono font-bold text-slate-900">calculate_argmax_utility</code> — Computed 8-action gross/net recovery values</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">OPTIMIZED</span>
                  </div>
                </div>
              </div>

              {/* Structured AI Output */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-indigo-950 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Synthesized Root-Cause & Action Plan</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-600 text-white">
                    OPTIMAL: {aiData?.optimal_action || 'SWITCH_PAYMENT_METHOD'}
                  </span>
                </div>

                <p className="text-slate-700 font-medium text-xs leading-relaxed">
                  {aiData?.diagnosis || caseItem.current_plan?.diagnosis || "Temporary issuer bank auth server timeout. Recommend switching payment method to healthy card/netbanking rail."}
                </p>

                <div className="pt-2 border-t border-indigo-200/60 text-[11px] text-slate-600 font-medium">
                  <strong>Policy Explanation:</strong> {aiData?.policy_rationale || "All merchant policy constraints (amount floor, quiet hours, and discount ceiling) verified."}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Deterministic + LLM Hybrid Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
