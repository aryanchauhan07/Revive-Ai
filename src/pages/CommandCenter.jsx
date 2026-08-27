import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import AuditStream from '../components/AuditStream';
import { IndianRupee, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, PlayCircle, Eye, Search, Filter, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function CommandCenter({ 
  merchant, 
  cases = [], 
  incidents = [], 
  auditEvents = [], 
  onOpenCheckout, 
  onOpenWhatsApp, 
  onTriggerDemo 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const openIncidents = incidents.filter(i => i.status === 'OPEN');
  const pendingApprovals = cases.filter(c => c.status === 'APPROVAL_REQUIRED');

  // Calculate Metrics
  const totalAtRiskPaise = cases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const recoveredCases = cases.filter(c => c.status === 'RECOVERED' || c.status === 'CONTACTED');
  const totalRecoveredPaise = recoveredCases.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const recoveryRate = totalAtRiskPaise > 0 ? ((totalRecoveredPaise / totalAtRiskPaise) * 100).toFixed(1) : "0.0";

  // Recharts Mock Chart Data
  const trendChartData = [
    { time: '08:00', baseline: 92, actual: 91, recovered: 12000 },
    { time: '10:00', baseline: 94, actual: 88, recovered: 28000 },
    { time: '12:00', baseline: 90, actual: 42, recovered: 48500 }, // Incident drop
    { time: '14:00', baseline: 93, actual: 78, recovered: 64100 }, // Recovery lift
    { time: '16:00', baseline: 95, actual: 92, recovered: 82400 },
  ];

  const methodBreakdownData = [
    { method: 'UPI Alternate', amount: 38400, color: '#0284c7' },
    { method: 'Card Fallback', amount: 28500, color: '#2563eb' },
    { method: 'Netbanking', amount: 18200, color: '#10b981' },
    { method: 'e-Mandate Retry', amount: 12400, color: '#f59e0b' },
  ];

  // Filtered Cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur-sm">
              Live System State
            </span>
            <span className="text-xs text-blue-100 font-medium">• Autopilot Safeguards Active</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">Executive Revenue Command Center</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl font-medium">
            Autonomous detection, root-cause isolation, and compliant recovery orchestration across Razorpay rails.
          </p>
        </div>

        <button
          onClick={() => onTriggerDemo('HDFC Bank', 'upi')}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <PlayCircle className="w-4 h-4 text-blue-600" />
          <span>Simulate Recovery Incident</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue at Risk"
          value={`₹${(totalAtRiskPaise / 100).toLocaleString()}`}
          subtext={`${cases.length} active failure cases`}
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="Revenue Recovered"
          value={`₹${(totalRecoveredPaise / 100).toLocaleString()}`}
          subtext="Gross recovered revenue"
          icon={IndianRupee}
          trend="+18.4%"
          color="emerald"
        />
        <MetricCard
          title="Recovery Rate"
          value={`${recoveryRate}%`}
          subtext="Incremental recovery lift"
          icon={TrendingUp}
          color="cyan"
        />
        <MetricCard
          title="Active Incidents"
          value={openIncidents.length}
          subtext={`${pendingApprovals.length} pending human approvals`}
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Rate & Recovery Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Hourly Success Rate & Recovery Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time success baseline vs actual degradation & recovery</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold font-mono">
              <span className="flex items-center space-x-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span>Baseline (92%)</span>
              </span>
              <span className="flex items-center space-x-1 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Actual Success</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
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
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovered Revenue Breakdown Bar Chart */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Recovered Revenue by Rail</h3>
          <p className="text-xs text-slate-500 font-medium">Gross value attribution breakdown</p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodBreakdownData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="method" type="category" stroke="#475569" fontSize={11} tickLine={false} width={100} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Recovered']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {methodBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Interactive Cases Table + Live Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Recovery Cases Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Active Recovery Cases</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time status of recoverable units</p>
            </div>

            {/* Interactive Filters & Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
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
                  <th className="py-3 px-3">Customer / Case</th>
                  <th className="py-3 px-3">Failure Reason</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No matching recovery cases found.</td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{c.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.id}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-amber-700">{c.failure_reason?.error_reason}</div>
                        <div className="text-[11px] text-slate-500">{c.failure_reason?.issuer} • {c.failure_reason?.method?.toUpperCase()}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                        ₹{(c.amount_paise / 100).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          c.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          c.status === 'APPROVAL_REQUIRED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenWhatsApp(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors shadow-xs"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => onOpenCheckout(c)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors shadow-xs"
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

        {/* Right: Live Audit Stream */}
        <div className="lg:col-span-1">
          <AuditStream events={auditEvents} />
        </div>
      </div>
    </div>
  );
}
