import React from 'react';
import { ShieldCheck, Activity, Server, AlertCircle, CheckCircle2, Lock, Cpu, Database, RefreshCw, Zap } from 'lucide-react';

export default function SystemHealth({ auditEvents = [] }) {
  const rejectedSignaturesCount = auditEvents.filter(e => e.action?.includes('REJECTED')).length;
  const duplicateWebhooksCount = auditEvents.filter(e => e.action?.includes('DUPLICATE')).length;
  const executedActionsCount = auditEvents.filter(e => e.action?.includes('EXECUTED')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Reliability & Trust Health</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Webhook security boundaries, idempotency integrity, provider health, and model fallback status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Trust Boundaries Active</span>
          </span>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Raw Webhook Security</span>
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">100% HMAC</div>
          <p className="text-[11px] text-slate-500 font-medium">Raw bytes HMAC verification • {rejectedSignaturesCount} signature rejections</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Webhook Deduplication</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{duplicateWebhooksCount} Ignored</div>
          <p className="text-[11px] text-slate-500 font-medium">Unique x-razorpay-event-id deduplication</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Stable Action Idempotency</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Stable Key</div>
          <p className="text-[11px] text-slate-500 font-medium">case_id:plan_v:action_id idempotency</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Model Fallback Status</span>
            <Cpu className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Rules Active</div>
          <p className="text-[11px] text-slate-500 font-medium">FallbackRecoveryPlanner standby</p>
        </div>
      </div>

      {/* Trust Boundaries Matrix Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">RECOVEROPS Trust & Production Boundary Matrix</h3>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Boundary Requirement</th>
                <th className="py-3 px-3">Enforcement Location</th>
                <th className="py-3 px-3">Behavior on Failure</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Raw Webhook Signature</td>
                <td className="py-3 px-3 font-mono">server/core/webhookIngress.js</td>
                <td className="py-3 px-3 text-rose-700 font-bold">Reject HTTP 401 & Security Audit</td>
                <td className="py-3 px-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">ENFORCED</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Event-ID Deduplication</td>
                <td className="py-3 px-3 font-mono">server/core/webhookIngress.js</td>
                <td className="py-3 px-3 text-slate-600">No-Op (200 DUPLICATE_IGNORED)</td>
                <td className="py-3 px-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">ENFORCED</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Action Execution Authorization</td>
                <td className="py-3 px-3 font-mono">server/core/actionExecutor.js</td>
                <td className="py-3 px-3 text-rose-700 font-bold">Reject arbitrary client payload</td>
                <td className="py-3 px-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">ENFORCED</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Technical Outage ₹0 Discount Rule</td>
                <td className="py-3 px-3 font-mono">server/core/policyEngine.js</td>
                <td className="py-3 px-3 text-amber-700 font-bold">Block discount; protect margin</td>
                <td className="py-3 px-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">ENFORCED</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Customer Self-Recovery Cancellation</td>
                <td className="py-3 px-3 font-mono">server/core/webhookIngress.js</td>
                <td className="py-3 px-3 text-blue-700 font-bold">Cancel queued recovery actions</td>
                <td className="py-3 px-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">ENFORCED</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
