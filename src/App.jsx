import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CommandCenter from './pages/CommandCenter';
import PaymentHealth from './pages/PaymentHealth';
import IncidentInspector from './pages/IncidentInspector';
import CaseTimeline from './pages/CaseTimeline';
import ApprovalCenter from './pages/ApprovalCenter';
import AutonomyPolicy from './pages/AutonomyPolicy';
import SystemHealth from './pages/SystemHealth';
import BatchEvaluator from './pages/BatchEvaluator';

import RazorpayCheckoutModal from './components/RazorpayCheckoutModal';
import WhatsAppSandboxModal from './components/WhatsAppSandboxModal';
import VoiceCallSandboxModal from './components/VoiceCallSandboxModal';

import { 
  fetchMerchant, 
  fetchCases, 
  fetchIncidents, 
  fetchAuditEvents, 
  toggleKillSwitch, 
  updateMerchantPolicy, 
  triggerDemoIncident, 
  triggerDemoPaymentFailure, 
  executeCase 
} from './services/api';

import { Compass, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [merchant, setMerchant] = useState(null);
  const [cases, setCases] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);

  // Modals & Drawers
  const [selectedCheckoutCase, setSelectedCheckoutCase] = useState(null);
  const [selectedWhatsAppCase, setSelectedWhatsAppCase] = useState(null);
  const [selectedVoiceCase, setSelectedVoiceCase] = useState(null);

  // 1-Click Guided Demo Story State
  const [demoStoryStep, setDemoStoryStep] = useState(0); // 0 = Off, 1 = Incident, 2 = AI Diagnosis, 3 = Policy Check, 4 = Recovery

  const loadData = async () => {
    try {
      const [m, c, i, a] = await Promise.all([
        fetchMerchant(),
        fetchCases(),
        fetchIncidents(),
        fetchAuditEvents()
      ]);
      setMerchant(m);
      setCases(c);
      setIncidents(i);
      setAuditEvents(a);
    } catch (err) {
      console.error("Error loading application data:", err);
    }
  };

  useEffect(() => {
    loadData();

    // SSE Listener for real-time live feed
    const eventSource = new EventSource('/api/events/stream');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Received:", data);
        loadData();
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleToggleKillSwitch = async (enabled) => {
    const updated = await toggleKillSwitch(enabled);
    setMerchant(updated);
    loadData();
  };

  const handleSavePolicy = async (policyData) => {
    const updated = await updateMerchantPolicy(policyData);
    setMerchant(updated);
    loadData();
  };

  const handleTriggerDemo = async (bank = 'HDFC Bank', method = 'upi') => {
    await triggerDemoIncident(bank, method);
    loadData();
  };

  const handleStartDemoStory = async () => {
    setDemoStoryStep(1);
    setActiveTab('health');
    await handleTriggerDemo('HDFC Bank', 'upi');
  };

  const handleNextStoryStep = () => {
    if (demoStoryStep === 1) {
      setDemoStoryStep(2);
      setActiveTab('incidents');
    } else if (demoStoryStep === 2) {
      setDemoStoryStep(3);
      setActiveTab('approvals');
    } else if (demoStoryStep === 3) {
      setDemoStoryStep(4);
      setActiveTab('command');
    } else {
      setDemoStoryStep(0);
    }
  };

  const handleApproveAction = async (caseId, action) => {
    await executeCase(caseId, action, 'human_manager');
    loadData();
  };

  const handleCompletePayment = async (caseId, method) => {
    await executeCase(caseId, { action: 'PAYMENT_CAPTURED', params: { method } }, 'customer');
    setSelectedCheckoutCase(null);
    loadData();
  };

  const handleSetPtpDate = (caseId, ptpDate) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'PTP_PAUSED', ptp_date: ptpDate } : c));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        merchant={merchant}
        onToggleKillSwitch={handleToggleKillSwitch}
        onTriggerDemo={handleTriggerDemo}
        demoStoryStep={demoStoryStep}
        onStartDemoStory={handleStartDemoStory}
      />

      {/* 1-Click Guided Demo Story Banner for Judges */}
      {demoStoryStep > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white px-4 py-3 shadow-md animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Compass className="w-5 h-5 text-emerald-200 animate-spin" />
              <div>
                <span className="font-extrabold text-xs tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  Guided Demo Story • Step {demoStoryStep} of 4
                </span>
                <span className="text-xs font-bold ml-2">
                  {demoStoryStep === 1 && "Step 1: HDFC UPI Anomaly Detected (Rolling Z-score drop to 41%)"}
                  {demoStoryStep === 2 && "Step 2: AI Root Cause Diagnosis & 5 Individualized Customer Plans"}
                  {demoStoryStep === 3 && "Step 3: Policy Check — Priya Patel (₹28,500) Flagged for Manager Approval"}
                  {demoStoryStep === 4 && "Step 4: Automated Omnichannel Recovery & Live Revenue Captured!"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleNextStoryStep}
                className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-extrabold hover:bg-emerald-50 transition-all flex items-center space-x-1 shadow-sm"
              >
                <span>{demoStoryStep === 4 ? 'Finish Story' : 'Next Story Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDemoStoryStep(0)} className="p-1 rounded-lg text-emerald-100 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'command' && (
          <CommandCenter
            merchant={merchant}
            cases={cases}
            incidents={incidents}
            auditEvents={auditEvents}
            onOpenCheckout={setSelectedCheckoutCase}
            onOpenWhatsApp={setSelectedWhatsAppCase}
            onTriggerDemo={handleTriggerDemo}
          />
        )}

        {activeTab === 'health' && (
          <PaymentHealth
            incidents={incidents}
            cases={cases}
            setActiveTab={setActiveTab}
            onTriggerDemo={handleTriggerDemo}
            onOpenCheckout={setSelectedCheckoutCase}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentInspector
            incidents={incidents}
            cases={cases}
            onOpenCheckout={setSelectedCheckoutCase}
          />
        )}

        {activeTab === 'cases' && (
          <CaseTimeline
            cases={cases}
            onOpenCheckout={setSelectedCheckoutCase}
            onOpenWhatsApp={setSelectedWhatsAppCase}
            onOpenVoiceCall={setSelectedVoiceCase}
            onExecuteAction={handleApproveAction}
            onSetPtpDate={handleSetPtpDate}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenter
            cases={cases}
            onApproveAction={handleApproveAction}
          />
        )}

        {activeTab === 'policy' && (
          <AutonomyPolicy
            merchant={merchant}
            onSavePolicy={handleSavePolicy}
            onToggleKillSwitch={handleToggleKillSwitch}
          />
        )}

        {activeTab === 'trust' && (
          <SystemHealth auditEvents={auditEvents} />
        )}

        {activeTab === 'batch' && (
          <BatchEvaluator />
        )}
      </main>

      {/* Modals & Drawers */}
      <RazorpayCheckoutModal
        caseItem={selectedCheckoutCase}
        onClose={() => setSelectedCheckoutCase(null)}
        onCompletePayment={handleCompletePayment}
      />

      <WhatsAppSandboxModal
        caseItem={selectedWhatsAppCase}
        onClose={() => setSelectedWhatsAppCase(null)}
        onOpenCheckout={setSelectedCheckoutCase}
      />

      <VoiceCallSandboxModal
        caseItem={selectedVoiceCase}
        onClose={() => setSelectedVoiceCase(null)}
        onOpenCheckout={setSelectedCheckoutCase}
      />
    </div>
  );
}
