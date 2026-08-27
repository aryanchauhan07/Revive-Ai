import React from 'react';
import { CheckSquare, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ApprovalCenter({ cases = [], onApproveAction }) {
  const approvalCases = cases.filter(c => c.status === 'APPROVAL_REQUIRED' || c.policy_decision?.requires_approval);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Human Manager Approval Queue</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">High-value transactions and policy exception review gate (Human-in-the-Loop)</p>
      </div>

      {approvalCases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-slate-200 bg-white shadow-card">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Approval Queue is Clean!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            All high-impact recovery actions are either processed inside policy bounds or executed in Autopilot mode.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvalCases.map((c) => (
            <div key={c.id} className="glass-panel rounded-2xl p-6 border border-amber-200 bg-amber-50/40 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300">
                      APPROVAL REQUIRED
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{c.customer_name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Order Ref: {c.provider_payment_id} • Phone: {c.customer_phone}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-extrabold text-slate-900">₹{(c.amount_paise / 100).toLocaleString()}</div>
                  <span className="text-xs text-amber-800 font-bold">High-Value Threshold Exceeded</span>
                </div>
              </div>

              {/* Policy Trigger Reason */}
              <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                <span className="text-slate-500 font-bold uppercase tracking-wider block">Policy Trigger Reason</span>
                <p className="text-slate-800 font-semibold">{c.policy_decision?.reason || 'Transaction value >= ₹25,000 requires explicit human approval.'}</p>
                <div className="text-slate-500 font-mono text-[11px] pt-1">
                  Matched Rules: {c.policy_decision?.matched_rules?.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-600 font-medium">
                  Proposed Action: <strong className="text-emerald-700">{c.current_plan?.actions[0]?.action}</strong> (3% Dynamic Recovery Discount)
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onApproveAction(c.id, { action: 'REJECT' })}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                  >
                    Reject & Stop
                  </button>
                  <button
                    onClick={() => onApproveAction(c.id, c.current_plan?.actions[0])}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Execute Action</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
