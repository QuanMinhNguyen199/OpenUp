"use client";

import React from "react";

interface Props {
    myUsername: string;
    opponentUsername: string;
    myScore: number;
    opponentScore: number;
}

export default function DualScoreBar({ myUsername, opponentUsername, myScore, opponentScore }: Props) {
    return (
        <div className="w-48 bg-white/5 border border-[#FF6B35]/30 px-4 py-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B35]/5 blur-3xl" />

            <div className="relative space-y-5">
                <h3 className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-widest text-center">
                    Bảng điểm
                </h3>

                {/* My Score */}
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest truncate">
                        {myUsername || "Bạn"}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black italic tabular-nums ${myScore >= 0 ? "text-[#39FF14]" : "text-red-500"}`}>
                            {myScore >= 0 ? "+" : ""}{myScore}
                        </span>
                    </div>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Opponent Score */}
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-widest truncate">
                        {opponentUsername || "Đối thủ"}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black italic tabular-nums ${opponentScore >= 0 ? "text-[#00F0FF]" : "text-red-500"}`}>
                            {opponentScore >= 0 ? "+" : ""}{opponentScore}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
