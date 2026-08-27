import React from 'react';
import { ShieldCheck, Activity, Bot, UserCheck, ArrowRight } from 'lucide-react';

export default function AuditStream({ events = [] }) {
  const getActorIcon = (actorType) => {
    switch (actorType) {
      case 'model': return Bot;
      case 'user': return UserCheck;
      case 'provider': return Activity;
      default: return ShieldCheck;
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('OPENED')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (action.includes('EXECUTED') || action.includes('CAPTURED')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (action.includes('EVALUATED') || action.includes('PROPOSED')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (action.includes('KILL')) return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Live Execution Audit Stream</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Real-time SSE</span>
        </span>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[460px] pr-1">
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No audit events recorded yet.</p>
        ) : (
          events.map((evt) => {
            const Icon = getActorIcon(evt.actor_type);
            return (
              <div 
                key={evt.id} 
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all duration-150 flex items-start space-x-3 text-xs"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 mt-0.5 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold tracking-wide ${getActionBadge(evt.action)}`}>
                      {evt.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.occurred_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-700 font-semibold leading-relaxed">
                    {evt.details}
                  </p>
                  {evt.correlation_id && (
                    <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                      <span>Ref:</span>
                      <span className="text-blue-600 font-bold">{evt.correlation_id}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
