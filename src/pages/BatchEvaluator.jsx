import React, { useState } from 'react';
import { FileSpreadsheet, PlayCircle, TrendingUp, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Award } from 'lucide-react';
import { runBatchEvaluation } from '../services/api';

export default function BatchEvaluator() {
  const [isRunning, setIsRunning] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    try {
      const res = await runBatchEvaluation(2000);
      setLatestResult(res);
    } catch (err) {
      console.error("Batch run failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">2,000-Event Benchmark Batch Evaluator</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Ground-truth synthetic benchmark comparing Baseline Control Groups vs. RECOVEROPS Agent</p>
        </div>
        <button
          onClick={handleRunEvaluation}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{isRunning ? 'Running 2,000 Event Batch...' : 'Run 2,000 Event Evaluation Batch'}</span>
        </button>
      </div>

      {/* Comparison Grid */}
      {latestResult ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Baseline A */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-card space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Baseline A (No Action)</span>
              <div className="text-2xl font-extrabold text-slate-700">
                ₹{(latestResult.baselineA_recovered_paise / 100).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 font-medium">Natural self-recovery only</p>
              <div className="text-[11px] font-mono font-bold text-slate-600 border-t border-slate-100 pt-2">
                Recovery Rate: {((latestResult.baselineA_recovered_paise / latestResult.total_revenue_at_risk_paise) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Baseline B */}
            <div className="glass-panel rounded-2xl p-5 border border-amber-200 bg-amber-50/30 shadow-card space-y-3">
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Baseline B (Generic Retries)</span>
              <div className="text-2xl font-extrabold text-amber-900">
                ₹{(latestResult.baselineB_recovered_paise / 100).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 font-medium">Fixed retries + generic reminders</p>
              <div className="text-[11px] font-mono font-bold text-amber-800 border-t border-amber-200/60 pt-2">
                Recovery Rate: {((latestResult.baselineB_recovered_paise / latestResult.total_revenue_at_risk_paise) * 100).toFixed(1)}%
              </div>
            </div>

            {/* RECOVEROPS Agent */}
            <div className="glass-panel rounded-2xl p-5 border border-emerald-300 bg-emerald-50/50 shadow-card space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">RECOVEROPS Agent</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold flex items-center space-x-1">
                  <Award className="w-3 h-3 text-emerald-700" />
                  <span>WINNER</span>
                </span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-800">
                ₹{(latestResult.recoverOps_gross_recovered_paise / 100).toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 font-medium">Incident-aware + policy-bounded agent</p>
              <div className="text-[11px] font-mono font-bold text-emerald-900 border-t border-emerald-200 pt-2 flex justify-between">
                <span>Recovery Rate: {latestResult.recovery_rate_pct}%</span>
                <span className="text-emerald-700 font-extrabold">Incremental Lift: +{latestResult.incremental_lift_pct}%</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Total Revenue at Risk</span>
              <strong className="text-slate-900 text-lg font-extrabold mt-1 block">₹{(latestResult.total_revenue_at_risk_paise / 100).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Net Incremental Profit</span>
              <strong className="text-emerald-700 text-lg font-extrabold mt-1 block">₹{(latestResult.recoverOps_net_recovered_paise / 100).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Policy Violations</span>
              <strong className="text-emerald-700 text-lg font-extrabold mt-1 block">{latestResult.policy_violations} (0 Target)</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Safe Stops Triggered</span>
              <strong className="text-blue-700 text-lg font-extrabold mt-1 block">{latestResult.safe_stops} cases</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-200 bg-white shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Ready for Batch Benchmark</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Click above to run a seeded 2,000-event synthetic evaluation benchmark against control baselines and measure incremental money recovered.
          </p>
        </div>
      )}
    </div>
  );
}
