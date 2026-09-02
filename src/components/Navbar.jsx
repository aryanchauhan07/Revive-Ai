import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  CheckSquare, 
  Sliders, 
  PlayCircle, 
  Zap, 
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Compass,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  merchant, 
  onToggleKillSwitch, 
  onTriggerDemo,
  demoStoryStep,
  onStartDemoStory,
  onOpenWebhookModal = () => {}
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const isKillSwitchActive = merchant?.killSwitch;
  const currentMode = merchant?.mode || 'ASSIST';

  const modeBadgeColor = {
    OBSERVE: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIST: 'bg-amber-50 text-amber-800 border-amber-200',
    AUTOPILOT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }[currentMode];

  const tabs = [
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'health', label: 'Payment Health', icon: Zap },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'cases', label: 'Recovery Cases', icon: Layers },
    { id: 'approvals', label: 'Approval Queue', icon: CheckSquare },
    { id: 'policy', label: 'Autonomy & Policy', icon: Sliders },
    { id: 'batch', label: '2k Batch Evaluation', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Custom Brand Logo */}
          <div onClick={() => setActiveTab('command')} className="cursor-pointer">
            <BrandLogo size={38} showText={true} />
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Real Signed Webhook Replay Sandbox for Judges */}
            <button
              onClick={onOpenWebhookModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold shadow-2xs transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Signed Webhook Replay</span>
            </button>

            {/* 1-Click Interactive Guided Demo Story Button for Judges */}
            <button
              onClick={onStartDemoStory}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-500 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-200" />
              <span>Guided Demo</span>
            </button>

            {/* Scenario Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Simulate Scenario</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Select Payment Failure Scenario
                  </div>
                  <button
                    onClick={() => {
                      onTriggerDemo('HDFC Bank', 'upi');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between"
                  >
                    <span>HDFC Bank UPI Timeout</span>
                    <span className="text-[10px] text-amber-600 font-mono">₹4,850</span>
                  </button>
                  <button
                    onClick={() => {
                      onTriggerDemo('ICICI Bank', 'card');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between"
                  >
                    <span>Checkout Card Drop-Off</span>
                    <span className="text-[10px] text-blue-600 font-mono">₹28,500</span>
                  </button>
                  <button
                    onClick={() => {
                      onTriggerDemo('SBI Bank', 'mandate');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between"
                  >
                    <span>Overdue Mandate Retry</span>
                    <span className="text-[10px] text-emerald-600 font-mono">₹12,400</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mode Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 ${modeBadgeColor}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span>Mode: {currentMode}</span>
            </div>

            {/* Emergency Kill Switch Button */}
            <button
              onClick={() => onToggleKillSwitch(!isKillSwitchActive)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                isKillSwitchActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 animate-pulse'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isKillSwitchActive ? 'KILL SWITCH ACTIVE' : 'Kill Switch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1.5 overflow-x-auto custom-scrollbar py-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
