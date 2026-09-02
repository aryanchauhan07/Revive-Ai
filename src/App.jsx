import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CommandCenter from './pages/CommandCenter';
import PaymentHealth from './pages/PaymentHealth';
import IncidentInspector from './pages/IncidentInspector';
import CaseTimeline from './pages/CaseTimeline';
import ApprovalCenter from './pages/ApprovalCenter';
import AutonomyPolicy from './pages/AutonomyPolicy';
import BatchEvaluator from './pages/BatchEvaluator';

import RazorpayCheckoutModal from './components/RazorpayCheckoutModal';
import WhatsAppSandboxModal from './components/WhatsAppSandboxModal';
import VoiceCallSandboxModal from './components/VoiceCallSandboxModal';
import WebhookPlaygroundModal from './components/WebhookPlaygroundModal';
import AIAgentThoughtModal from './components/AIAgentThoughtModal';

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

import { Compass, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X, Sparkles, Award } from 'lucide-react';

import { fallbackIncidents, fallbackCases, fallbackAuditEvents } from './services/mockFallback';

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [merchant, setMerchant] = useState({
    id: "merchant_razor_01",
    name: "Revive AI Merchant Store",
    mode: "ASSIST",
    killSwitch: false,
    policy: {
      mode: "ASSIST",
      money: { maxAutoDiscountPct: 2, maxDiscountPct: 5, highValueApprovalPaise: 2000000 },
      contact: { quietHours: { start: "22:00", end: "08:00" }, maxContacts: 3 }
    }
  });
  const [cases, setCases] = useState(fallbackCases);
  const [incidents, setIncidents] = useState(fallbackIncidents);
  const [auditEvents, setAuditEvents] = useState(fallbackAuditEvents);

  // Modals & Drawers
  const [selectedCheckoutCase, setSelectedCheckoutCase] = useState(null);
  const [selectedWhatsAppCase, setSelectedWhatsAppCase] = useState(null);
  const [selectedVoiceCase, setSelectedVoiceCase] = useState(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [selectedAICase, setSelectedAICase] = useState(null);

  // Navigation and Filter States
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseSearchTerm, setCaseSearchTerm] = useState('');

  // 1-Click Guided Demo Story State (5-Stage Architecture Journey)
  const [demoStoryStep, setDemoStoryStep] = useState(0); // 0 = Off, 1 to 5

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchMerchant(),
        fetchCases(),
        fetchIncidents(),
        fetchAuditEvents()
      ]);

      if (results[0].status === 'fulfilled' && results[0].value) {
        setMerchant(results[0].value);
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value) && results[1].value.length > 0) {
        setCases(results[1].value);
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value) && results[2].value.length > 0) {
        setIncidents(results[2].value);
      }
      if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
        setAuditEvents(results[3].value);
      }
    } catch (err) {
      console.error("Error loading application data:", err);
    }
  };

  useEffect(() => {
    loadData();

    // SSE Listener for real-time live feed
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/events/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE Received:", data);
          loadData();
        } catch (e) {
          console.error("SSE parse error:", e);
        }
      };
      eventSource.onerror = (err) => {
        console.warn("SSE stream closed or reconnecting:", err);
      };
    } catch (err) {
      console.warn("SSE not supported or failed:", err);
    }

    return () => {
      if (eventSource) eventSource.close();
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

  const handleQuickThresholdUpdate = async (newRupees) => {
    const policyPayload = {
      money: {
        ...(merchant?.policy?.money || {}),
        highValueApprovalPaise: newRupees * 100
      }
    };
    const updated = await updateMerchantPolicy(policyPayload);
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
      setActiveTab('cases'); // Step 2: Decision Brain 8-Action Economics Matrix
    } else if (demoStoryStep === 2) {
      setDemoStoryStep(3);
      setActiveTab('approvals'); // Step 3: Policy Gate & Human Approval
    } else if (demoStoryStep === 3) {
      setDemoStoryStep(4);
      setActiveTab('command'); // Step 4: Omnichannel Execution & Pay Link
      if (cases.length > 0) {
        setSelectedCheckoutCase(cases[0]);
      }
    } else if (demoStoryStep === 4) {
      setDemoStoryStep(5);
      setActiveTab('batch'); // Step 5: Outcome Feedback Loop & Attribution
    } else {
      setDemoStoryStep(0);
      setActiveTab('command');
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
        onUpdateMode={(newMode) => handleSavePolicy({ ...(merchant?.policy || {}), mode: newMode })}
        onTriggerDemo={handleTriggerDemo}
        demoStoryStep={demoStoryStep}
        onStartDemoStory={handleStartDemoStory}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
      />

      {/* 1-Click Guided Demo Story Banner for Judges */}
      {demoStoryStep > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white px-4 py-3 shadow-md animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Compass className="w-5 h-5 text-emerald-200 animate-spin" />
              <div>
                <span className="font-extrabold text-xs tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  Architecture Demo Journey • Step {demoStoryStep} of 5
                </span>
                <span className="text-xs font-bold ml-2">
                  {demoStoryStep === 1 && "Step 1: Payment SRE Intelligence — HDFC UPI Anomaly Detected & Circuit Breaker Tripped"}
                  {demoStoryStep === 2 && "Step 2: Recovery Decision Brain — 8-Action Economics Matrix Evaluates Expected Net Values"}
                  {demoStoryStep === 3 && "Step 3: Policy & Governance Gateway — High-Value Orders Flagged for Manager Approval"}
                  {demoStoryStep === 4 && "Step 4: Omnichannel Execution — Razorpay Test Mode 1-Click Pay Link Dispatched"}
                  {demoStoryStep === 5 && "Step 5: Outcome Feedback Loop & Attribution — Closed-Loop Learning & Measured ROI"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleNextStoryStep}
                className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-extrabold hover:bg-emerald-50 transition-all flex items-center space-x-1 shadow-sm"
              >
                <span>{demoStoryStep === 5 ? 'Finish Demo Journey' : 'Next Architecture Step'}</span>
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
            onOpenVoiceCall={setSelectedVoiceCase}
            onOpenAIModal={setSelectedAICase}
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
            onNavigateToIncident={(incId) => {
              setSelectedIncidentId(incId);
              setActiveTab('incidents');
            }}
            onNavigateToCase={(targetBankOrCase) => {
              if (targetBankOrCase && targetBankOrCase.startsWith('CASE-')) {
                setSelectedCaseId(targetBankOrCase);
              } else if (targetBankOrCase) {
                setCaseSearchTerm(targetBankOrCase);
              }
              setActiveTab('cases');
            }}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentInspector
            incidents={incidents}
            cases={cases}
            onOpenCheckout={setSelectedCheckoutCase}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            onNavigateToCase={(targetBankOrCase) => {
              if (targetBankOrCase && targetBankOrCase.startsWith('CASE-')) {
                setSelectedCaseId(targetBankOrCase);
              } else if (targetBankOrCase) {
                setCaseSearchTerm(targetBankOrCase);
              }
              setActiveTab('cases');
            }}
          />
        )}

        {activeTab === 'cases' && (
          <CaseTimeline
            cases={cases}
            onOpenCheckout={setSelectedCheckoutCase}
            onOpenWhatsApp={setSelectedWhatsAppCase}
            onOpenVoiceCall={setSelectedVoiceCase}
            onOpenAIModal={setSelectedAICase}
            onExecuteAction={handleApproveAction}
            onSetPtpDate={handleSetPtpDate}
            initialSelectedCaseId={selectedCaseId}
            initialSearchTerm={caseSearchTerm}
            onSelectCase={setSelectedCaseId}
            onSetSearchTerm={setCaseSearchTerm}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenter
            cases={cases}
            merchant={merchant}
            onApproveAction={handleApproveAction}
            onUpdateThreshold={handleQuickThresholdUpdate}
          />
        )}

        {activeTab === 'policy' && (
          <AutonomyPolicy
            merchant={merchant}
            onSavePolicy={handleSavePolicy}
            onToggleKillSwitch={handleToggleKillSwitch}
          />
        )}

        {activeTab === 'batch' && (
          <BatchEvaluator />
        )}
      </main>

      {/* Modals & Drawers with explicit keys for fresh remounts */}
      <RazorpayCheckoutModal
        key={selectedCheckoutCase?.id || 'checkout_modal'}
        caseItem={selectedCheckoutCase}
        onClose={() => setSelectedCheckoutCase(null)}
        onCompletePayment={handleCompletePayment}
      />

      <WhatsAppSandboxModal
        key={selectedWhatsAppCase?.id || 'whatsapp_modal'}
        caseItem={selectedWhatsAppCase}
        onClose={() => setSelectedWhatsAppCase(null)}
        onOpenCheckout={setSelectedCheckoutCase}
      />

      <VoiceCallSandboxModal
        key={selectedVoiceCase?.id || 'voice_modal'}
        caseItem={selectedVoiceCase}
        onClose={() => setSelectedVoiceCase(null)}
        onOpenCheckout={setSelectedCheckoutCase}
      />

      <WebhookPlaygroundModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onWebhookDispatched={loadData}
      />

      <AIAgentThoughtModal
        isOpen={Boolean(selectedAICase)}
        caseItem={selectedAICase}
        onClose={() => setSelectedAICase(null)}
      />
    </div>
  );
}
