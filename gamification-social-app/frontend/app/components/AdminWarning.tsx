"use client";

import React from "react";
import HomeButton from "./HomeButton";

interface AdminWarningProps {
    modeName: string;
    onLogout?: () => void;
}

const AdminWarning = ({ modeName, onLogout }: AdminWarningProps) => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
            <div className="relative text-center p-12 border border-red-500/30 bg-red-500/5 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] max-w-md mx-4">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500"></div>

                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-4xl font-black text-red-500 mb-4 tracking-tighter italic uppercase">Truy cập bị chặn</h1>
                <p className="text-gray-400 mb-8 font-mono text-sm leading-relaxed">
                    Khu vực <span className="text-white font-bold uppercase">{modeName}</span> chỉ dành cho người chơi.
                    Tài khoản <span className="text-red-400">ADMIN</span> không được phép tham gia để đảm bảo tính công bằng.
                </p>
                <div className="flex justify-center items-center gap-4">
                    {onLogout ? (
                        <button 
                            onClick={onLogout}
                            className="group relative px-8 py-3 border border-red-500/50 bg-red-500/5 text-red-500 hover:bg-red-500/20 transition-all rounded-lg font-bold uppercase text-xs tracking-[0.2em] shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <HomeButton />
                    )}
                </div>
            </div>
        </main>
    );
};

export default AdminWarning;
