"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Props {
    result: "win" | "lose" | "draw";
    myScore: number;
    opponentScore: number;
    xpChange: number;
    opponentUsername: string;
    myUsername: string;
    onBackToLobby: () => void;
}

export default function MultiplayerResultPopup({
    result, myScore, opponentScore, xpChange, opponentUsername, myUsername, onBackToLobby,
}: Props) {
    const config = {
        win: {
            title: "CHIẾN THẮNG!",
            subtitle: "Bạn đã vượt trội đối thủ!",
            color: "#39FF14",
            emoji: "🏆",
        },
        lose: {
            title: "THẤT BẠI",
            subtitle: "Lần sau sẽ tốt hơn!",
            color: "#FF4444",
            emoji: "💔",
        },
        draw: {
            title: "HÒA",
            subtitle: "Ngang tài ngang sức!",
            color: "#FF6B35",
            emoji: "🤝",
        },
    }[result];

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_3px,transparent_3px),linear-gradient(to_bottom,#80808012_3px,transparent_3px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            <div className="relative z-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Emoji */}
                <div className="text-8xl animate-bounce">{config.emoji}</div>

                {/* Title */}
                <h1
                    className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase"
                    style={{ color: config.color, textShadow: `0 0 40px ${config.color}` }}
                >
                    {config.title}
                </h1>
                <p className="text-xl text-gray-400 italic">{config.subtitle}</p>

                {/* Score comparison */}
                <div className="flex items-center justify-center gap-8 mt-8">
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-[#39FF14] uppercase tracking-widest">{myUsername}</p>
                        <p className="text-5xl font-black italic text-white">{myScore >= 0 ? "+" : ""}{myScore}</p>
                    </div>
                    <div className="text-3xl font-black italic text-gray-600">VS</div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">{opponentUsername}</p>
                        <p className="text-5xl font-black italic text-white">{opponentScore >= 0 ? "+" : ""}{opponentScore}</p>
                    </div>
                </div>

                {/* XP change */}
                <div className="mt-4">
                    <span className={`text-2xl font-black italic ${xpChange >= 0 ? "text-[#39FF14]" : "text-red-500"}`}>
                        {xpChange >= 0 ? "+" : ""}{xpChange} XP
                    </span>
                </div>

                {/* Button */}
                <div className="mt-8">
                    <button
                        onClick={onBackToLobby}
                        className="relative px-12 py-5 group/btn overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-[#FF6B35] skew-x-[-15deg] translate-x-0 group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
                        <div className="absolute inset-0 border-2 border-[#FF6B35] skew-x-[-15deg]" />
                        <span className="relative z-10 text-2xl font-black italic tracking-tighter text-black group-hover/btn:text-[#FF6B35] transition-colors duration-300">
                            VỀ MULTIPLAYER
                        </span>
                    </button>
                </div>
            </div>
        </main>
    );
}
