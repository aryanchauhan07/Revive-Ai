import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Landmark, 
  Loader2, 
  AlertCircle, 
  Smartphone,
  Zap,
  Sparkles
} from 'lucide-react';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export default function RazorpayCheckoutModal({ caseItem, onClose, onCompletePayment }) {
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  if (!caseItem) return null;

  const originalAmt = (caseItem.amount_paise || 0) / 100;
  const discountPct = caseItem.current_plan?.actions?.find(a => a.action === 'INCENTIVE')?.params?.discountPct || 0;
  const finalAmt = originalAmt * (1 - discountPct / 100);

  // 1. Launch Official Razorpay Standard Checkout Modal
  const handleLaunchRazorpayCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMessage("Could not load Razorpay Checkout script. Check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // Call backend to create Razorpay Order server-side
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseItem.id,
          currency: 'INR'
        })
      });

      if (!orderRes.ok) {
        const errJson = await orderRes.json().catch(() => ({}));
        setErrorMessage(errJson.error || "Failed to initialize order with payment provider.");
        setIsProcessing(false);
        return;
      }

      const orderData = await orderRes.json();

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Revive AI Store",
        description: `Revenue Recovery Payment • ${caseItem.id}`,
        order_id: orderData.order_id,
        prefill: {
          name: caseItem.customer_name || "Valued Customer",
          email: caseItem.customer_email || "customer@example.com",
          contact: caseItem.customer_phone || "+919876543210",
          method: selectedMethod === 'upi' ? 'upi' : 'card'
        },
        notes: {
          case_id: caseItem.id,
          selected_method: selectedMethod
        },
        theme: {
          color: "#2563eb"
        },
        handler: async function (response) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                case_id: caseItem.id
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPaymentDetails(verifyData);
              setIsSuccess(true);
              if (onCompletePayment) {
                onCompletePayment(caseItem.id, 'razorpay_standard_checkout');
              }
            } else {
              setErrorMessage(verifyData.error || "Payment signature verification failed.");
            }
          } catch (err) {
            setErrorMessage("Network error during payment verification.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || "Payment failed. Please retry.");
      });

      rzp.open();
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred opening checkout.");
      setIsProcessing(false);
    }
  };

  // 2. Direct 1-Click UPI Pay: executes instant UPI Intent authorization with server-side HMAC verification
  const handleQuickUpiPay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Create/fetch order first
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseItem.id,
          currency: 'INR'
        })
      });

      const orderData = await orderRes.json().catch(() => ({}));

      // Authorize UPI Intent with genuine HMAC verification on server
      const upiRes = await fetch('/api/authorize-upi-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseItem.id,
          app: selectedUpiApp,
          orderId: orderData?.order_id
        })
      });

      const upiData = await upiRes.json();
      if (upiRes.ok && upiData.success) {
        setPaymentDetails(upiData);
        setIsSuccess(true);
        if (onCompletePayment) {
          onCompletePayment(caseItem.id, `upi_intent_${selectedUpiApp}`);
        }
      } else {
        setErrorMessage(upiData.error || "UPI payment authorization failed.");
      }
    } catch (err) {
      setErrorMessage("Network error during UPI payment authorization.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm text-white">Razorpay Secure Checkout</h4>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 font-mono text-[9px] font-bold border border-blue-400/40">
                  UPI • CARDS • NETBANKING
                </span>
              </div>
              <p className="text-[11px] text-blue-200">Merchant Store • Case {caseItem.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Payment Verified & Settled!</h3>
            <p className="text-xs text-slate-500">
              ₹{finalAmt.toLocaleString()} successfully captured via Razorpay {selectedMethod.toUpperCase()}.
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-emerald-700 font-mono space-y-1">
              <div>Payment ID: {paymentDetails?.payment_id}</div>
              <div>Order ID: {paymentDetails?.order_id}</div>
              <div className="text-[10px] text-slate-400">Cryptographic HMAC-SHA256 Signature Verified</div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {/* Amount Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Payable Amount</span>
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  ₹{finalAmt.toLocaleString()}
                </span>
                {discountPct > 0 && (
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    Includes {discountPct}% dynamic recovery discount
                  </span>
                )}
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block">{caseItem.customer_name}</span>
                <span>{caseItem.customer_phone || "+91 98765 43210"}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    selectedMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">UPI & QR</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    selectedMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">Cards</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    selectedMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">Netbanking</span>
                </button>
              </div>
            </div>

            {/* UPI Apps & QR Sub-Selection */}
            {selectedMethod === 'upi' && (
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Instant UPI Apps & Dynamic QR</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">Zero-Redirect</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { id: 'gpay', label: 'Google Pay' },
                    { id: 'phonepe', label: 'PhonePe' },
                    { id: 'paytm', label: 'Paytm' },
                    { id: 'cred', label: 'CRED UPI' }
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedUpiApp(app.id)}
                      className={`p-2 rounded-xl border transition-all text-[11px] font-bold ${
                        selectedUpiApp === app.id
                          ? 'border-blue-600 bg-white text-blue-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>

                {/* 1-Click UPI Quick Pay CTA */}
                <button
                  onClick={handleQuickUpiPay}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authorizing UPI Intent...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-emerald-200" />
                      <span>1-Click Pay ₹{finalAmt.toLocaleString()} with {selectedUpiApp.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Action: Official Razorpay Checkout Modal */}
            <div className="pt-1">
              <button
                onClick={handleLaunchRazorpayCheckout}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Launch Razorpay Standard Modal (All Methods)</span>
                  </>
                )}
              </button>
            </div>

            {/* Security footer */}
            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified Gateway • HMAC Signature Checked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
