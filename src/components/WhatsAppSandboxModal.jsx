import React from 'react';
import { X, Send, CheckCheck, ExternalLink } from 'lucide-react';

export default function WhatsAppSandboxModal({ caseItem, onClose, onOpenCheckout }) {
  if (!caseItem) return null;

  const amountRupees = caseItem.amount_paise / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/20 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md h-full bg-[#f0f2f5] border-l border-slate-200 shadow-2xl flex flex-col text-slate-900">
        {/* WhatsApp Light Header */}
        <div className="bg-[#008069] px-4 py-3.5 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#008069] flex items-center justify-center font-bold text-sm shadow-sm">
              RM
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Revive Merchant Store</h4>
              <span className="text-[11px] text-emerald-100 font-medium">WhatsApp Verified Business</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#efeae2] bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Date Badge */}
          <div className="text-center">
            <span className="text-[10px] bg-white/90 px-3 py-1 rounded-lg text-slate-600 border border-slate-200 font-semibold shadow-xs">
              Today • Razorpay AI Automated Recovery Message
            </span>
          </div>

          {/* Outbound AI Message */}
          <div className="bg-white p-4 rounded-2xl rounded-tl-none max-w-[88%] border border-slate-200/80 text-xs shadow-sm space-y-2.5">
            <p className="text-slate-800 leading-relaxed font-medium">
              Namaste <strong>{caseItem.customer_name}</strong> 🙏
            </p>
            <p className="text-slate-700 leading-relaxed">
              Aapka <strong>₹{amountRupees.toLocaleString()}</strong> ka payment <em>{caseItem.failure_reason?.issuer || 'Bank'} UPI server timeout</em> ki वजह se complete nahi ho paya.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Koi baat nahi! Aap niche diye gaye 1-click Razorpay link se card ya alternate UPI se instantly retry kar sakte hain:
            </p>

            {/* Interactive Link Card inside WhatsApp */}
            <div 
              onClick={() => {
                onClose();
                onOpenCheckout(caseItem);
              }}
              className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 hover:border-blue-400 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 group-hover:underline">
                  Razorpay Payment Link (1-Click)
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">Amount: ₹{amountRupees.toLocaleString()} • Expires in 60m</div>
            </div>

            <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-400 pt-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* WhatsApp Footer Input Bar */}
        <div className="bg-[#f0f2f5] p-3 border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value="Reply 'STOP' to opt-out or click payment link above"
            className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs text-slate-500 focus:outline-none shadow-xs"
          />
          <button className="p-2.5 rounded-full bg-[#008069] text-white shadow-sm hover:bg-[#006e5a] transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
