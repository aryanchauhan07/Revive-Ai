import React from 'react';

export default function BrandLogo({ size = 36, showText = true }) {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Custom Vector Fintech SRE Logo Mark */}
      <div 
        style={{ width: size, height: size }} 
        className="relative shrink-0 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[1.5px] shadow-md shadow-blue-500/20 group cursor-pointer transition-transform duration-200 hover:scale-105"
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-blue-500/30 to-transparent"></div>

          {/* Precision SVG Vector Mark: Interlocking Recovery Ring with SRE Spark */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 text-white relative z-10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Recovery Orbit Path */}
            <path 
              d="M12 2C6.47715 2 2 6.47715 2 12C2 14.5361 2.94424 16.8517 4.5 18.618M12 22C17.5228 22 22 17.5228 22 12C22 9.46387 21.0558 7.14828 19.5 5.38197" 
              stroke="url(#orbitGradient)" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
            {/* Inner Angular Recovery Arrow / Lightning */}
            <path 
              d="M13 3L8 13H12L11 21L17 11H13L13 3Z" 
              fill="url(#sparkGradient)" 
            />
            <defs>
              <linearGradient id="orbitGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#6366f1" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="sparkGradient" x1="8" y1="3" x2="17" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-[18px] tracking-tight text-slate-900 leading-none">
              Revive <span className="text-blue-600">AI</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
            Autonomous Payment SRE & Revenue Recovery
          </p>
        </div>
      )}
    </div>
  );
}
