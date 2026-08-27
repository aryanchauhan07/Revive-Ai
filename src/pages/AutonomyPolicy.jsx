import React, { useState } from 'react';
import { Sliders, ShieldAlert, CheckCircle2, Save, Moon, DollarSign, Clock, Lock } from 'lucide-react';

export default function AutonomyPolicy({ merchant, onSavePolicy, onToggleKillSwitch }) {
  const policy = merchant?.policy || {};
  
  const [mode, setMode] = useState(merchant?.mode || 'ASSIST');
  const [quietHoursStart, setQuietHoursStart] = useState(policy.contact?.quietHours?.start || '22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(policy.contact?.quietHours?.end || '08:00');
  const [maxDiscountPct, setMaxDiscountPct] = useState(policy.money?.maxDiscountPct || 5);
  const [maxAutoDiscountPct, setMaxAutoDiscountPct] = useState(policy.money?.maxAutoDiscountPct || 2);
  const [highValueThreshold, setHighValueThreshold] = useState((policy.money?.highValueApprovalPaise || 2500000) / 100);
  const [maxAttempts, setMaxAttempts] = useState(policy.retry?.maxAttempts || 3);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSavePolicy({
      mode,
      contact: { ...policy.contact, quietHours: { start: quietHoursStart, end: quietHoursEnd } },
      money: {
        ...policy.money,
        maxDiscountPct: Number(maxDiscountPct),
        maxAutoDiscountPct: Number(maxAutoDiscountPct),
        highValueApprovalPaise: Number(highValueThreshold) * 100
      },
      retry: { maxAttempts: Number(maxAttempts) }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Autonomy & Policy Control Engine</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Configure merchant autonomy level, compliance guardrails, quiet hours, and budget floors</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Saved Policy!' : 'Save Policy Changes'}</span>
        </button>
      </div>

      {/* Mode Selector Cards */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Merchant Agent Autonomy Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setMode('OBSERVE')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              mode === 'OBSERVE'
                ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">OBSERVE</span>
              <input type="radio" checked={mode === 'OBSERVE'} readOnly className="accent-blue-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Read-only mode. AI diagnoses incidents and plans interventions, but executes zero customer contact or side-effects.
            </p>
          </div>

          <div
            onClick={() => setMode('ASSIST')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              mode === 'ASSIST'
                ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">ASSIST (Recommended)</span>
              <input type="radio" checked={mode === 'ASSIST'} readOnly className="accent-amber-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Low-risk actions execute automatically inside policy; high-value cases require manager approval.
            </p>
          </div>

          <div
            onClick={() => setMode('AUTOPILOT')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              mode === 'AUTOPILOT'
                ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">AUTOPILOT</span>
              <input type="radio" checked={mode === 'AUTOPILOT'} readOnly className="accent-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Full autonomous execution inside policy bounds. Only hard policy exceptions flag for approval.
            </p>
          </div>
        </div>
      </div>

      {/* Guardrails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quiet Hours & Contact Caps */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Moon className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">DND Quiet Hours & Contact Caps</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1.5">Quiet Hours DND (No customer messaging)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={e => setQuietHoursStart(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500 font-medium">to</span>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={e => setQuietHoursEnd(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500 font-mono font-bold">IST</span>
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1.5">Max Retry / Outreach Attempts per Case</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={e => setMaxAttempts(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Floors */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Financial Thresholds & Margin Floors</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1.5">High-Value Approval Floor (₹)</label>
              <input
                type="number"
                value={highValueThreshold}
                onChange={e => setHighValueThreshold(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-extrabold font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-bold block mb-1.5">Auto Discount Cap (%)</label>
                <input
                  type="number"
                  value={maxAutoDiscountPct}
                  onChange={e => setMaxAutoDiscountPct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1.5">Hard Max Discount Cap (%)</label>
                <input
                  type="number"
                  value={maxDiscountPct}
                  onChange={e => setMaxDiscountPct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
