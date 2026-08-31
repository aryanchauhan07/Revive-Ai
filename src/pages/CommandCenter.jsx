import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import AuditStream from '../components/AuditStream';
import { IndianRupee, TrendingUp, AlertTriangle, ShieldCheck, PlayCircle, Search, Phone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CommandCenter({ 
  merchant, 
  cases = [], 
  incidents = [], 
  auditEvents = [], 
  onOpenCheckout, 
  onOpenWhatsApp, 
  onOpenVoiceCall = () => {},
  onTriggerDemo 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deduplicate cases & incidents by ID
  const uniqueCasesMap = new Map((cases || []).map(c => [c.id, c]));
  const uniqueCases = Array.from(uniqueCasesMap.values());
  const openIncidents = Array.from(new Map((incidents || []).filter(i => i.status === 'OPEN').map(i => [i.id, i])).values());
  const pendingApprovals = uniqueCases.filter(c => c.status === 'APPROVAL_REQUIRED');

  // Financial Metrics Calculation (Paise -> Rupees)
  const totalAtRiskPaise = uniqueCases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const recoveredCases = uniqueCases.filter(c => c.status === 'RECOVERED');
  const alreadyRecoveredPaise = recoveredCases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const pendingCases = uniqueCases.filter(c => c.status !== 'RECOVERED');
  const expectedRemainingPaise = pendingCases.reduce((acc, c) => {
    const prob = c.current_plan?.recoverability?.probability || 0.80;
    return acc + Math.round((c.amount_paise || 0) * prob);
  }, 0);

  const recoveryRate = totalAtRiskPaise > 0 
    ? (((alreadyRecoveredPaise + Math.round(expectedRemainingPaise * 0.5)) / totalAtRiskPaise) * 100).toFixed(1) 
    : "74.2";

  // Trend Chart Data
  const trendChartData = [
    { time: '08:00', baseline: 92, actual: 91 },
    { time: '10:00', baseline: 94, actual: 88 },
    { time: '12:00', baseline: 90, actual: 41 }, // Incident drop
    { time: '14:00', baseline: 93, actual: 78 }, // Recovery lift
    { time: '16:00', baseline: 95, actual: 92 },
  ];

  // Filtered Cases
  const filteredCases = uniqueCases.filter(c => {
    const matchesSearch = c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner - Clean, modern, executive */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Autonomous Revenue Recovery Control Plane</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Live Revenue Operations</h2>
        </div>

        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center space-x-2 transition-all shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Simulate HDFC UPI Anomaly</span>
        </button>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue at Risk"
          value={`₹${Math.round(totalAtRiskPaise / 100).toLocaleString()}`}
          subtext={`${uniqueCases.length} active failure cases`}
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="Revenue Recovered"
          value={`₹${Math.round(alreadyRecoveredPaise / 100).toLocaleString()}`}
          subtext={`+₹${Math.round(expectedRemainingPaise / 100).toLocaleString()} expected remaining`}
          icon={IndianRupee}
          trend="+18.4%"
          color="emerald"
        />
        <MetricCard
          title="Recovery Success Rate"
          value={`${recoveryRate}%`}
          subtext="Net incremental lift"
          icon={TrendingUp}
          color="cyan"
        />
        <MetricCard
          title="Active Incidents"
          value={openIncidents.length}
          subtext={`${pendingApprovals.length} pending review`}
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* Main Split: Trend Chart & Cases Table on Left, Live Audit Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Success Rate Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Hourly Success Rate & Anomaly Dip</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time baseline vs actual recovery curve</p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold">
                <span className="flex items-center space-x-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span>Baseline (92%)</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>Actual Success</span>
                </span>
              </div>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Cases Table */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Active Recovery Cohort ({filteredCases.length})</h3>
                <p className="text-xs text-slate-500 font-medium">Individualized customer interventions</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-32 sm:w-40 font-medium"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="PLANNED">PLANNED</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="APPROVAL_REQUIRED">APPROVAL_REQUIRED</option>
                  <option value="RECOVERED">RECOVERED</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Failure Reason</th>
                    <th className="py-2.5 px-3">Action Plan</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">No matching cases found.</td>
                    </tr>
                  ) : (
                    filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">{c.failure_reason?.error_reason}</span>
                          <span className="text-[10px] text-slate-400 block">{c.failure_reason?.issuer}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-blue-700">
                          {c.current_plan?.actions?.map(a => a.action).join(' → ') || 'WAIT → SWITCH_METHOD'}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                          ₹{(c.amount_paise / 100).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            c.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            c.status === 'APPROVAL_REQUIRED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => onOpenVoiceCall(c)}
                            title="Simulate Hinglish AI Voice Call"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors shadow-2xs inline-flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Voice</span>
                          </button>
                          <button
                            onClick={() => onOpenWhatsApp(c)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => onOpenCheckout(c)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors shadow-2xs"
                          >
                            Pay Link
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Audit Stream */}
        <div className="lg:col-span-1">
          <AuditStream events={auditEvents} />
        </div>
      </div>
    </div>
  );
}
