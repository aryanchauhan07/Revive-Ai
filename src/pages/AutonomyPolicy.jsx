import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Save, 
  Moon, 
  DollarSign, 
  Clock, 
  Lock, 
  Check, 
  Sparkles,
  X,
  Bell
} from 'lucide-react';

export default function AutonomyPolicy({ merchant, onSavePolicy, onToggleKillSwitch }) {
  const policy = merchant?.policy || {};
  
  const [mode, setMode] = useState(merchant?.mode || 'ASSIST');
  const [quietHoursStart, setQuietHoursStart] = useState(policy.contact?.quietHours?.start || '22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(policy.contact?.quietHours?.end || '08:00');
  const [maxDiscountPct, setMaxDiscountPct] = useState(policy.money?.maxDiscountPct || 5);
  const [maxAutoDiscountPct, setMaxAutoDiscountPct] = useState(policy.money?.maxAutoDiscountPct || 2);
  const [highValueThreshold, setHighValueThreshold] = useState((policy.money?.highValueApprovalPaise || 2000000) / 100);
  const [maxAttempts, setMaxAttempts] = useState(policy.retry?.maxAttempts || 3);
  
  // Sync state when merchant prop updates
  useEffect(() => {
    if (merchant?.mode) setMode(merchant.mode);
    if (merchant?.policy?.money?.highValueApprovalPaise) {
      setHighValueThreshold(merchant.policy.money.highValueApprovalPaise / 100);
    }
    if (merchant?.policy?.money?.maxDiscountPct) {
      setMaxDiscountPct(merchant.policy.money.maxDiscountPct);
    }
    if (merchant?.policy?.money?.maxAutoDiscountPct) {
      setMaxAutoDiscountPct(merchant.policy.money.maxAutoDiscountPct);
    }
  }, [merchant]);

  // Notification Toast State
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleModeSwitch = async (newMode) => {
    setMode(newMode);
    const updatedPolicy = {
      mode: newMode,
      contact: { ...policy.contact, quietHours: { start: quietHoursStart, end: quietHoursEnd } },
      money: {
        ...policy.money,
        maxDiscountPct: Number(maxDiscountPct),
        maxAutoDiscountPct: Number(maxAutoDiscountPct),
        highValueApprovalPaise: Number(highValueThreshold) * 100
      },
      retry: { maxAttempts: Number(maxAttempts) }
    };

    try {
      await onSavePolicy(updatedPolicy);
      setNotification({
        id: Date.now(),
        title: `Switched Autonomy Mode to ${newMode}!`,
        mode: newMode,
        threshold: Number(highValueThreshold),
        discountCap: Number(maxAutoDiscountPct),
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Mode switch error:", err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedPolicy = {
      mode,
      contact: { ...policy.contact, quietHours: { start: quietHoursStart, end: quietHoursEnd } },
      money: {
        ...policy.money,
        maxDiscountPct: Number(maxDiscountPct),
        maxAutoDiscountPct: Number(maxAutoDiscountPct),
        highValueApprovalPaise: Number(highValueThreshold) * 100
      },
      retry: { maxAttempts: Number(maxAttempts) }
    };

    try {
      await onSavePolicy(updatedPolicy);
      setNotification({
        id: Date.now(),
        title: 'Policy Configuration Saved & Synchronized!',
        mode: mode,
        threshold: Number(highValueThreshold),
        discountCap: Number(maxAutoDiscountPct),
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Save policy error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Success Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white border-2 border-emerald-500 rounded-xl p-3 shadow-xl animate-slide-in-right space-y-1.5 shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs leading-tight">
                  Policy Saved & Synchronized!
                </h4>
                <p className="text-[10px] text-slate-500 font-medium font-mono">
                  Floor: ₹{notification.threshold.toLocaleString()} • Mode: {notification.mode}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10.5px] text-slate-600 font-medium leading-normal pl-9">
            ⚡ All customer recovery queues and the Human Approval Center have been dynamically re-evaluated in real time.
          </p>
        </div>
      )}

      {/* Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Autonomy & Policy Control Engine</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Configure merchant autonomy level, compliance guardrails, quiet hours, and budget floors</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Policy Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Mode Selector Cards */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-card space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Merchant Agent Autonomy Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => handleModeSwitch('OBSERVE')}
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
            onClick={() => handleModeSwitch('ASSIST')}
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
              Human-in-the-Loop. Executes low-risk actions autonomously, but queues high-value orders and dynamic discounts for manager sign-off.
            </p>
          </div>

          <div
            onClick={() => handleModeSwitch('AUTOPILOT')}
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
              Fully autonomous execution within hard policy ceilings. Auto-dispatches links, WhatsApp, and switches payment methods instantly.
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
                <label className="text-slate-600 font-bold block mb-1.5">Max Absolute Discount (%)</label>
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

      {/* Emergency Kill Switch */}
      <div className="glass-panel rounded-2xl p-6 border border-rose-200 bg-rose-50/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Emergency System Kill Switch</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Instantly halts all autonomous messaging, payment retries, and discount dispatches across all rails.</p>
          </div>
        </div>
        <button
          onClick={() => onToggleKillSwitch(!merchant?.killSwitch)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
            merchant?.killSwitch
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-white hover:bg-slate-100 text-rose-700 border border-rose-300'
          }`}
        >
          {merchant?.killSwitch ? 'Emergency Kill Switch ACTIVE (Click to Disengage)' : 'Engage Emergency Kill Switch'}
        </button>
      </div>
    </div>
  );
}
