"use client";

import React from "react";
import HomeButton from "./HomeButton";

interface SingleplayerResultPopupProps {
    mode: "win" | "lose";
    onReplay: () => void;
}

const SingleplayerResultPopup = ({ mode, onReplay }: SingleplayerResultPopupProps) => {
    const isWin = mode === "win";

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
                        onClick={onReplay}
                        className={`group relative inline-flex items-center justify-center w-14 h-14 border ${isWin ? 'border-[#39FF14]/50 bg-[#39FF14]/5 text-[#39FF14] hover:bg-[#39FF14]/20' : 'border-red-500/50 bg-red-500/5 text-red-500 hover:bg-red-500/20'} transition-all rounded-xl shadow-[0_0_15px_${isWin ? 'rgba(57,255,20,0.1)' : 'rgba(239,68,68,0.1)'}] hover:shadow-[0_0_20px_${isWin ? 'rgba(57,255,20,0.3)' : 'rgba(239,68,68,0.3)'}]`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
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