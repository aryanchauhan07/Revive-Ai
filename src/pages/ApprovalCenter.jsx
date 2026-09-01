import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Filter, 
  Percent, 
  Crown, 
  TrendingUp, 
  Sparkles,
  Tag
} from 'lucide-react';

export default function ApprovalCenter({ 
  cases = [], 
  merchant, 
  onApproveAction 
}) {
  const [processingId, setProcessingId] = useState(null);
  const [approvedIds, setApprovedIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'VIP' | 'DISCOUNT' | 'MID_TIER' | 'STANDARD'

  const maxAutoDiscountPct = merchant?.policy?.money?.maxAutoDiscountPct || 2;

  // Filter valid active cases
  const validCases = (cases || []).filter(c => {
    if (approvedIds.has(c.id)) return false;
    if (c.status === 'RECOVERED' || c.status === 'CANCELLED') return false;
    if (!c.customer_name || c.id?.startsWith('CASE-TEST')) return false;
    return true;
  });

  // Calculate counts for each policy category
  const countVIP = validCases.filter(c => (c.amount_paise || 0) >= 2000000).length;
  const countDiscount = validCases.filter(c => {
    const discountAction = c.current_plan?.actions?.find(a => a.action === 'INCENTIVE');
    return (discountAction?.params?.discountPct || 0) > maxAutoDiscountPct;
  }).length;
  const countMid = validCases.filter(c => (c.amount_paise || 0) >= 1000000 && (c.amount_paise || 0) < 2000000).length;
  const countStandard = validCases.filter(c => (c.amount_paise || 0) < 1000000).length;

  // Filter cases based on selected category
  const displayedCases = validCases.filter(c => {
    const amt = (c.amount_paise || 0) / 100;
    const discountAction = c.current_plan?.actions?.find(a => a.action === 'INCENTIVE');
    const discountPct = discountAction?.params?.discountPct || 0;
    const hasDiscountReview = discountPct > maxAutoDiscountPct;

    if (selectedCategory === 'VIP') return amt >= 20000;
    if (selectedCategory === 'DISCOUNT') return hasDiscountReview;
    if (selectedCategory === 'MID_TIER') return amt >= 10000 && amt < 20000;
    if (selectedCategory === 'STANDARD') return amt < 10000;
    return true; // 'ALL'
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Human Manager Approval Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Multi-rule governance gateway: Categorized by VIP amount ceilings and dynamic discount policy reviews
          </p>
        </div>

        {/* Policy Trigger Category Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Pending ({validCases.length})
          </button>
          
          <button
            onClick={() => setSelectedCategory('VIP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              selectedCategory === 'VIP'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>₹20k+ VIP ({countVIP})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('DISCOUNT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              selectedCategory === 'DISCOUNT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Discount Review ({countDiscount})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('MID_TIER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              selectedCategory === 'MID_TIER'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ₹10k - ₹20k ({countMid})
          </button>

          <button
            onClick={() => setSelectedCategory('STANDARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              selectedCategory === 'STANDARD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ₹1k - ₹10k ({countStandard})
          </button>
        </div>
      </div>

      {displayedCases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-slate-200 bg-white shadow-card animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Approvals Cleared in this Category!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No pending exceptions under the selected policy rule. Autonomous recovery actions are executing safely.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCases.map((c) => {
            const isProcessing = processingId === c.id;
            const targetAction = c.current_plan?.actions?.find(a => a.action !== 'HUMAN_ESCALATION') || c.current_plan?.actions?.[0] || { action: 'CREATE_PAYMENT_LINK' };
            const amountRupees = Math.round((c.amount_paise || 0) / 100);

            // Policy Rule Evaluation
            const isVIP = amountRupees >= 20000;
            const isMidTier = amountRupees >= 10000 && amountRupees < 20000;
            const discountAction = c.current_plan?.actions?.find(a => a.action === 'INCENTIVE');
            const discountPct = discountAction?.params?.discountPct || 0;
            const hasDiscountReview = discountPct > maxAutoDiscountPct;
            const discountSavingsRupees = Math.round((amountRupees * discountPct) / 100);

            return (
              <div key={c.id} className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      {isVIP && (
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-extrabold border bg-purple-50 text-purple-700 border-purple-200 flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-purple-600" />
                          <span>VIP ORDER (&ge; ₹20k)</span>
                        </span>
                      )}
                      {isMidTier && (
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-extrabold border bg-amber-50 text-amber-800 border-amber-200">
                          HIGH-VALUE (₹10k-₹20k)
                        </span>
                      )}
                      {hasDiscountReview && (
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-extrabold border bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center space-x-1">
                          <Percent className="w-3 h-3 text-emerald-600" />
                          <span>{discountPct}% DYNAMIC DISCOUNT REVIEW</span>
                        </span>
                      )}
                      {!isVIP && !isMidTier && !hasDiscountReview && (
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                          STANDARD ORDER (&lt; ₹10k)
                        </span>
                      )}
                      <h3 className="font-extrabold text-slate-900 text-base">{c.customer_name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Case: <span className="font-mono">{c.id}</span> • Order Ref: <span className="font-mono">{c.provider_payment_id}</span> • Rail: <strong className="text-slate-700">{c.failure_reason?.issuer} ({c.failure_reason?.method?.toUpperCase()})</strong>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-extrabold text-slate-900">₹{amountRupees.toLocaleString()}</div>
                    {hasDiscountReview && (
                      <span className="text-xs text-emerald-700 font-bold block">
                        Save ₹{discountSavingsRupees.toLocaleString()} ({discountPct}% Off)
                      </span>
                    )}
                  </div>
                </div>

                {/* Specific Policy Rule Diagnosis */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Policy Gate Reason</span>
                  <p className="text-slate-800 font-semibold">
                    {isVIP && `High-value VIP transaction (₹${amountRupees.toLocaleString()} ≥ ₹20,000). Requires human manager authorization before dispatching recovery link.`}
                    {hasDiscountReview && ` Proposed ${discountPct}% dynamic recovery discount exceeds the automated 2% cap. Requires manager sign-off.`}
                    {!isVIP && !hasDiscountReview && (c.current_plan?.diagnosis || `Diagnosed ${c.failure_reason?.error_reason} on ${c.failure_reason?.issuer}. Ready for 1-click execution.`)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-600 font-medium">
                    Proposed Action: <strong className="text-blue-700 font-bold">{targetAction.action}</strong> {discountPct > 0 ? `(${discountPct}% Discount Link)` : '(1-Click Recovery Payment Link)'}
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
