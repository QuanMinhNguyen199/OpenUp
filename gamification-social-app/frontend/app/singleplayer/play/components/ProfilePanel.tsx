"use client";

import React from "react";

interface ProfilePanelProps {
  npcName: string;
  npcJob: string;
  relationship: string;
  location: string;
}

export default function ProfilePanel({
  npcName,
  npcJob,
  relationship,
  location,
}: ProfilePanelProps) {
  return (
    <div className="w-72 bg-gradient-to-b from-black/40 to-black/20 border border-[#00F0FF]/20 rounded-lg p-6 backdrop-blur-md h-fit sticky top-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4">
        {/* Avatar Circle */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#39FF14]/30 to-[#00F0FF]/30 border-2 border-[#39FF14] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.4)]">
            <span className="text-4xl">😊</span>
          </div>
        </div>

        {/* Name & Title */}
        <div className="text-center border-b border-[#39FF14]/30 pb-4">
          <h2 className="text-xl font-bold text-[#39FF14]">{npcName}</h2>
          <p className="text-sm text-[#00F0FF]">{npcJob}</p>
        </div>

        {/* Info Items */}
        <div className="space-y-4 text-sm">
          {/* Relationship */}
          <div className="flex items-start gap-3 pb-3 border-b border-[#00F0FF]/20">
            <span className="text-[#39FF14] font-bold min-w-fit">👥 Mối quan hệ:</span>
            <span className="text-[#00F0FF]/80">{relationship}</span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 pb-3 border-b border-[#00F0FF]/20">
            <span className="text-[#39FF14] font-bold min-w-fit">📍 Địa điểm:</span>
            <span className="text-[#00F0FF]/80">{location}</span>
          </div>

          {/* Info Note */}
          <div className="text-xs italic text-[#00F0FF]/60 pt-2">
            💡 Tập trung vào những bài học giao tiếp để chinh phục nhân vật này
          </div>
        </div>
      </div>
    </div>
  );
}
