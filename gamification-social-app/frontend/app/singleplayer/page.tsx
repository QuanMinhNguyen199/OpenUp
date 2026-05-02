"use client";

import React from "react";

const LoadingScreen = () => {
    const quotes = [
        "Ăn có nhai, nói có nghĩ",
        "Họa từ miệng mà ra",
        "Cái miệng hại cái thân",
        "Lưỡi không xương, trăm đường lắt léo",
        "Uốn lưỡi bảy lần trước khi nói",
        "Lưỡi sắc hơn gươm",
    ];

    return (
        <div className="relative flex h-screen w-full flex-col justify-center overflow-hidden bg-[#050505] font-sans text-white">
            {/* 1. Các dòng chữ chạy nền (Background Stream) */}
            <div className="absolute inset-0 flex flex-col justify-around opacity-20 pointer-events-none">
                {quotes.map((quote, index) => (
                    <div
                        key={index}
                        className={`flex whitespace-nowrap text-2xl font-bold italic uppercase tracking-widest ${index % 2 === 0 ? "animate-slide-left" : "animate-slide-right"
                            }`}
                    >
                        {/* Lặp lại chuỗi để tạo hiệu ứng chạy vô tận */}
                        {Array(10).fill(quote).map((q, i) => (
                            <span key={i} className="mx-8 text-[#39FF14] drop-shadow-[0_0_5px_#39FF14]">
                                {q}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* 2. Chữ LOADING ở trung tâm */}
            <div className="relative z-10 flex flex-col items-center">
                <h1 className="text-6xl font-black italic tracking-tighter text-[#00F0FF] drop-shadow-[0_0_20px_#00F0FF] animate-pulse">
                    LOADING
                </h1>
                {/* Thanh progress bar nhỏ phía dưới (Tùy chọn) */}
                <div className="mt-4 h-1 w-48 overflow-hidden bg-gray-800">
                    <div className="h-full bg-[#00F0FF] animate-progress-load"></div>
                </div>
            </div>

            {/* 3. Hiệu ứng nhiễu (Vignette & Scanlines) */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_90%)]"></div>

            <style jsx>{`
        @keyframes slide-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes slide-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes progress-load {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-slide-left {
          animation: slide-left 30s linear infinite;
        }
        .animate-slide-right {
          animation: slide-right 30s linear infinite;
        }
        .animate-progress-load {
          animation: progress-load 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;