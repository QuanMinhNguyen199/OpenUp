"use client";

import React from "react";

interface PuzzlePopupProps {
    userData: any;
    onClose: () => void;
    onStartGame: () => void;
}

export default function PuzzlePopup({ userData, onClose, onStartGame }: PuzzlePopupProps) {
    return (
        <div className="relative z-10 w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="absolute inset-0 bg-[#00F0FF]/5 blur-xl rounded-xl"></div>

            <div className="relative border-2 border-[#00F0FF]/40 bg-black/95 p-6 md:p-8 rounded-xl backdrop-blur-sm flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_10px_#00F0FF]"></div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black italic text-[#00F0FF] uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                        Bản Đồ Mảnh Ghép
                    </h2>
                    {/* <p className="text-[10px] font-mono text-[#00F0FF]/60 uppercase tracking-[0.2em] mt-1">Data Reconstruction in Progress</p> */}
                </div>

                <div className="relative w-full aspect-square bg-[#050505] overflow-hidden border-2 border-white/10 group">
                    {/* The Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                        style={{ backgroundImage: "url('/puzzle.png')" }}
                    />

                    {/* The 3x3 Grid Overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10">
                        {[...Array(9)].map((_, i) => {
                            const cellIndex = i + 1;

                            // Cells 8 & 9 are completely black with no effects
                            if (cellIndex === 8 || cellIndex === 9) {
                                return <div key={i} className="bg-black"></div>;
                            }

                            const isPassed = cellIndex < userData.current_chap;
                            return (
                                <div
                                    key={i}
                                    className={`border border-white/10 transition-all duration-700 flex items-center justify-center ${isPassed
                                        ? 'bg-transparent border-white/5' // Clean reveal
                                        : 'bg-black/90' // Darkened
                                        }`}
                                >
                                    {!isPassed && (
                                        <div className="text-white/10 font-mono text-3xl font-black select-none">
                                            {cellIndex}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Scanning line effect */}
                    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                        <div className="w-full h-[2px] bg-[#00F0FF]/40 shadow-[0_0_15px_#00F0FF] absolute animate-scan-line"></div>
                    </div>
                </div>

                {/* Progress text removed as requested */}

                <button
                    onClick={onClose}
                    className="mt-8 w-full relative group overflow-hidden py-4 rounded font-black uppercase tracking-widest transition-all"
                >
                    <div className={`absolute inset-0 border transition-colors ${userData.current_chap >= 8 ? 'border-[#39FF14] bg-[#39FF14]/10' : 'border-[#00F0FF]/30 group-hover:border-[#00F0FF]'}`}></div>
                    <span
                        onClick={(e) => {
                            if (userData.current_chap >= 8) {
                                e.stopPropagation();
                                onStartGame();
                            }
                        }}
                        className={`relative z-10 ${userData.current_chap >= 8 ? 'text-[#39FF14]' : 'text-[#00F0FF]'}`}
                    >
                        {userData.current_chap >= 8 ? "Bắt đầu giải đố ngay" : "Tiếp tục hành trình"}
                    </span>
                </button>
            </div>
        </div>
    );
}
