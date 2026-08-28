import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  MessageSquare,
  Search,
  Filter,
  CreditCard,
  QrCode,
  Landmark,
  RefreshCw
} from 'lucide-react';

export default function CaseTimeline({ 
  cases = [], 
  onOpenCheckout = () => {}, 
  onOpenWhatsApp = () => {}, 
  onExecuteAction = () => {} 
}) {
  // Deduplicate cases by ID
  const uniqueCases = Array.from(
    new Map((cases || []).map(c => [c.id, c])).values()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [railFilter, setRailFilter] = useState('ALL');
  const [selectedCaseId, setSelectedCaseId] = useState(uniqueCases[0]?.id || 'CASE-101');

  // Filtered Cases
  const filteredCases = uniqueCases.filter(c => {
    const matchesSearch = 
      c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesRail = railFilter === 'ALL' || c.failure_reason?.method?.toLowerCase() === railFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesRail;
  });

  const selectedCase = uniqueCases.find(c => c.id === selectedCaseId) || filteredCases[0] || uniqueCases[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recovery Case Manager & Lifecycle</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Individualized payment failure diagnosis, customer economics, and policy audit
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs w-36 sm:w-44"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">PLANNED</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="APPROVAL_REQUIRED">APPROVAL_REQUIRED</option>
            <option value="RECOVERED">RECOVERED</option>
          </select>

          <select
            value={railFilter}
            onChange={e => setRailFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="ALL">All Payment Rails</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="mandate">e-Mandate</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cases List */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Unique Recovery Cases ({filteredCases.length})</h3>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[560px] custom-scrollbar pr-1">
            {filteredCases.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No cases matching filters.</p>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{c.customer_name}</span>
                      <span className="text-[11px] font-mono font-extrabold text-slate-900">₹{(c.amount_paise / 100).toLocaleString()}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">{c.failure_reason?.error_reason} ({c.failure_reason?.issuer})</div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-slate-400 font-mono">{c.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                        c.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        c.status === 'APPROVAL_REQUIRED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Case Deep-Dive Timeline */}
        {selectedCase ? (
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedCase.customer_name}</h3>
                  <span className="text-xs font-mono text-slate-500">({selectedCase.customer_email})</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Order Ref: {selectedCase.provider_payment_id} • Phone: {selectedCase.customer_phone}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl font-extrabold text-slate-900">₹{(selectedCase.amount_paise / 100).toLocaleString()}</span>
                <span className="text-xs text-slate-500 block font-mono font-medium">INR</span>
              </div>
            </div>

            {/* Problem & Economics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider block">Customer Problem / Failure</span>
                <p className="text-amber-800 font-bold text-sm">{selectedCase.current_plan?.diagnosis || selectedCase.failure_reason?.error_reason}</p>
                <div className="text-slate-500 font-mono text-[11px] pt-1">
                  Code: {selectedCase.failure_reason?.error_code} • Step: {selectedCase.failure_reason?.error_step}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider block">Expected Economics</span>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Recoverability Probability:</span>
                  <strong className="text-emerald-700 font-bold">{Math.round((selectedCase.current_plan?.recoverability?.probability || 0.85) * 100)}%</strong>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Expected Net Recovery:</span>
                  <strong className="text-slate-900 font-extrabold">₹{((selectedCase.current_plan?.expectedEconomics?.expectedNetValuePaise || selectedCase.amount_paise) / 100).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Individual AI Recommendation Action Ladder */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Customer-Specific AI Recovery Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {(selectedCase.current_plan?.actions || []).map((act, idx) => (
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

            {/* Authoritative Policy Decision */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs flex items-start space-x-3 text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-blue-950 block font-bold">Authoritative Policy Decision: {selectedCase.policy_decision?.decision}</strong>
                <p className="mt-0.5 text-blue-900 font-medium">{selectedCase.policy_decision?.reason || 'All standard merchant guardrails passed.'}</p>
                <div className="text-[11px] font-mono text-blue-700 mt-1">
                  Matched Rules: {selectedCase.policy_decision?.matched_rules?.join(', ')}
                </div>
              </div>
            </div>

            {/* Execute Buttons */}
            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => onOpenWhatsApp(selectedCase)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-2 transition-colors shadow-2xs"
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
        ) : null}
      </div>
    </div>
  );
}
