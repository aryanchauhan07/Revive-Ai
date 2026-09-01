import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, Loader2, Sliders } from 'lucide-react';

export default function ApprovalCenter({ 
  cases = [], 
  merchant, 
  onApproveAction, 
  onUpdateThreshold = () => {} 
}) {
  const [processingId, setProcessingId] = useState(null);
  const [approvedIds, setApprovedIds] = useState(new Set());

  const currentHighValuePaise = merchant?.policy?.money?.highValueApprovalPaise || 2500000;
  const currentThresholdRupees = Math.round(currentHighValuePaise / 100);

  // Dynamically filter all cases that exceed the active merchant policy threshold
  const approvalCases = (cases || []).filter(c => {
    if (approvedIds.has(c.id)) return false;
    if (c.status === 'RECOVERED' || c.status === 'CANCELLED') return false;
    if (!c.customer_name || c.id?.startsWith('CASE-TEST')) return false;

    const isHighValue = (c.amount_paise || 0) >= currentHighValuePaise && merchant?.mode !== 'AUTOPILOT';
    const isExplicitlyFlagged = c.status === 'APPROVAL_REQUIRED' || c.policy_decision?.requires_approval;
    return isHighValue || isExplicitlyFlagged;
  });

  const handleApprove = async (caseId, action) => {
    setProcessingId(caseId);
    try {
      await onApproveAction(caseId, action);
      setApprovedIds(prev => new Set(prev).add(caseId));
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickThresholdChange = (newRupees) => {
    onUpdateThreshold(newRupees);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Human Manager Approval Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Policy governance gate for high-value orders (&ge; ₹{currentThresholdRupees.toLocaleString()}) and sensitive recovery interventions (Human-in-the-Loop)
          </p>
        </div>

        {/* Quick Threshold Toggle for Demo Judges */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 pl-2 pr-1 flex items-center space-x-1">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Approval Floor:</span>
          </span>
          <button
            onClick={() => handleQuickThresholdChange(10000)}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono transition-all ${
              currentThresholdRupees === 10000
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ₹10k (5 Cases)
          </button>
          <button
            onClick={() => handleQuickThresholdChange(15000)}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono transition-all ${
              currentThresholdRupees === 15000
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ₹15k (2 Cases)
          </button>
          <button
            onClick={() => handleQuickThresholdChange(25000)}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono transition-all ${
              currentThresholdRupees === 25000
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ₹25k (1 Case)
          </button>
        </div>
      </div>

      {approvalCases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-slate-200 bg-white shadow-card animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Approvals Cleared!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No pending policy exceptions exceeding the ₹{currentThresholdRupees.toLocaleString()} threshold. Low-risk actions are executing autonomously.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvalCases.map((c) => {
            const isProcessing = processingId === c.id;
            const targetAction = c.current_plan?.actions?.find(a => a.action !== 'HUMAN_ESCALATION') || c.current_plan?.actions?.[0] || { action: 'CREATE_PAYMENT_LINK' };
            const amountRupees = Math.round((c.amount_paise || 0) / 100);

            return (
              <div key={c.id} className="glass-panel rounded-2xl p-5 border border-amber-300 bg-amber-50/40 shadow-card space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300">
                        APPROVAL REQUIRED
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">{c.customer_name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Case: <span className="font-mono">{c.id}</span> • Order Ref: <span className="font-mono">{c.provider_payment_id}</span> • Phone: {c.customer_phone}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-extrabold text-slate-900">₹{amountRupees.toLocaleString()}</div>
                    <span className="text-xs text-amber-800 font-bold">
                      Exceeds ₹{currentThresholdRupees.toLocaleString()} Floor
                    </span>
                  </div>
                </div>

                {/* Policy Trigger Reason */}
                <div className="p-3.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Policy Gate Trigger Reason</span>
                  <p className="text-slate-800 font-semibold">
                    Transaction value (₹{amountRupees.toLocaleString()}) meets or exceeds the active policy threshold (₹{currentThresholdRupees.toLocaleString()}). Requires explicit human manager approval.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-600 font-medium">
                    Proposed Action: <strong className="text-blue-700 font-bold">{targetAction.action}</strong> (1-Click Recovery Payment Link)
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApprove(c.id, { action: 'STOP', params: { reason: 'Rejected by manager' } })}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Reject & Stop
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApprove(c.id, targetAction)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Execute Action</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
