import React, { useState } from 'react';
import { 
  Layers, 
  ExternalLink, 
  MessageSquare, 
  Search, 
  Phone, 
  Calendar, 
  ShieldCheck,
  Sparkles,
  Calculator,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CaseTimeline({ 
  cases = [], 
  onOpenCheckout = () => {}, 
  onOpenWhatsApp = () => {}, 
  onOpenVoiceCall = () => {}, 
  onExecuteAction = () => {}, 
  onSetPtpDate = () => {} 
}) {
  // Deduplicate cases by ID
  const uniqueCases = Array.from(
    new Map((cases || []).map(c => [c.id, c])).values()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCaseId, setSelectedCaseId] = useState(uniqueCases[0]?.id || 'CASE-101');
  const [ptpDateInput, setPtpDateInput] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);

  // Filtered Cases
  const filteredCases = uniqueCases.filter(c => {
    const matchesSearch = 
      c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCase = uniqueCases.find(c => c.id === selectedCaseId) || filteredCases[0] || uniqueCases[0];

  const handlePtpSubmit = (e) => {
    e.preventDefault();
    if (!ptpDateInput || !selectedCase) return;
    onSetPtpDate(selectedCase.id, ptpDateInput);
    setPtpDateInput('');
  };

  const actionMatrix = selectedCase?.current_plan?.candidate_actions_matrix || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recovery Case Manager</h2>
          <p className="text-xs text-slate-500 font-medium">
            Recovery Decision Brain action economics matrix, policy evaluation, and omnichannel execution
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search case..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-36 sm:w-44 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">PLANNED</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="APPROVAL_REQUIRED">APPROVAL_REQUIRED</option>
            <option value="RECOVERED">RECOVERED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cases List */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider">Cases Queue ({filteredCases.length})</h3>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[580px] custom-scrollbar">
            {filteredCases.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No cases found.</p>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{c.customer_name}</span>
                      <span className="text-xs font-extrabold text-slate-900">₹{(c.amount_paise / 100).toLocaleString()}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">{c.failure_reason?.error_reason}</div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-slate-400 font-mono">{c.id}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
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

        {/* Right: Selected Case Details */}
        {selectedCase && (
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedCase.customer_name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedCase.customer_phone} • {selectedCase.customer_email}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl font-extrabold text-slate-900">₹{(selectedCase.amount_paise / 100).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Order Amount</span>
              </div>
            </div>

            {/* Problem & AI Diagnosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Failure Problem</span>
                <p className="text-amber-800 font-bold">{selectedCase.failure_reason?.error_reason}</p>
                <span className="text-[11px] text-slate-500 block">{selectedCase.failure_reason?.issuer} ({selectedCase.failure_reason?.method?.toUpperCase()})</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Authoritative Policy Gate</span>
                <p className="text-blue-900 font-bold">{selectedCase.policy_decision?.decision || 'ALLOW'}</p>
                <span className="text-[11px] text-slate-500 block">{selectedCase.policy_decision?.reason || 'All standard safety guardrails passed.'}</span>
              </div>
            </div>

            {/* DIFFERENTIATOR 1: RECOVERY DECISION BRAIN MATRIX (Interactive table) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-blue-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <strong className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Recovery Decision Brain: 8-Action Economics Matrix</strong>
                </div>
                <button
                  onClick={() => setShowMatrix(!showMatrix)}
                  className="text-xs text-blue-600 font-bold flex items-center space-x-1"
                >
                  <span>{showMatrix ? 'Hide Matrix' : 'Show Matrix'}</span>
                  {showMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showMatrix && (
                <div className="overflow-x-auto custom-scrollbar pt-1">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase font-bold text-[9px]">
                      <tr>
                        <th className="py-2 px-2.5">Candidate Action</th>
                        <th className="py-2 px-2.5">P(Success)</th>
                        <th className="py-2 px-2.5">Expected Gross</th>
                        <th className="py-2 px-2.5">Intervention Cost</th>
                        <th className="py-2 px-2.5">Expected Net</th>
                        <th className="py-2 px-2.5">Policy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 bg-white">
                      {actionMatrix.map((item, idx) => (
                        <tr key={idx} className={item.isOptimal ? 'bg-emerald-50/70 font-bold text-emerald-950' : 'text-slate-700'}>
                          <td className="py-2 px-2.5 flex items-center space-x-1.5">
                            {item.isOptimal && <Award className="w-3 h-3 text-emerald-600 shrink-0" />}
                            <span>{item.action}</span>
                          </td>
                          <td className="py-2 px-2.5 font-mono">{Math.round(item.probability * 100)}%</td>
                          <td className="py-2 px-2.5 font-mono">₹{Math.round(item.expectedGrossPaise / 100).toLocaleString()}</td>
                          <td className="py-2 px-2.5 font-mono text-slate-500">₹{(item.costPaise / 100).toFixed(2)}</td>
                          <td className="py-2 px-2.5 font-mono font-bold text-emerald-700">₹{Math.round(item.expectedNetPaise / 100).toLocaleString()}</td>
                          <td className="py-2 px-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              item.policyDecision === 'ALLOW' ? 'bg-emerald-100 text-emerald-800' :
                              item.policyDecision === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {item.policyDecision}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-[10px] text-slate-500 pt-2 italic">
                    * Equation: Expected Net Recovery = (P(Success) × Amount) − Intervention Cost − Risk Penalty.
                  </div>
                </div>
              )}
            </div>

            {/* Promise-to-Pay (PTP) Tracker */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center space-x-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Promise-to-Pay (PTP) Tracker</span>
                </span>
                {selectedCase.ptp_date && (
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">
                    PTP: {selectedCase.ptp_date}
                  </span>
                )}
              </div>

              <form onSubmit={handlePtpSubmit} className="flex items-center space-x-2">
                <input
                  type="date"
                  value={ptpDateInput}
                  onChange={e => setPtpDateInput(e.target.value)}
                  className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-2xs"
                >
                  Set PTP Date (Pause Chaser)
                </button>
              </form>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onOpenVoiceCall(selectedCase)}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Voice Call</span>
              </button>

              <button
                onClick={() => onOpenWhatsApp(selectedCase)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Outreach</span>
              </button>

              <button
                onClick={() => onOpenCheckout(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center space-x-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Pay Link</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
