import React, { useState } from 'react';
import { X, CheckCircle2, Lock, ArrowRight, ShieldCheck, CreditCard, QrCode, Landmark, Loader2, AlertCircle } from 'lucide-react';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export default function RazorpayCheckoutModal({ caseItem, onClose, onCompletePayment }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  if (!caseItem) return null;

  const originalAmt = (caseItem.amount_paise || 0) / 100;
  const discountPct = caseItem.current_plan?.actions?.find(a => a.action === 'INCENTIVE')?.params?.discountPct || 0;
  const finalAmt = originalAmt * (1 - discountPct / 100);

  const handleLaunchRazorpayCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Load checkout.js dynamically from Razorpay CDN
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMessage("Could not load Razorpay Checkout script. Check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 2. Call backend merchant endpoint to create order server-side
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

      // 3. Configure Razorpay Standard Checkout modal options
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
          contact: caseItem.customer_phone || "+919876543210"
        },
        notes: {
          case_id: caseItem.id
        },
        theme: {
          color: "#2563eb"
        },
        handler: async function (response) {
          setIsProcessing(true);
          try {
            // 4. Server-side signature verification before marking paid
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
            console.log("Customer closed the checkout modal without paying.");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              R
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Razorpay Standard Web Checkout</h4>
              <p className="text-[11px] text-blue-200">Merchant Store • Case {caseItem.id}</p>
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
            <h3 className="text-xl font-extrabold text-slate-900">Payment Verified & Settled!</h3>
            <p className="text-xs text-slate-500">
              ₹{finalAmt.toLocaleString()} successfully captured via Razorpay Standard Checkout.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-emerald-700 font-mono space-y-1">
              <div>Payment ID: {paymentDetails?.payment_id}</div>
              <div>Order ID: {paymentDetails?.order_id}</div>
              <div className="text-[10px] text-slate-400">Signature: HMAC-SHA256 Verified Server-Side</div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
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

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Button to launch Razorpay Checkout modal */}
            <div className="pt-2">
              <button
                onClick={handleLaunchRazorpayCheckout}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Razorpay Modal...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Open Razorpay Standard Checkout</span>
                  </>
                )}
              </button>
            </div>

            {/* Security footer */}
            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure • Server-Verified Signature</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
