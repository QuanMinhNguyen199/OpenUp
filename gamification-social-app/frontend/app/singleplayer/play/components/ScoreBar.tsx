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
    <div className="w-40 bg-gradient-to-b from-black/40 to-black/20 border border-[#39FF14]/30 rounded-lg p-4 backdrop-blur-md">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#39FF14]/70 mb-2">
          Điểm Số
        </p>
        <div className={`text-4xl font-black text-[#39FF14] transition-all duration-300 ${pulse ? "scale-110" : "scale-100"}`}>
          {displayScore}
        </div>
        {/* <div className="text-xs text-[#00F0FF]/60 mt-2">Khởi đầu: 20</div> */}

        {/* Score Bar Visualization */}
        <div className="mt-4 bg-black/50 rounded-full h-1 overflow-hidden border border-[#39FF14]/20">
          <div
            className="bg-gradient-to-r from-[#39FF14] to-[#00F0FF] h-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (displayScore / 100) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
