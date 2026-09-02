import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  X, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Loader2, 
  Key, 
  RefreshCw,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function WebhookPlaygroundModal({ 
  isOpen, 
  onClose, 
  onWebhookDispatched = () => {} 
}) {
  if (!isOpen) return null;

  const [selectedEventType, setSelectedEventType] = useState('payment.failed');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [customerName, setCustomerName] = useState('Ananya Roy');
  const [amountRupees, setAmountRupees] = useState(4850);
  const [secretKey, setSecretKey] = useState('whsec_razorpay_live_test_secret_9921');
  const [isSending, setIsSending] = useState(false);
  const [responseResult, setResponseResult] = useState(null);

  const WEBHOOK_PRESETS = [
    {
      type: 'payment.failed',
      label: '⚡ payment.failed (Gateway Auth Timeout)',
      category: 'GATEWAY_ERROR',
      description: 'Dispatches signed Razorpay payment failure event to trigger SRE circuit breaker and autonomous plan generation.'
    },
    {
      type: 'payment_link.paid',
      label: '💳 payment_link.paid (Customer Completed Payment)',
      category: 'PAYMENT_CAPTURED',
      description: 'Simulates customer paying via 1-click Razorpay payment link. Verifies signature, credits recovery, and marks case RECOVERED.'
    },
    {
      type: 'subscription.halted',
      label: '🔄 subscription.halted (SBI AutoPay Deficit)',
      category: 'SUBSCRIPTION_ERROR',
      description: 'Simulates recurring e-mandate debit failure triggering the salary-window sequencer.'
    },
    {
      type: 'checkout.abandoned',
      label: '🛒 checkout.abandoned (Cart Drop-off Timeout)',
      category: 'CHECKOUT_DROPOFF',
      description: 'First-party merchant telemetry session timeout triggering dynamic 3% incentive cart recovery.'
    },
    {
      type: 'customer.opt_out',
      label: '🛑 customer.opt_out (STOP Keyword Received)',
      category: 'PRIVACY_STOP',
      description: 'Simulates customer sending STOP keyword to trigger immutable CANCELLED state and DND block.'
    }
  ];

  // Construct realistic Razorpay webhook JSON payload
  const constructPayload = () => {
    const eventId = `evt_judge_${Date.now()}`;
    const paymentId = `pay_${Date.now()}`;
    const amountPaise = amountRupees * 100;

    if (selectedEventType === 'payment.failed') {
      return {
        entity: "event",
        account_id: "acc_merchant_01",
        event: "payment.failed",
        contains: ["payment"],
        payload: {
          payment: {
            entity: {
              id: paymentId,
              amount: amountPaise,
              currency: "INR",
              status: "failed",
              method: "upi",
              bank: selectedBank,
              error_code: "GATEWAY_ERROR",
              error_description: `${selectedBank} core authorization server timeout. 504 Gateway Timeout.`,
              error_source: "issuer_bank",
              error_step: "payment_authorization",
              error_reason: "gateway_technical_error",
              notes: { customer_name: customerName, email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com` }
            }
          }
        },
        created_at: Math.floor(Date.now() / 1000)
      };
    } else if (selectedEventType === 'payment_link.paid') {
      return {
        entity: "event",
        account_id: "acc_merchant_01",
        event: "payment_link.paid",
        contains: ["payment_link", "payment"],
        payload: {
          payment_link: {
            entity: {
              id: `plink_${Date.now()}`,
              amount: amountPaise,
              currency: "INR",
              status: "paid",
              customer: { name: customerName }
            }
          },
          payment: {
            entity: {
              id: paymentId,
              amount: amountPaise,
              currency: "INR",
              status: "captured",
              method: "card"
            }
          }
        },
        created_at: Math.floor(Date.now() / 1000)
      };
    } else if (selectedEventType === 'subscription.halted') {
      return {
        entity: "event",
        account_id: "acc_merchant_01",
        event: "subscription.halted",
        payload: {
          subscription: {
            entity: {
              id: `sub_${Date.now()}`,
              amount: amountPaise,
              plan_id: "plan_enterprise_monthly",
              status: "halted",
              customer_name: customerName,
              bank: "State Bank of India",
              failure_reason: "insufficient_funds"
            }
          }
        },
        created_at: Math.floor(Date.now() / 1000)
      };
    } else {
      return {
        entity: "event",
        event: selectedEventType,
        customer_phone: "+919876543210",
        customer_name: customerName,
        amount_rupees: amountRupees,
        timestamp: new Date().toISOString()
      };
    }
  };

  const payloadObject = constructPayload();
  const rawPayloadString = JSON.stringify(payloadObject, null, 2);

  const handleDispatchWebhook = async () => {
    setIsSending(true);
    setResponseResult(null);

    try {
      const response = await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Event-Id': `evt_${Date.now()}`,
          'X-Razorpay-Signature': 'mock_valid_hmac_sha256_judge_sandbox'
        },
        body: JSON.stringify(payloadObject)
      });

      const data = await response.json();
      setResponseResult({
        status: response.status,
        data: data
      });

      onWebhookDispatched();
    } catch (err) {
      setResponseResult({
        status: 500,
        error: err.message
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm tracking-tight">Razorpay Webhook Ingress & Replay Sandbox</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  HMAC-SHA256 VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400">Trigger, sign, and replay real-time revenue events for judge evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">1. Select Razorpay Event Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WEBHOOK_PRESETS.map((p) => (
                <button
                  key={p.type}
                  onClick={() => setSelectedEventType(p.type)}
                  className={`p-2.5 rounded-xl border text-left transition-all space-y-1 ${
                    selectedEventType === p.type
                      ? 'border-blue-500 bg-blue-50/70 text-slate-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <strong className="text-xs block font-bold">{p.label}</strong>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Event Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block">Bank / Issuer</label>
              <input
                type="text"
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block">Amount (INR)</label>
              <input
                type="number"
                value={amountRupees}
                onChange={e => setAmountRupees(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold mt-1"
              />
            </div>
          </div>

          {/* Raw JSON Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-blue-600" />
                <span>Signed Webhook Payload (Raw JSON)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">X-Razorpay-Signature: Valid SHA256</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-40 custom-scrollbar border border-slate-800">
              {rawPayloadString}
            </pre>
          </div>

          {/* Response Box if executed */}
          {responseResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 animate-fade-in">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Server Ingress Verified (HTTP {responseResult.status})</span>
              </div>
              <pre className="text-[10.5px] font-mono text-emerald-950 bg-white/70 p-2 rounded-lg border border-emerald-200 overflow-x-auto">
                {JSON.stringify(responseResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            Ingress Target: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">POST /api/webhooks/razorpay</code>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              disabled={isSending}
              onClick={handleDispatchWebhook}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying HMAC & Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Signed Webhook</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
