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
      setPulse(true);
      const timer = setTimeout(() => {
        setDisplayScore(score);
        setPulse(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  // Logic: 10 điểm = 1 vạch. 15đ vẫn là 1 vạch, 20đ mới là 2 vạch.
  const activeSegments = Math.floor(displayScore / 10);

  return (
    <div className="w-48 bg-white/5 border border-[#39FF14]/30 px-4 py-8 backdrop-blur-md relative overflow-hidden group shadow-2xl">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#39FF14]/5 blur-3xl group-hover:bg-[#39FF14]/10 transition-all duration-700" />

      <div className="relative flex flex-col items-center">
        <div className="relative flex flex-col items-center gap-4 w-full">
          {/* Main Score Display */}
          <div className="relative">
            <div className={`text-6xl font-black italic tracking-tighter text-white transition-all duration-300 ${pulse ? "scale-110 drop-shadow-[0_0_15px_#39FF14]" : "scale-100 drop-shadow-[0_0_8px_#39FF14]/50"}`}>
              {displayScore}
            </div>
            <div className="absolute -top-2 -right-5 text-sm font-black text-[#00F0FF]">ĐIỂM</div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="flex flex-col w-[60%]">
            {/* - Giảm gap xuống 0.5 để nhường chỗ cho độ rộng vạch.
               - Giảm p (padding) xuống 0.5 để vạch to hơn.
               - h-6 giữ nguyên chiều cao như cũ của bạn.
            */}
            <div className="h-6 w-full flex gap-[2px] p-[4px] bg-black/60 border border-white/20 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full transition-all duration-500 ${i < activeSegments
                    ? "bg-gradient-to-t from-[#39FF14] to-[#00F0FF] shadow-[0_0_8px_#39FF14]/50"
                    : "bg-white/15" // Vạch tối rõ ràng, không bị dính màu
                    }`}
                  style={{
                    transitionDelay: `${i * 30}ms`,
                    minWidth: "2px" // Đảm bảo vạch luôn hiện diện
                  }}
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