"use client";

import React from "react";

interface StoryCompletedPopupProps {
    onClose: () => void;
}

export default function StoryCompletedPopup({ onClose }: StoryCompletedPopupProps) {
    return (
        <div className="relative z-10 w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="absolute inset-0 bg-[#39FF14]/10 blur-2xl rounded-3xl" />

            <div className="relative border-2 border-[#39FF14]/40 bg-black/95 p-6 md:p-8 rounded-3xl backdrop-blur-sm flex flex-col items-center gap-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39FF14] to-transparent shadow-[0_0_12px_#39FF14]" />

                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-black italic text-[#39FF14] uppercase drop-shadow-[0_0_10px_rgba(57,255,20,0.65)]">
                        Đã hoàn thành Story mode
                    </h2>
                    <p className="text-sm text-white/60 mt-2">
                        Giờ bạn có thể quay về và xem lại phần thử thách cuối cùng.
                    </p>
                </div>

                <div className="relative w-full aspect-square overflow-hidden rounded-[28px] border-2 border-[#39FF14]/30 shadow-[0_0_40px_rgba(57,255,20,0.18)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/puzzle.webp"
                        alt="Full completed story image"
                        className="w-full h-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-[#39FF14]/40 animate-pulse" />
                </div>

                <p className="text-sm text-white/70 text-center leading-relaxed">
                    Chúc mừng! Bạn đã giải xong thử thách cuối cùng và hoàn tất hành trình Story Mode.
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] font-black uppercase tracking-[0.2em] hover:bg-[#39FF14]/15 transition-all"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}
