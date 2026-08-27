import React, { useState } from 'react';
import { X, CheckCircle2, Lock, ArrowRight, ShieldCheck, CreditCard, QrCode, Landmark } from 'lucide-react';

export default function RazorpayCheckoutModal({ caseItem, onClose, onCompletePayment }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!caseItem) return null;

  const originalAmt = caseItem.amount_paise / 100;
  const discountPct = caseItem.current_plan?.actions?.find(a => a.action === 'INCENTIVE')?.params?.discountPct || 0;
  const finalAmt = originalAmt * (1 - discountPct / 100);

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onCompletePayment(caseItem.id, selectedMethod);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              R
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Razorpay Secure Checkout</h4>
              <p className="text-[11px] text-blue-200">Merchant Store • Order {caseItem.provider_payment_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Payment Recovered!</h3>
            <p className="text-xs text-slate-500">
              ₹{finalAmt.toLocaleString()} successfully processed via {selectedMethod.toUpperCase()}.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-emerald-700 font-mono">
              Attribution: METHOD_SWITCH_ASSISTED • Net ROI Captured
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Payable</span>
                <span className="text-2xl font-extrabold text-slate-900">₹{finalAmt.toLocaleString()}</span>
                {discountPct > 0 && (
                  <span className="text-xs text-slate-400 line-through ml-2">₹{originalAmt.toLocaleString()}</span>
                )}
              </div>
              {discountPct > 0 && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  {discountPct}% Recover Offer
                </span>
              )}
            </div>

            {/* Smart Recovery Nudge */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs flex items-start space-x-3 text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-950 block font-bold">Recommended Payment Rail</strong>
                Your previous HDFC UPI request timed out. We recommend using <strong>ICICI Netbanking</strong> or <strong>Card</strong> for 99.8% completion rate.
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</label>

              <button
                onClick={() => setSelectedMethod('upi')}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  selectedMethod === 'upi'
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Instant UPI (GPay / PhonePe)</div>
                    <div className="text-[11px] text-slate-500">Rerouted via active PSP gateway</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'upi'} readOnly className="accent-blue-600" />
              </button>

              <button
                onClick={() => setSelectedMethod('card')}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Credit / Debit Card</div>
                    <div className="text-[11px] text-slate-500">Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'card'} readOnly className="accent-blue-600" />
              </button>

              <button
                onClick={() => setSelectedMethod('netbanking')}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Netbanking</div>
                    <div className="text-[11px] text-slate-500">All major Indian banks</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'netbanking'} readOnly className="accent-blue-600" />
              </button>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Complete Payment ₹{finalAmt.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
