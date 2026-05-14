"use client";

import React from "react";
import { useRouter } from "next/navigation";
import HomeButton from "./HomeButton";

interface SingleplayerResultPopupProps {
    mode: "win" | "lose";
    replayLink: string;
}

const SingleplayerResultPopup = ({ mode, replayLink }: SingleplayerResultPopupProps) => {
    const router = useRouter();
    const isWin = mode === "win";

    const handleReplay = () => {
        const replayUrl = replayLink.includes("?")
            ? `${replayLink}&replay=${Date.now()}`
            : `${replayLink}?replay=${Date.now()}`;
        router.push(replayUrl);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
            <div className={`relative text-center p-12 border ${isWin ? 'border-[#39FF14]/30 bg-[#39FF14]/5' : 'border-red-500/30 bg-red-500/5'} rounded-2xl shadow-[0_0_50px_${isWin ? 'rgba(57,255,20,0.15)' : 'rgba(239,68,68,0.15)'}] max-w-md mx-4`}>
                {/* Corner Accents */}
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${isWin ? 'border-[#39FF14]' : 'border-red-500'}`}></div>
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${isWin ? 'border-[#39FF14]' : 'border-red-500'}`}></div>
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${isWin ? 'border-[#39FF14]' : 'border-red-500'}`}></div>
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${isWin ? 'border-[#39FF14]' : 'border-red-500'}`}></div>

                <div className={`w-20 h-20 ${isWin ? 'bg-[#39FF14]/20 border-[#39FF14]/50' : 'bg-red-500/20 border-red-500/50'} rounded-full flex items-center justify-center mx-auto mb-6 border`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${isWin ? 'text-[#39FF14]' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isWin ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </div>

                <h1 className={`text-4xl font-black mb-4 tracking-tighter italic uppercase ${isWin ? 'text-[#39FF14]' : 'text-red-500'}`}>
                    {isWin ? "Thành công" : "Thất bại"}
                </h1>
                <p className="text-gray-400 mb-8 font-mono text-sm leading-relaxed">
                    {isWin ? "+10 XP" : "Chúc may mắn lần sau"}
                </p>
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={handleReplay}
                        className={`group relative flex items-center justify-center px-8 py-3 border ${isWin ? 'border-[#39FF14]/50 bg-[#39FF14]/5 text-[#39FF14] hover:bg-[#39FF14]/20' : 'border-red-500/50 bg-red-500/5 text-red-500 hover:bg-red-500/20'} transition-all rounded-lg font-bold uppercase text-xs tracking-[0.2em] shadow-[0_0_15px_${isWin ? 'rgba(57,255,20,0.1)' : 'rgba(239,68,68,0.1)'}] hover:shadow-[0_0_20px_${isWin ? 'rgba(57,255,20,0.3)' : 'rgba(239,68,68,0.3)'}]`}
                    >
                        Replay
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Replay
                        </span>
                    </button>
                    <HomeButton />
                </div>
            </div>
        </main>
    );
};

export default SingleplayerResultPopup;