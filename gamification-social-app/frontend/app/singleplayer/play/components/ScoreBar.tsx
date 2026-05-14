"use client";

import React, { useEffect, useState } from "react";

interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (displayScore !== score) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPulse(true);
      const timer = setTimeout(() => {
        setDisplayScore(score);
        setPulse(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  return (
    <div className="w-48 bg-black/60 border border-[#39FF14]/30 p-6 backdrop-blur-md relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#39FF14]/5 blur-3xl group-hover:bg-[#39FF14]/10 transition-all duration-700" />
      
      <div className="relative flex flex-col items-center">


        {/* Circular/Semi-circular Gauge Look (Simplified) */}
        <div className="relative flex flex-col items-center gap-6">
          {/* Main Score Display */}
          <div className="relative">
            <div className={`text-6xl font-black italic tracking-tighter text-white transition-all duration-300 ${pulse ? "scale-110 drop-shadow-[0_0_15px_#39FF14]" : "scale-100 drop-shadow-[0_0_8px_#39FF14]/50"}`}>
              {displayScore}
            </div>
            <div className="absolute -top-1 -right-4 text-[10px] font-black text-[#00F0FF]">PTS</div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex justify-between items-end mb-1">

              <span className="text-[8px] font-bold text-[#39FF14]">{displayScore}%</span>
            </div>
            
            <div className="h-6 w-full flex gap-1 p-1 bg-white/5 border border-white/10 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-full transition-all duration-500 ${
                    (displayScore / 10) > i 
                      ? "bg-gradient-to-t from-[#39FF14] to-[#00F0FF] shadow-[0_0_8px_#39FF14]/50" 
                      : "bg-white/5"
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* Decorative Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#39FF14]/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00F0FF]/40" />
    </div>
  );
}

