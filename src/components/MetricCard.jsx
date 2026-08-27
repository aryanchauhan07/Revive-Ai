import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1.5 text-xs text-slate-500 font-medium">{subtext}</p>}
    </div>
  );
}
