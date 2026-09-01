import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Percent, 
  Crown, 
  Sparkles, 
  Tag, 
  ShieldAlert, 
  Sliders, 
  Check, 
  X, 
  Bell,
  Send,
  Zap
} from 'lucide-react';

export default function ApprovalCenter({ 
  cases = [], 
  merchant, 
  onApproveAction 
}) {
  const [processingId, setProcessingId] = useState(null);
  const [approvedIds, setApprovedIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('PENDING'); // 'PENDING' | 'HIGH_VALUE' | 'DISCOUNT' | 'AUTONOMOUS'
  
  // Notification Toast State for Executed / Rejected Actions
  const [notification, setNotification] = useState(null);

  const currentHighValuePaise = merchant?.policy?.money?.highValueApprovalPaise || 2000000;
  const currentThresholdRupees = Math.round(currentHighValuePaise / 100);
  const maxAutoDiscountPct = merchant?.policy?.money?.maxAutoDiscountPct || 2;

  // Filter valid cases
  const validCases = (cases || []).filter(c => {
    if (!c.customer_name || c.id?.startsWith('CASE-TEST')) return false;
    return true;
  });

  // Evaluate which rule (if any) flags each case for human approval
  const annotatedCases = validCases.map(c => {
    const amountRupees = Math.round((c.amount_paise || 0) / 100);
    const discountAction = c.current_plan?.actions?.find(a => a.action === 'INCENTIVE');
    const discountPct = discountAction?.params?.discountPct || 0;

    const isHighValue = (c.amount_paise || 0) >= currentHighValuePaise && merchant?.mode !== 'AUTOPILOT';
    const isDiscountExceeded = discountPct > maxAutoDiscountPct;
    const isApproved = approvedIds.has(c.id) || c.status === 'RECOVERED';

    let ruleId = 'AUTONOMOUS_EXECUTION';
    let ruleName = 'No Exception (Autonomous Auto-Execution)';
    let ruleCategory = 'NONE';
    let reviewRationale = 'Transaction amount and recovery action are within standard policy guardrails. Handled autonomously by AI.';

    if (isHighValue && isDiscountExceeded) {
      ruleId = 'HIGH_VALUE_AND_DISCOUNT_CAP';
      ruleName = `RULE: HIGH_VALUE_FLOOR & INCENTIVE_CAP`;
      ruleCategory = 'BOTH';
      reviewRationale = `Order value (₹${amountRupees.toLocaleString()} ≥ ₹${currentThresholdRupees.toLocaleString()}) and proposed recovery incentive (${discountPct}% > ${maxAutoDiscountPct}% auto cap) both exceed policy thresholds. Requires human manager sign-off before dispatching link.`;
    } else if (isHighValue) {
      ruleId = 'RULE_HIGH_VALUE_THRESHOLD';
      ruleName = `RULE: HIGH_VALUE_FLOOR_EXCEEDED (₹${amountRupees.toLocaleString()} ≥ ₹${currentThresholdRupees.toLocaleString()})`;
      ruleCategory = 'HIGH_VALUE';
      reviewRationale = `High-value order (₹${amountRupees.toLocaleString()} meets or exceeds the active ₹${currentThresholdRupees.toLocaleString()} manager approval floor). Policy requires senior manager review before automated checkout recovery is triggered to prevent unauthorized high-exposure retries.`;
    } else if (isDiscountExceeded) {
      ruleId = 'RULE_DISCOUNT_CEILING';
      ruleName = `RULE: DYNAMIC_INCENTIVE_CAP_EXCEEDED (${discountPct}% > ${maxAutoDiscountPct}% Auto Cap)`;
      ruleCategory = 'DISCOUNT';
      reviewRationale = `AI proposed a ${discountPct}% dynamic recovery discount (saves ₹${Math.round((amountRupees * discountPct)/100).toLocaleString()}) to recover an abandoned checkout. Because this exceeds the ${maxAutoDiscountPct}% autonomous discount limit, human manager authorization is required to protect merchant gross margins.`;
    }

    const requiresHumanReview = (isHighValue || isDiscountExceeded) && !isApproved;

    return {
      ...c,
      amountRupees,
      discountPct,
      isHighValue,
      isDiscountExceeded,
      isApproved,
      requiresHumanReview,
      ruleId,
      ruleName,
      ruleCategory,
      reviewRationale
    };
  });

  // Filter lists
  const pendingApprovals = annotatedCases.filter(c => c.requiresHumanReview);
  const highValueCases = pendingApprovals.filter(c => c.isHighValue);
  const discountCases = pendingApprovals.filter(c => c.isDiscountExceeded);
  const autonomousCases = annotatedCases.filter(c => !c.requiresHumanReview);

  // Cases to display based on active tab
  let displayedCases = pendingApprovals;
  if (activeFilter === 'HIGH_VALUE') displayedCases = highValueCases;
  else if (activeFilter === 'DISCOUNT') displayedCases = discountCases;
  else if (activeFilter === 'AUTONOMOUS') displayedCases = autonomousCases;

  const handleApprove = async (caseId, action, caseItem) => {
    setProcessingId(caseId);
    const isReject = action.action === 'STOP';
    const amountRupees = Math.round((caseItem?.amount_paise || 0) / 100).toLocaleString();
    const customerName = caseItem?.customer_name || 'Customer';

    try {
      await onApproveAction(caseId, action);
      setApprovedIds(prev => new Set(prev).add(caseId));

      // Trigger modern aesthetic toast notification
      setNotification({
        id: Date.now(),
        type: isReject ? 'REJECT' : 'APPROVE',
        title: isReject 
          ? `Outreach Rejected & Stopped` 
          : `Recovery Action Approved & Executed`,
        customerName: customerName,
        caseId: caseId,
        amount: amountRupees,
        actionName: isReject ? 'STOP Outreach' : `${action.action} (1-Click Link)`,
        timestamp: new Date().toLocaleTimeString(),
        description: isReject
          ? `Outreach for ${customerName} (₹${amountRupees}) permanently halted by manager decision.`
          : `Manager sign-off verified. Dispatched 1-click recovery payment link (₹${amountRupees}) to ${customerName} via WhatsApp & SMS.`
      });

      // Auto-dismiss notification after 4 seconds
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err) {
      console.error("Approval execution error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Ultra-Aesthetic Floating Dark Glass Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 max-w-md w-full animate-slide-in-right overflow-hidden rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl text-white">
          {/* Glowing Top Accent Bar */}
          <div className={`h-1 w-full ${
            notification.type === 'APPROVE'
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
              : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500'
          }`} />

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold relative shrink-0 ${
                  notification.type === 'APPROVE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {notification.type === 'APPROVE' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-400 absolute -top-0.5 -right-0.5 animate-ping" />
                      <XCircle className="w-5 h-5 text-rose-400" />
                    </>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-white text-xs tracking-tight flex items-center space-x-1.5">
                    <span>{notification.title}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium font-mono mt-0.5">
                    {notification.customerName} • {notification.caseId} • {notification.timestamp}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed pl-0.5">
              {notification.description}
            </p>

            <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 font-bold border border-slate-700">
                ₹{notification.amount}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                notification.type === 'APPROVE'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}>
                {notification.actionName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 font-bold border border-blue-500/40">
                Dispatched
              </span>
            </div>
          </div>

          {/* Animated Auto-Dismiss Progress Line */}
          <div className="h-0.5 w-full bg-slate-800">
            <div className={`h-full animate-toast-timer ${
              notification.type === 'APPROVE' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Human Manager Approval Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Explicit policy exceptions requiring human manager review • Active Floor: <strong className="text-slate-900 font-bold">₹{currentThresholdRupees.toLocaleString()}</strong> • Auto-Discount Cap: <strong className="text-slate-900 font-bold">{maxAutoDiscountPct}%</strong>
          </p>
        </div>

        {/* Rule Filter Selector */}
        <div className="flex items-center flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeFilter === 'PENDING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pending Approvals ({pendingApprovals.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('HIGH_VALUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              activeFilter === 'HIGH_VALUE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>High-Value Floor ({highValueCases.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('DISCOUNT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              activeFilter === 'DISCOUNT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Discount Cap Review ({discountCases.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('AUTONOMOUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              activeFilter === 'AUTONOMOUS'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Autonomous Cases ({autonomousCases.length})</span>
          </button>
        </div>
      </div>

      {displayedCases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-slate-200 bg-white shadow-card animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Approvals Cleared!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            There are zero pending policy exceptions in this category. All standard cases are being executed autonomously within safety bounds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCases.map((c) => {
            const isProcessing = processingId === c.id;
            const targetAction = c.current_plan?.actions?.find(a => a.action !== 'HUMAN_ESCALATION') || c.current_plan?.actions?.[0] || { action: 'CREATE_PAYMENT_LINK' };

            return (
              <div 
                key={c.id} 
                className={`glass-panel rounded-2xl p-5 border shadow-card space-y-4 transition-all ${
                  c.requiresHumanReview 
                    ? 'border-amber-300 bg-amber-50/40' 
                    : 'border-slate-200 bg-white opacity-85'
                }`}
              >
                {/* Case Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-extrabold border flex items-center space-x-1 ${
                        c.isHighValue
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : c.isDiscountExceeded
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {c.isHighValue && <Crown className="w-3 h-3 text-purple-700" />}
                        {c.isDiscountExceeded && <Percent className="w-3 h-3 text-emerald-700" />}
                        <span>
                          {c.isHighValue ? `HIGH-VALUE (≥ ₹${currentThresholdRupees.toLocaleString()})` : c.isDiscountExceeded ? `${c.discountPct}% DISCOUNT CAP REVIEW` : 'AUTONOMOUS RECOVERY'}
                        </span>
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">{c.customer_name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Case: <span className="font-mono">{c.id}</span> • Order Ref: <span className="font-mono">{c.provider_payment_id}</span> • Rail: <strong className="text-slate-700">{c.failure_reason?.issuer} ({c.failure_reason?.method?.toUpperCase()})</strong>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-extrabold text-slate-900">₹{c.amountRupees.toLocaleString()}</div>
                    {c.discountPct > 0 && (
                      <span className="text-xs text-emerald-700 font-bold block">
                        Includes {c.discountPct}% Dynamic Discount (Save ₹{Math.round((c.amountRupees * c.discountPct)/100).toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>

                {/* Explicit Policy Rule & Reason Box */}
                <div className="p-4 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-mono font-bold uppercase text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>{c.ruleName}</span>
                  </div>
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    {c.reviewRationale}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-600 font-medium">
                    Proposed Recovery Action: <strong className="text-blue-700 font-bold">{targetAction.action}</strong> {c.discountPct > 0 ? `(${c.discountPct}% Recovery Discount Link)` : '(1-Click Recovery Payment Link)'}
                  </div>

                  {c.requiresHumanReview ? (
                    <div className="flex items-center space-x-3">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApprove(c.id, { action: 'STOP', params: { reason: 'Rejected by manager' } }, c)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject & Stop</span>
                      </button>
                      
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApprove(c.id, targetAction, c)}
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
                  ) : (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Executing Autonomously within Guardrails</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
