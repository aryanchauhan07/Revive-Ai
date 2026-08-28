import React, { useState, useEffect } from 'react';
import { X, Phone, PhoneOff, Mic, Volume2, CheckCircle2, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export default function VoiceCallSandboxModal({ caseItem, onClose, onOpenCheckout }) {
  const [callState, setCallState] = useState('DIALING'); // DIALING | CONNECTED | COMPLETED
  const [transcriptIndex, setTranscriptIndex] = useState(0);

  if (!caseItem) return null;

  const amountRupees = (caseItem.amount_paise / 100).toLocaleString();

  const conversationTranscript = [
    { speaker: 'AI Agent', text: `Namaste ${caseItem.customer_name} ji! Main Razorpay Revive AI se bol raha hoon 🙏` },
    { speaker: 'Customer', text: 'Haan ji boliyee, kaun?' },
    { speaker: 'AI Agent', text: `Aapka ₹${amountRupees} ka payment HDFC Bank server timeout ki wajah se complete nahi ho paya tha.` },
    { speaker: 'Customer', text: 'Achha, mera amount kat gaya kya bank se?' },
    { speaker: 'AI Agent', text: 'Nahi ji, aapka amount safe hai. Kya main aapko alternate UPI / Card se complete karne ka 1-click Razorpay link WhatsApp par bhej doon?' },
    { speaker: 'Customer', text: 'Haan zaroor, bhej dijiye main abhi kar deta hoon.' },
    { speaker: 'AI Agent', text: 'Dhanyawad! Call disconnect hotey hi aapko link mil jayega. Have a great day!' }
  ];

  useEffect(() => {
    if (callState === 'DIALING') {
      const timer = setTimeout(() => setCallState('CONNECTED'), 1500);
      return () => clearTimeout(timer);
    }
    if (callState === 'CONNECTED') {
      const interval = setInterval(() => {
        setTranscriptIndex(prev => {
          if (prev < conversationTranscript.length - 1) {
            return prev + 1;
          } else {
            setCallState('COMPLETED');
            return prev;
          }
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/30 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-900">
        {/* Voice Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-pulse">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Razorpay Hinglish AI Voice Recovery</h4>
              <span className="text-[11px] text-emerald-400 font-bold font-mono">
                {callState === 'DIALING' ? 'Dialing Customer...' : callState === 'CONNECTED' ? 'Live AI Call Active (0:18)' : 'Call Completed • Agreed'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Waveform Animation Area */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-center text-white space-y-4 border-b border-slate-700">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-400/40 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Volume2 className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold">{caseItem.customer_name}</h3>
            <p className="text-xs text-slate-400 font-mono">{caseItem.customer_phone} • Order ₹{amountRupees}</p>
          </div>

          {/* Animated Waveform Bars */}
          <div className="flex items-center justify-center space-x-1.5 h-8">
            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.6s_infinite] h-4"></span>
            <span className="w-1 bg-blue-400 rounded-full animate-[pulse_0.8s_infinite] h-7"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.4s_infinite] h-5"></span>
            <span className="w-1 bg-sky-400 rounded-full animate-[pulse_0.7s_infinite] h-8"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.5s_infinite] h-3"></span>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50 custom-scrollbar">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-2">
            Speech-To-Text Live Transcript (Hinglish AI Engine)
          </div>

          {conversationTranscript.slice(0, transcriptIndex + 1).map((msg, idx) => {
            const isAI = msg.speaker === 'AI Agent';
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs max-w-[90%] animate-fade-in ${
                  isAI
                    ? 'bg-blue-600 text-white font-medium rounded-tl-none mr-auto'
                    : 'bg-white border border-slate-200 text-slate-800 font-medium rounded-tr-none ml-auto'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-80 font-bold">
                  <span>{msg.speaker}</span>
                  <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {callState === 'COMPLETED' ? (
            <button
              onClick={() => {
                onClose();
                onOpenCheckout(caseItem);
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Customer Agreed • Open Razorpay Pay Link</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center space-x-2 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End AI Voice Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
