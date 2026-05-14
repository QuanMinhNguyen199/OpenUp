"use client";

import React from "react";

interface ProfilePanelProps {
  npcName: string;
  npcJob: string;
  relationship: string;
  location: string;
  num: number[];
}

export default function ProfilePanel({
  npcName,
  npcJob,
  relationship,
  location,
  num,
}: ProfilePanelProps) {
  // Determine gender from first num (even = male, odd = female)
  const isMale = num.length > 0 ? num[0] % 2 === 0 : true;
  const genderEmoji = isMale ? "🧑🏻" : "👩🏻";

  return (
    <div className="w-80 flex flex-col gap-6 h-fit sticky top-6 animate-in fade-in slide-in-from-left duration-700">
      {/* Profile Header Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-[#00F0FF]/5 blur-xl group-hover:bg-[#00F0FF]/10 transition-all duration-700" />

        <div className="relative bg-black/60 border border-[#00F0FF]/30 p-6 backdrop-blur-md rounded-br-3xl overflow-hidden">
          {/* Corner Decors */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00F0FF]/40" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#39FF14]/40" />

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#39FF14]/20 blur-lg animate-pulse" />
              <div className="relative h-24 w-24 flex items-center justify-center">
                <div className="absolute inset-0 rotate-45 border-2 border-[#39FF14] bg-black/40 shadow-[0_0_15px_#39FF14]" />
                <span className="relative z-10 text-4xl drop-shadow-[0_0_10px_#39FF14]">{genderEmoji}</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black italic tracking-tighter text-[#39FF14] uppercase drop-shadow-[0_0_8px_#39FF14]">
                {npcName}
              </h2>
              <div className="inline-block px-3 py-0.5 bg-[#00F0FF] text-black text-[10px] font-black skew-x-[-15deg] uppercase">
                {npcJob}
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent my-6" />

          {/* Info Items */}
          <div className="space-y-5">
            <div className="group/item">
              <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] mb-1.5 opacity-70">Relationship Status</p>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#00F0FF] rotate-45 shadow-[0_0_5px_#00F0FF]" />
                <span className="text-sm font-medium text-gray-200 italic">{relationship}</span>
              </div>
            </div>

            <div className="group/item">
              <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] mb-1.5 opacity-70">Current Location</p>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#00F0FF] rotate-45 shadow-[0_0_5px_#00F0FF]" />
                <span className="text-sm font-medium text-gray-200 italic">{location}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-white/5">
            <p className="text-[10px] font-medium text-[#00F0FF]/60 italic flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
              NEURAL LINK STABLE: ANALYZING SOCIAL CUES...
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}


