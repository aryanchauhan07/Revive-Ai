import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Bot, 
  Play,
  RotateCcw,
  Radio
} from 'lucide-react';

export default function VoiceCallSandboxModal({ caseItem, onClose, onOpenCheckout }) {
  const [callState, setCallState] = useState('DIALING'); // DIALING | CONNECTED | COMPLETED
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const scrollRef = useRef(null);

  if (!caseItem) return null;

  const amountRupees = Math.round((caseItem.amount_paise || 0) / 100).toLocaleString();
  const customerName = caseItem.customer_name || 'Customer';

  const conversationTranscript = [
    { 
      speaker: 'AI Agent', 
      text: `Namaste ${customerName} ji! Main Razorpay Revive AI payment desk se bol raha hoon.`,
      textEn: `Hello ${customerName}, I am calling from Razorpay Revive AI payment desk.`
    },
    { 
      speaker: 'Customer', 
      text: 'Haan ji boliye, kaun baat kar raha hai?',
      textEn: 'Yes please tell me, who is speaking?'
    },
    { 
      speaker: 'AI Agent', 
      text: `Aapka ₹${amountRupees} ka payment bank server timeout ki wajah se complete nahi ho paya tha.`,
      textEn: `Your payment of ₹${amountRupees} could not be completed due to a bank server timeout.`
    },
    { 
      speaker: 'Customer', 
      text: 'Achha! Kya mera amount mere bank account se deduct hua hai?',
      textEn: 'I see! Was the amount deducted from my bank account?'
    },
    { 
      speaker: 'AI Agent', 
      text: 'Nahi ji, aapka amount bilkul safe hai. Kya main aapko alternate 1-click Razorpay payment link WhatsApp par bhej doon?',
      textEn: 'No, your funds are completely safe. Should I send you an alternate 1-click payment link on WhatsApp?'
    },
    { 
      speaker: 'Customer', 
      text: 'Haan please bhej dijiye, main abhi alternate method se complete kar leti hoon.',
      textEn: 'Yes please send it, I will complete it right now using an alternate method.'
    },
    { 
      speaker: 'AI Agent', 
      text: 'Dhanyawad! Call disconnect hotey hi instant payment link aapke WhatsApp par bhej diya gaya hai. Have a great day!',
      textEn: 'Thank you! The instant payment link has been sent to your WhatsApp. Have a great day!'
    }
  ];

  // Helper to find the best Indian / Hindi / English voice available
  const getBestVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
      voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      voices.find(v => v.name.includes('India') || v.name.includes('Hindi')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  // Text-To-Speech Synthesis function
  const speakText = (text) => {
    if (!isAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.lang = 'hi-IN';

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis audio error:", err);
      setIsPlayingAudio(false);
    }
  };

  // Start call simulation & speak first message
  const startCall = () => {
    setCallState('CONNECTED');
    setTranscriptIndex(0);
    speakText(conversationTranscript[0].text);
  };

  // Initialize on mount or when case changes
  useEffect(() => {
    setCallState('DIALING');
    setTranscriptIndex(0);

    const dialTimer = setTimeout(() => {
      setCallState('CONNECTED');
      speakText(conversationTranscript[0].text);
    }, 1000);

    return () => {
      clearTimeout(dialTimer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [caseItem?.id]);

  // Advance conversation step-by-step
  useEffect(() => {
    if (callState === 'CONNECTED') {
      const timer = setInterval(() => {
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
      }, 3200);

      return () => clearInterval(timer);
    }
  }, [callState]);

  // Auto-scroll transcript to latest message
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

  const handleReplay = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    startCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-900">
        {/* Call Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-pulse">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-sm text-white">AI Voice Agent Simulator</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SANDBOX SIMULATION
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono font-semibold mt-0.5">
                {callState === 'DIALING' && 'Connecting to Customer...'}
                {callState === 'CONNECTED' && 'Interactive Speech Synthesis Demo in Progress'}
                {callState === 'COMPLETED' && 'Simulation Finished • 1-Click Pay Link Dispatched'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const next = !isAudioEnabled;
                setIsAudioEnabled(next);
                if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-2 rounded-xl transition-all ${
                isAudioEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
              title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Call Meta Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="font-extrabold text-slate-900">{customerName}</div>
            <div className="text-[11px] text-slate-500 font-mono">{caseItem.customer_phone || '+919876543210'} • {caseItem.id}</div>
          </div>
          <div className="text-right">
            <div className="font-extrabold text-slate-900 font-mono">₹{amountRupees}</div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {caseItem.failure_reason?.method?.toUpperCase() || 'UPI'} • {caseItem.failure_reason?.error_reason}
            </span>
          </div>
        </div>

        {/* Live Audio Speaking Indicator Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Radio className={`w-4 h-4 ${isPlayingAudio ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-bold text-slate-700">
              {isPlayingAudio ? 'AI Agent Speaking Aloud...' : 'Listening / Responding...'}
            </span>
          </div>

          <button
            onClick={() => speakText(conversationTranscript[transcriptIndex]?.text || 'Namaste!')}
            className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-[10px] font-bold hover:bg-blue-50 transition-all flex items-center space-x-1 shadow-2xs"
          >
            <Play className="w-3 h-3" />
            <span>Play Current Audio</span>
          </button>
        </div>

        {/* Transcript Conversation Area */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-white">
          {conversationTranscript.slice(0, transcriptIndex + 1).map((msg, i) => {
            const isAI = msg.speaker === 'AI Agent';
            const isLatest = i === transcriptIndex;

            return (
              <div
                key={i}
                className={`flex items-start space-x-2.5 animate-fade-in ${
                  isAI ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAI ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                  }`}
                >
                  {isAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs space-y-1 ${
                    isAI
                      ? isLatest 
                        ? 'bg-blue-50 text-blue-950 border border-blue-300 shadow-2xs' 
                        : 'bg-slate-100 text-slate-800'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold opacity-75">
                    <span>{msg.speaker}</span>
                    {isAI && isLatest && isPlayingAudio && (
                      <span className="text-blue-700 animate-pulse font-mono">🔊 Speaking...</span>
                    )}
                  </div>
                  <p className="font-semibold leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] opacity-70 italic font-mono">{msg.textEn}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReplay}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Audio Call</span>
            </button>

            <button
              onClick={() => {
                handleClose();
                onOpenCheckout(caseItem);
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate Pay Link Captured</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
