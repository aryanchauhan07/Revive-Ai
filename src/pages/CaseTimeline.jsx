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
  ChevronUp,
  ShoppingCart,
  RefreshCw,
  Building2,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function CaseTimeline({ 
  cases = [], 
  onOpenCheckout = () => {}, 
  onOpenWhatsApp = () => {}, 
  onOpenVoiceCall = () => {}, 
  onExecuteAction = () => {}, 
  onSetPtpDate = () => {} 
}) {
  // Deduplicate valid cases by ID
  const uniqueCases = Array.from(
    new Map(
      (cases || [])
        .filter(c => c.customer_name && !c.id?.startsWith('CASE-TEST'))
        .map(c => [c.id, c])
    ).values()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL | DROPOFF | SUBSCRIPTION | B2B | GATEWAY
  const [selectedCaseId, setSelectedCaseId] = useState(uniqueCases[0]?.id || 'CASE-101');
  const [ptpDateInput, setPtpDateInput] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);

  // Helper to categorize each case
  const getCaseCategory = (c) => {
    if (c.id === 'CASE-104' || c.failure_reason?.error_reason?.includes('abandoned') || c.failure_reason?.error_reason?.includes('cancelled')) {
      return 'DROPOFF';
    }
    if (c.id === 'CASE-401' || c.id === 'CASE-402' || c.failure_reason?.method === 'mandate' || c.failure_reason?.method === 'autopay' || c.failure_reason?.error_reason === 'insufficient_funds') {
      return 'SUBSCRIPTION';
    }
    if (c.id === 'CASE-501' || c.failure_reason?.error_source === 'b2b_receivables' || c.failure_reason?.error_code === 'INVOICE_PAST_DUE') {
      return 'B2B';
    }
    return 'GATEWAY';
  };

  // Filtered Cases
  const filteredCases = uniqueCases.filter(c => {
    const matchesSearch = 
      c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || getCaseCategory(c) === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const selectedCase = uniqueCases.find(c => c.id === selectedCaseId) || filteredCases[0] || uniqueCases[0] || {};
  const currentCategory = getCaseCategory(selectedCase);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recovery Case Manager & Decision Brain</h2>
          <p className="text-xs text-slate-500 font-medium">
            Multi-vertical recovery across checkout drop-offs, recurring subscriptions, B2B invoices, and bank outages
          </p>
        </div>

        {/* 4 Problem Statement Vertical Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Cases ({uniqueCases.length})
          </button>

          <button
            onClick={() => setCategoryFilter('DROPOFF')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              categoryFilter === 'DROPOFF'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Checkout Drop-Offs</span>
          </button>

          <button
            onClick={() => setCategoryFilter('SUBSCRIPTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              categoryFilter === 'SUBSCRIPTION'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Failed Subscriptions</span>
          </button>

          <button
            onClick={() => setCategoryFilter('B2B')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              categoryFilter === 'B2B'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B Invoices</span>
          </button>

          <button
            onClick={() => setCategoryFilter('GATEWAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
              categoryFilter === 'GATEWAY'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bank Outages</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Cases */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer, ID, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[580px] custom-scrollbar">
            {filteredCases.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                No cases found matching filter.
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = selectedCase.id === c.id;
                const cat = getCaseCategory(c);
                const amountRupees = Math.round((c.amount_paise || 0) / 100);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-slate-900">{c.customer_name}</span>
                        {cat === 'DROPOFF' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            DROP-OFF
                          </span>
                        )}
                        {cat === 'SUBSCRIPTION' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            AUTOPAY
                          </span>
                        )}
                        {cat === 'B2B' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            B2B INVOICE
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-xs font-mono text-slate-900">₹{amountRupees.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{c.id} • {c.failure_reason?.issuer || 'Gateway'}</span>
                      <span className={`font-bold ${
                        c.status === 'RECOVERED' ? 'text-emerald-600' :
                        c.status === 'APPROVAL_REQUIRED' ? 'text-amber-700' : 'text-blue-600'
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

        {/* Right Column: Case Deep Dive & Decision Brain Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected Case Header Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
            {/* Contextual Specialized Feature Spotlight Banner */}
            {currentCategory === 'DROPOFF' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-950">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <strong className="font-extrabold block">Checkout Drop-Off Recovery Workflow Active</strong>
                    <span>Customer abandoned checkout during bank friction. 3% Dynamic Incentive discount generated to incentivize instant conversion.</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenWhatsApp(selectedCase)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0 transition-all"
                >
                  Preview WhatsApp Cart Recovery
                </button>
              </div>
            )}

            {currentCategory === 'SUBSCRIPTION' && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-950">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <strong className="font-extrabold block">Failed-Subscription & e-Mandate Retry Sequencer Active</strong>
                    <span>SBI AutoPay e-Mandate deficit. System scheduled intelligent retry during monthly salary credit window (1st-3rd of month).</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-purple-100 text-purple-800 font-mono font-bold text-[10px] border border-purple-300">
                  Salary Window: 1st-3rd
                </div>
              </div>
            )}

            {currentCategory === 'B2B' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-extrabold block">B2B Overdue Receivables Chaser Active</strong>
                    <span>Corporate invoice past due by 21 days. Automated AP reconciliation follow-up and Axis Bank Virtual Account link attached.</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenCheckout(selectedCase)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 transition-all"
                >
                  Settle Virtual Account
                </button>
              </div>
            )}

            {/* Case Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                    {selectedCase.id}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedCase.customer_name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Ref: <span className="font-mono">{selectedCase.provider_payment_id}</span> • Phone: {selectedCase.customer_phone} • Email: {selectedCase.customer_email}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl font-extrabold text-slate-900">
                  ₹{Math.round((selectedCase.amount_paise || 0) / 100).toLocaleString()}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedCase.failure_reason?.issuer} ({selectedCase.failure_reason?.method?.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Omnichannel Interactive Sandbox Action Buttons */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              <button
                onClick={() => onOpenVoiceCall(selectedCase)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Simulate Hinglish Voice Call</span>
              </button>

              <button
                onClick={() => onOpenWhatsApp(selectedCase)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Dispatch WhatsApp Link</span>
              </button>

              <button
                onClick={() => onOpenCheckout(selectedCase)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Razorpay 1-Click Pay Link</span>
              </button>
            </div>

            {/* Promise-to-Pay (PTP) Commitment Tracker */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-extrabold text-slate-900 block">Promise-to-Pay (PTP) Tracker</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedCase.ptp_date 
                      ? `Paused until promised date: ${selectedCase.ptp_date}` 
                      : 'Record customer payment commitment date to pause outreach cadence'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={ptpDateInput}
                  onChange={e => setPtpDateInput(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (ptpDateInput) onSetPtpDate(selectedCase.id, ptpDateInput);
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  Save PTP
                </button>
              </div>
            </div>
          </div>

          {/* 8-Action Financial Utility Economics Matrix */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Recovery Decision Brain — 8-Action Utility Matrix</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">ArgMax E[Net Recovery]</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Candidate Action</th>
                    <th className="py-2.5 px-3">Probability</th>
                    <th className="py-2.5 px-3 text-right">Gross Recovery</th>
                    <th className="py-2.5 px-3 text-right">Cost</th>
                    <th className="py-2.5 px-3 text-right">Net Value</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">1. WAIT (Cooldown 15m)</td>
                    <td className="py-2.5 px-3">12.0%</td>
                    <td className="py-2.5 px-3 text-right">₹{Math.round(selectedCase.amount_paise * 0.12 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">₹0.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Math.round(selectedCase.amount_paise * 0.12 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">FEASIBLE</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">2. RETRY (Same Rail)</td>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">16.0%</td>
                    <td className="py-2.5 px-3 text-right">₹{Math.round(selectedCase.amount_paise * 0.16 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-rose-700">₹1.50</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700">₹{Math.round(selectedCase.amount_paise * 0.16 / 100 - 1.5).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">CIRCUIT BLOCKED</span></td>
                  </tr>

                  <tr className="hover:bg-blue-50/60 bg-blue-50/30 transition-colors border-l-4 border-blue-600">
                    <td className="py-2.5 px-3 font-extrabold text-blue-900 font-sans">3. SWITCH_PAYMENT_METHOD</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">82.0%</td>
                    <td className="py-2.5 px-3 text-right font-bold">₹{Math.round(selectedCase.amount_paise * 0.82 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">₹0.50</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">₹{Math.round(selectedCase.amount_paise * 0.82 / 100 - 0.5).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-extrabold">OPTIMAL PLAN</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">4. CREATE_PAYMENT_LINK</td>
                    <td className="py-2.5 px-3">78.0%</td>
                    <td className="py-2.5 px-3 text-right">₹{Math.round(selectedCase.amount_paise * 0.78 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">₹0.50</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Math.round(selectedCase.amount_paise * 0.78 / 100 - 0.5).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">FEASIBLE</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">5. WHATSAPP_MESSAGE</td>
                    <td className="py-2.5 px-3">74.0%</td>
                    <td className="py-2.5 px-3 text-right">₹{Math.round(selectedCase.amount_paise * 0.74 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">₹0.75</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Math.round(selectedCase.amount_paise * 0.74 / 100 - 0.75).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">FEASIBLE</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">6. INCENTIVE (Dynamic Discount)</td>
                    <td className="py-2.5 px-3">88.0%</td>
                    <td className="py-2.5 px-3 text-right">₹{Math.round(selectedCase.amount_paise * 0.88 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-amber-700">₹{Math.round(selectedCase.amount_paise * 0.03 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Math.round(selectedCase.amount_paise * 0.85 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">REVIEW REQ</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">7. HUMAN_ESCALATION</td>
                    <td className="py-2.5 px-3">92.0%</td>
                    <td className="py-2.5 px-3 text-right">₹{Math.round(selectedCase.amount_paise * 0.92 / 100).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-rose-700">₹45.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Math.round(selectedCase.amount_paise * 0.92 / 100 - 45).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">HIGH-VALUE ONLY</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">8. STOP</td>
                    <td className="py-2.5 px-3 text-slate-400">0.0%</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">₹0.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">₹0.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">₹0.00</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-400 font-bold">FALLBACK</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
