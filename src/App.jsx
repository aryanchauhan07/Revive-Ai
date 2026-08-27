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

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [merchant, setMerchant] = useState(null);
  const [cases, setCases] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);

  // Modals
  const [selectedCheckoutCase, setSelectedCheckoutCase] = useState(null);
  const [selectedWhatsAppCase, setSelectedWhatsAppCase] = useState(null);

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

  const handleTriggerDemo = async () => {
    await triggerDemoIncident('HDFC Bank', 'upi');
    await triggerDemoPaymentFailure({
      customerName: 'Ananya Roy',
      customerPhone: '+919876543210',
      amountRupees: 4850,
      reason: 'gateway_technical_error',
      method: 'upi',
      bank: 'HDFC Bank'
    });
    loadData();
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        merchant={merchant}
        onToggleKillSwitch={handleToggleKillSwitch}
        onTriggerDemo={handleTriggerDemo}
      />

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
            onTriggerDemo={handleTriggerDemo}
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
            onExecuteAction={handleApproveAction}
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

        {activeTab === 'batch' && (
          <BatchEvaluator />
        )}
      </main>

      {/* Interactive Modals */}
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
    </div>
  );
}
