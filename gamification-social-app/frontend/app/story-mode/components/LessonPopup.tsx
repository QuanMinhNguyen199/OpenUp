"use client";

import React from "react";

interface LessonPopupProps {
    chapterId: number;
    lesson: { title: string; content: string };
    onClose: () => void;
}

export default function LessonPopup({ chapterId, lesson, onClose }: LessonPopupProps) {
    return (
        <div className="relative z-10 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            {/* Neon Border Glow Effect */}
            <div className="absolute inset-0 bg-[#39FF14]/5 blur-2xl rounded-xl"></div>

            <div className="relative border-2 border-[#39FF14]/40 bg-black/90 p-8 md:p-10 rounded-xl backdrop-blur-sm">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39FF14] to-transparent shadow-[0_0_10px_#39FF14]"></div>

                <h2 className="text-2xl md:text-3xl font-black italic text-[#39FF14] mb-4 uppercase text-center drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
                    Đã xong Chapter {chapterId}
                </h2>

                <div className="flex flex-col items-center mb-8">
                    <p className="text-[#39FF14]/70 font-mono text-[10px] tracking-[0.3em] uppercase mb-4 italic">Mảnh ghép thu thập được:</p>
                    <div className="relative w-32 h-32 border-2 border-[#39FF14] shadow-[0_0_15px_#39FF14/30] overflow-hidden group">
                        <div
                            className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                            style={{
                                backgroundImage: "url('/puzzle.webp')",
                                backgroundSize: "300% 300%",
                                backgroundPosition: (() => {
                                    const idx = chapterId - 1;
                                    const x = (idx % 3) * 50;
                                    const y = Math.floor(idx / 3) * 50;
                                    return `${x}% ${y}%`;
                                })()
                            }}
                        />
                        <div className="absolute inset-0 border border-white/10"></div>
                    </div>
                </div>
                {/* <p className="text-center text-[#39FF14]/70 font-mono text-[10px] tracking-[0.3em] uppercase mb-8 italic">Memory Sequence Restored</p> */}

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-[#39FF14] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-6 h-[1px] bg-[#39FF14]/40"></span>
                            Bài học rút ra: {lesson.title}
                        </h3>
                        <div className="relative p-6 border border-white/5 bg-white/[0.03] rounded-lg">
                            <p className="text-lg text-gray-200 leading-relaxed italic font-medium">
                                {lesson.content}
                            </p>
                            {/* Decorative corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#39FF14]/30"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#39FF14]/30"></div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-10 w-full relative group overflow-hidden py-4 rounded font-black uppercase tracking-widest transition-all"
                >
                    <div className="absolute inset-0 border border-[#39FF14]/30 group-hover:border-[#39FF14] transition-colors"></div>
                    <div className="absolute inset-0 bg-[#39FF14]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 text-[#39FF14]">Xác nhận ghi nhớ</span>
                </button>
            </div>
        </div>
    );
}
