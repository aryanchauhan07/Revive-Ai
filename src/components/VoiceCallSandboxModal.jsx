import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, PhoneOff, Volume2, VolumeX, CheckCircle2, ShieldCheck, Sparkles, User, Bot } from 'lucide-react';

export default function VoiceCallSandboxModal({ caseItem, onClose, onOpenCheckout }) {
  const [callState, setCallState] = useState('DIALING'); // DIALING | CONNECTED | COMPLETED
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const scrollRef = useRef(null);

  if (!caseItem) return null;

  const amountRupees = Math.round(caseItem.amount_paise / 100).toLocaleString();

  const conversationTranscript = [
    { speaker: 'AI Agent', text: `Namaste ${caseItem.customer_name} ji! Main Razorpay Revive AI se bol raha hoon.` },
    { speaker: 'Customer', text: 'Haan ji boliye, kaun?' },
    { speaker: 'AI Agent', text: `Aapka ₹${amountRupees} ka payment bank server timeout ki wajah se fail ho gaya tha.` },
    { speaker: 'Customer', text: 'Achha, kya mera amount bank se deduct hua hai?' },
    { speaker: 'AI Agent', text: 'Nahi ji, aapka amount safe hai. Kya main aapko alternative 1-click Razorpay payment link WhatsApp par bhej doon?' },
    { speaker: 'Customer', text: 'Haan please bhej dijiye, main abhi complete kar leta hoon.' },
    { speaker: 'AI Agent', text: 'Dhanyawad! Call disconnect hotey hi link bhej diya gaya hai. Have a wonderful day!' }
  ];

  // Text-To-Speech (Web Speech API) helper
  const speakText = (text) => {
    if (!isAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'hi-IN'; // Hinglish / Hindi locale fallback
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  useEffect(() => {
    if (callState === 'DIALING') {
      const timer = setTimeout(() => {
        setCallState('CONNECTED');
        speakText(conversationTranscript[0].text);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (callState === 'CONNECTED') {
      const interval = setInterval(() => {
        setTranscriptIndex(prev => {
          if (prev < conversationTranscript.length - 1) {
            const nextIdx = prev + 1;
            speakText(conversationTranscript[nextIdx].text);
            return nextIdx;
          } else {
            setCallState('COMPLETED');
            return prev;
          }
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [callState]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptIndex, callState]);

  const handleClose = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-900">
        {/* Voice Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-pulse">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Razorpay Hinglish AI Voice Recovery</h4>
              <span className="text-[11px] text-emerald-400 font-bold font-mono">
                {callState === 'DIALING' ? 'Dialing Customer...' : callState === 'CONNECTED' ? 'Live AI Call Active (0:18)' : 'Call Completed • Agreed'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title={isAudioEnabled ? "Mute Voice Audio" : "Unmute Voice Audio"}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Waveform Animation Area */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-5 text-center text-white space-y-3 border-b border-slate-700">
          <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-400/40 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Volume2 className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-extrabold">{caseItem.customer_name}</h3>
            <p className="text-xs text-slate-400 font-mono">{caseItem.customer_phone} • Order ₹{amountRupees}</p>
          </div>

          {/* Animated Waveform Bars */}
          <div className="flex items-center justify-center space-x-1.5 h-6">
            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.6s_infinite] h-3"></span>
            <span className="w-1 bg-blue-400 rounded-full animate-[pulse_0.8s_infinite] h-6"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.4s_infinite] h-4"></span>
            <span className="w-1 bg-sky-400 rounded-full animate-[pulse_0.7s_infinite] h-6"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.5s_infinite] h-2.5"></span>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-slate-50 custom-scrollbar">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-2">
            Speech-To-Text Live Transcript (Hinglish AI Voice Model)
          </div>

          {conversationTranscript.slice(0, transcriptIndex + 1).map((msg, idx) => {
            const isAI = msg.speaker === 'AI Agent';
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs space-y-1 shadow-2xs max-w-[88%] animate-fade-in ${
                  isAI
                    ? 'bg-blue-600 text-white font-medium rounded-tl-none mr-auto'
                    : 'bg-white border border-slate-200 text-slate-800 font-medium rounded-tr-none ml-auto'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-80 font-bold">
                  <span className="flex items-center space-x-1">
                    {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span>{msg.speaker}</span>
                  </span>
                  <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          {callState === 'COMPLETED' ? (
            <button
              onClick={() => {
                handleClose();
                onOpenCheckout(caseItem);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Customer Agreed • Open Razorpay Pay Link</span>
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center space-x-2 transition-all"
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
