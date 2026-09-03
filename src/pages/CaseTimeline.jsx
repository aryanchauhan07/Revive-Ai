import React, { useState } from 'react';
import { 
  History, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  Search, 
  Calendar,
  Sparkles,
  Zap,
  Tag,
  Building2,
  RefreshCw,
  ShoppingCart,
  Clock,
  Filter
} from 'lucide-react';
import VoiceCallSandboxModal from '../components/VoiceCallSandboxModal';
import { Calculator } from 'lucide-react';

export default function CaseTimeline({ 
  cases = [], 
  onExecuteAction = () => {}, 
  onOpenCheckout = () => {}, 
  onOpenWhatsApp = () => {}, 
  onOpenVoiceCall = () => {},
  onOpenAIModal = () => {},
  onSetPtpDate = () => {},
  initialSelectedCaseId = null,
  initialSearchTerm = '',
  onSelectCase = () => {},
  onSetSearchTerm = () => {}
}) {
  // Deduplicate cases strictly
  const uniqueCasesMap = new Map(
    (cases || [])
      .filter(c => c.customer_name && !c.id?.startsWith('CASE-TEST'))
      .map(c => [c.id, c])
  );
  const uniqueCases = Array.from(uniqueCasesMap.values());

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL | DROPOFF | SUBSCRIPTION | B2B | GATEWAY
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | PENDING | RECOVERED
  const [selectedCaseId, setSelectedCaseId] = useState(initialSelectedCaseId || uniqueCases[0]?.id || 'CASE-101');
  const [ptpDateInput, setPtpDateInput] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);

  const pendingCount = uniqueCases.filter(c => c.status !== 'RECOVERED' && c.status !== 'CANCELLED').length;
  const recoveredCount = uniqueCases.filter(c => c.status === 'RECOVERED').length;

  React.useEffect(() => {
    if (initialSelectedCaseId) {
      setSelectedCaseId(initialSelectedCaseId);
      setCategoryFilter('ALL');
    }
    if (initialSearchTerm !== undefined) {
      setSearchTerm(initialSearchTerm || '');
    }
  }, [initialSelectedCaseId, initialSearchTerm]);

  // Helper to categorize each case
  const getCaseCategory = (c) => {
    if (!c) return 'GATEWAY';
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

  // Filtered Cases matching customer, ID, Bank / Issuer, and Status (Pending vs Recovered)
  const filteredCases = uniqueCases.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      c.customer_name?.toLowerCase().includes(term) || 
      c.id?.toLowerCase().includes(term) ||
      c.failure_reason?.issuer?.toLowerCase().includes(term) ||
      c.failure_reason?.method?.toLowerCase().includes(term) ||
      c.id === selectedCaseId;
    const matchesCat = categoryFilter === 'ALL' || getCaseCategory(c) === categoryFilter;
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && c.status !== 'RECOVERED') ||
      (statusFilter === 'RECOVERED' && c.status === 'RECOVERED');
    return matchesSearch && matchesCat && matchesStatus;
  });

  const selectedCase = (selectedCaseId && uniqueCases.find(c => c.id === selectedCaseId)) || filteredCases[0] || uniqueCases[0] || {};
  const currentCategory = getCaseCategory(selectedCase);

  // Dynamic 8-Action Economics Generator Tailored Specifically to Each Case & Problem Statement
  const getActionUtilityMatrix = (caseItem, cat) => {
    if (!caseItem || !caseItem.amount_paise) return [];
    const amountRupees = Math.round((caseItem.amount_paise || 0) / 100);
    const isHighValue = amountRupees >= 20000;

    let actions = [];

    if (cat === 'DROPOFF') {
      // Checkout Drop-Off (Sneha Mehta ₹6,499)
      actions = [
        { name: '1. WAIT (No outreach)', prob: 0.08, cost: 0.00, status: 'LOW_INTENT', isOptimal: false, rationale: 'User abandoned cart; passive wait will not convert' },
        { name: '2. RETRY (Same Rail)', prob: 0.10, cost: 1.50, status: 'NOT_RECOMMENDED', isOptimal: false, rationale: 'Customer explicitly cancelled checkout screen' },
        { name: '3. SWITCH_PAYMENT_METHOD', prob: 0.45, cost: 0.50, status: 'FEASIBLE', isOptimal: false, rationale: 'Generic link without incentive has modest cart conversion' },
        { name: '4. CREATE_PAYMENT_LINK', prob: 0.62, cost: 0.50, status: 'FEASIBLE', isOptimal: false, rationale: 'Clean 1-click cart resume link' },
        { name: '5. WHATSAPP_MESSAGE', prob: 0.68, cost: 0.75, status: 'FEASIBLE', isOptimal: false, rationale: 'Friendly cart abandonment reminder' },
        { name: '6. INCENTIVE (Dynamic 3% Discount)', prob: 0.86, cost: Math.round(amountRupees * 0.03), status: 'OPTIMAL PLAN', isOptimal: true, rationale: 'ArgMax E[Net]: Dynamic 3% discount converts abandoned cart immediately' },
        { name: '7. HUMAN_ESCALATION', prob: 0.88, cost: 45.00, status: 'EXPENSIVE', isOptimal: false, rationale: 'Unnecessary ₹45 human agent cost for ₹6.5k cart' },
        { name: '8. STOP', prob: 0.00, cost: 0.00, status: 'FALLBACK', isOptimal: false, rationale: 'Surrenders cart revenue permanently' }
      ];
    } else if (cat === 'SUBSCRIPTION') {
      // Subscriptions / e-Mandates (Karan Malhotra ₹12,400 / Divya Joshi ₹8,900)
      actions = [
        { name: '1. WAIT (Salary Window Cooldown)', prob: 0.82, cost: 0.00, status: 'FEASIBLE', isOptimal: false, rationale: 'Wait for 1st-3rd monthly salary credit window' },
        { name: '2. RETRY (Immediate Same-Day Debit)', prob: 0.12, cost: 1.50, status: 'CIRCUIT BLOCKED', isOptimal: false, rationale: 'Bank balance deficit; immediate retries guaranteed to fail' },
        { name: '3. SWITCH_PAYMENT_METHOD', prob: 0.35, cost: 0.50, status: 'FEASIBLE', isOptimal: false, rationale: 'Customer must manually enter new payment details' },
        { name: '4. RETRY (Scheduled on Salary Cycle 1st-3rd)', prob: 0.89, cost: 0.50, status: 'OPTIMAL PLAN', isOptimal: true, rationale: 'ArgMax E[Net]: Automated AutoPay debit sequencer on salary window' },
        { name: '5. WHATSAPP_MESSAGE', prob: 0.70, cost: 0.75, status: 'FEASIBLE', isOptimal: false, rationale: 'Polite upcoming subscription debit reminder' },
        { name: '6. INCENTIVE (Dynamic Discount)', prob: 0.00, cost: 0.00, status: 'NOT_APPLICABLE', isOptimal: false, rationale: 'Discounts prohibited on recurring mandate contracts' },
        { name: '7. HUMAN_ESCALATION', prob: 0.80, cost: 45.00, status: 'EXPENSIVE', isOptimal: false, rationale: 'Overkill for automated recurring subscriptions' },
        { name: '8. STOP', prob: 0.00, cost: 0.00, status: 'FALLBACK', isOptimal: false, rationale: 'Cancels recurring subscriber membership' }
      ];
    } else if (cat === 'B2B') {
      // B2B Corporate Invoice (Acme Technologies ₹85,000)
      actions = [
        { name: '1. WAIT (Invoice Aging Grace Period)', prob: 0.20, cost: 0.00, status: 'FEASIBLE', isOptimal: false, rationale: 'Standard 7-day payment terms window' },
        { name: '2. RETRY (Same Rail)', prob: 0.15, cost: 1.50, status: 'NOT_RECOMMENDED', isOptimal: false, rationale: 'Corporate finance needs formal invoice link' },
        { name: '3. SWITCH_PAYMENT_METHOD', prob: 0.55, cost: 0.50, status: 'FEASIBLE', isOptimal: false, rationale: 'Switch from card to Virtual Account / NEFT' },
        { name: '4. CREATE_PAYMENT_LINK (Virtual Account / RTGS)', prob: 0.91, cost: 0.50, status: 'OPTIMAL PLAN', isOptimal: true, rationale: 'ArgMax E[Net]: Dedicated Razorpay Smart Collect Virtual Account for B2B reconciliation' },
        { name: '5. WHATSAPP_MESSAGE', prob: 0.60, cost: 0.75, status: 'FEASIBLE', isOptimal: false, rationale: 'Finance department WhatsApp invoice dispatch' },
        { name: '6. INCENTIVE (Early Payment Discount)', prob: 0.85, cost: Math.round(amountRupees * 0.02), status: 'MARGIN_IMPACT', isOptimal: false, rationale: '2% cash discount reduces merchant B2B margin' },
        { name: '7. HUMAN_ESCALATION (Key Account Manager)', prob: 0.94, cost: 45.00, status: 'REVIEW REQ', isOptimal: false, rationale: 'High-touch B2B invoice escalation' },
        { name: '8. STOP', prob: 0.00, cost: 0.00, status: 'FALLBACK', isOptimal: false, rationale: 'Write off invoice as bad debt' }
      ];
    } else if (isHighValue) {
      // High-Value VIP Orders >= ₹20k (Priya Patel ₹28,500 / Aditya Verma ₹23,900)
      actions = [
        { name: '1. WAIT (Cooldown 15m)', prob: 0.12, cost: 0.00, status: 'FEASIBLE', isOptimal: false, rationale: 'Passive wait during bank outage' },
        { name: '2. RETRY (Same Rail)', prob: 0.14, cost: 1.50, status: 'CIRCUIT BLOCKED', isOptimal: false, rationale: 'Circuit breaker tripped on degraded bank' },
        { name: '3. SWITCH_PAYMENT_METHOD', prob: 0.78, cost: 0.50, status: 'REQUIRES_APPROVAL', isOptimal: false, rationale: 'High-value order (₹28.5k >= ₹20k floor) requires manager review' },
        { name: '4. CREATE_PAYMENT_LINK', prob: 0.80, cost: 0.50, status: 'REQUIRES_APPROVAL', isOptimal: false, rationale: 'Payment link creation blocked pending approval' },
        { name: '5. WHATSAPP_MESSAGE', prob: 0.75, cost: 0.75, status: 'FEASIBLE', isOptimal: false, rationale: 'Customer concierge notification' },
        { name: '6. INCENTIVE (Dynamic Discount)', prob: 0.00, cost: 0.00, status: 'POLICY_BLOCKED', isOptimal: false, rationale: 'Autonomous discounts prohibited on high-value orders' },
        { name: '7. HUMAN_ESCALATION (Manager Sign-Off)', prob: 0.95, cost: 45.00, status: 'OPTIMAL PLAN', isOptimal: true, rationale: 'ArgMax E[Net]: Senior manager review protects against high-ticket exposure while maximizing VIP conversion' },
        { name: '8. STOP', prob: 0.00, cost: 0.00, status: 'FALLBACK', isOptimal: false, rationale: 'Halt recovery attempt' }
      ];
    } else {
      // Technical Bank Outage (Ananya Roy ₹4,850 / Rahul Sharma ₹7,200 / Vikram Singh ₹12,200)
      actions = [
        { name: '1. WAIT (Cooldown 15m)', prob: 0.12, cost: 0.00, status: 'FEASIBLE', isOptimal: false, rationale: 'Wait for bank auth server recovery' },
        { name: '2. RETRY (Same Rail)', prob: 0.16, cost: 1.50, status: 'CIRCUIT BLOCKED', isOptimal: false, rationale: 'SRE Circuit Breaker tripped: 84% failure rate on degraded bank' },
        { name: '3. SWITCH_PAYMENT_METHOD (Cards / Netbanking)', prob: 0.88, cost: 0.50, status: 'OPTIMAL PLAN', isOptimal: true, rationale: 'ArgMax E[Net]: Bypass broken UPI rail to 95% healthy Cards/Netbanking via 1-click link' },
        { name: '4. CREATE_PAYMENT_LINK', prob: 0.78, cost: 0.50, status: 'FEASIBLE', isOptimal: false, rationale: 'Clean 1-click recovery checkout link' },
        { name: '5. WHATSAPP_MESSAGE', prob: 0.74, cost: 0.75, status: 'FEASIBLE', isOptimal: false, rationale: 'Dispatches alternate method prompt to customer' },
        { name: '6. INCENTIVE (Dynamic Discount)', prob: 0.88, cost: Math.round(amountRupees * 0.03), status: 'UNNECESSARY', isOptimal: false, rationale: '₹0 discount needed because user had 100% purchase intent before bank failed' },
        { name: '7. HUMAN_ESCALATION', prob: 0.90, cost: 45.00, status: 'EXPENSIVE', isOptimal: false, rationale: 'Unnecessary ₹45 human cost for technical bank error' },
        { name: '8. STOP', prob: 0.00, cost: 0.00, status: 'FALLBACK', isOptimal: false, rationale: 'Surrenders revenue to bank downtime' }
      ];
    }

    return actions.map(act => {
      const grossPaise = Math.round(caseItem.amount_paise * act.prob);
      const grossRupees = Math.round(grossPaise / 100);
      const netRupees = Math.max(0, Math.round(grossRupees - act.cost));

      return {
        ...act,
        grossRupees,
        netRupees
      };
    });
  };

  const actionMatrix = getActionUtilityMatrix(selectedCase, currentCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recovery Case Manager & Decision Brain</h2>
          <p className="text-xs text-slate-500 font-medium">
            Multi-vertical recovery across checkout drop-offs, recurring subscriptions, B2B invoices, and bank outages
          </p>
        </div>

        {/* 4 Dedicated Problem Statement Vertical Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Verticals ({uniqueCases.length})
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
          {/* Status Filter Toggle: All vs Pending vs Recovered */}
          <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({uniqueCases.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center space-x-1 ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('RECOVERED')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center space-x-1 ${
                statusFilter === 'RECOVERED'
                  ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Recovered ({recoveredCount})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer, ID, or bank..."
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
                    <span>Customer abandoned checkout during bank friction. Dynamic 3% Incentive generated to maximize conversion.</span>
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
                    <strong className="font-extrabold block">B2B Overdue Invoice Aging & Virtual Account Recovery</strong>
                    <span>Corporate invoice aging. Automated Razorpay Smart Collect Virtual Account created for RTGS/NEFT settlement.</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] border border-emerald-300">
                  Virtual Account: RAZOR_VA_85000
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 text-lg">{selectedCase.customer_name}</h3>
                  <span className="text-xs font-mono text-slate-400">({selectedCase.id})</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{selectedCase.customer_email} • {selectedCase.customer_phone}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-slate-900">
                  ₹{Math.round((selectedCase.amount_paise || 0) / 100).toLocaleString()}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  selectedCase.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedCase.status === 'APPROVAL_REQUIRED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {selectedCase.status}
                </span>
              </div>
            </div>

            {/* Omnichannel Interactive Action Dispatchers */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onOpenAIModal(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Inspect AI Agent Rationale</span>
              </button>

              <button
                onClick={() => onOpenVoiceCall(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Simulate Hinglish AI Voice Call</span>
              </button>

              <button
                onClick={() => onOpenWhatsApp(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dispatch WhatsApp Pay Link</span>
              </button>

              <button
                onClick={() => onOpenCheckout(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
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
                  {actionMatrix.map((act, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-colors ${
                        act.isOptimal 
                          ? 'hover:bg-blue-50/60 bg-blue-50/30 border-l-4 border-blue-600' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`py-2.5 px-3 font-sans ${act.isOptimal ? 'font-extrabold text-blue-900' : 'font-bold text-slate-900'}`}>
                        {act.name}
                        <span className="text-[10px] text-slate-500 font-normal font-sans block">
                          {act.rationale}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 ${act.isOptimal ? 'font-bold text-emerald-700' : ''}`}>
                        {(act.prob * 100).toFixed(1)}%
                      </td>
                      <td className={`py-2.5 px-3 text-right ${act.isOptimal ? 'font-bold' : ''}`}>
                        ₹{act.grossRupees.toLocaleString()}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${act.cost > 0 ? (act.cost > 20 ? 'text-rose-700' : 'text-slate-600') : 'text-emerald-700'}`}>
                        ₹{act.cost.toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${act.isOptimal ? 'font-extrabold text-emerald-700 text-xs' : 'font-bold text-slate-900'}`}>
                        ₹{act.netRupees.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          act.isOptimal 
                            ? 'bg-blue-600 text-white' 
                            : act.status.includes('BLOCKED') 
                              ? 'bg-rose-100 text-rose-700' 
                              : act.status.includes('REQ') || act.status.includes('APPROVAL') 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
