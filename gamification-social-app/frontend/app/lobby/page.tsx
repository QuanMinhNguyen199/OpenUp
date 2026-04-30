"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            localStorage.removeItem("user_id");
            localStorage.removeItem("token");
            router.push("/");
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/status/${userId}`, {
                    headers: {
                        "x-token": token,
                    },
                });

                if (!res.ok) {
                    throw new Error("Invalid token");
                }

                const data = await res.json();
                setUserData(data);
                setLoading(false);
            } catch (error) {
                localStorage.removeItem("user_id");
                localStorage.removeItem("token");
                router.push("/");
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        router.push("/");
    };

    if (loading) {
        return (
            <main className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center font-sans text-white">
                <div className="animate-pulse text-[#39FF14] text-xl font-bold tracking-widest">LOADING NEURAL LINK...</div>
            </main>
        );
    }

    if (userData?.role === "ADMIN") {
        return (
            <main className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-sans text-white">
                <div className="text-[#00F0FF] text-3xl font-black italic tracking-widest drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
                    Hãy dùng tài khoản player
                </div>
                <button onClick={handleLogout} className="mt-8 text-[#39FF14] underline hover:text-[#00F0FF] transition-colors">
                    Đăng xuất
                </button>
            </main>
        );
    }

    const menuItems = [
        { name: "Story Mode", desc: "Hành trình khởi đầu", color: "from-[#39FF14]" },
        { name: "Singleplayer", desc: "Huấn luyện chuyên sâu", color: "from-[#00F0FF]" },
        { name: "Multiplayer", desc: "Đấu trường thực tế", color: "from-[#39FF14]" },
    ];

    // Calc XP progress based on new quadratic rules
    const level = userData.level;
    const totalXp = userData.total_xp;
    const xpAtCurrentLevel = 50 * (level * level - level);
    const maxExp = 100 * level;
    const currentExp = totalXp - xpAtCurrentLevel;
    const expPercentage = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

    // Derive rank title from level
    const getRank = (level: number) => {
        if (level >= 50) return "Grandmaster";
        if (level >= 30) return "Master";
        if (level >= 20) return "Expert";
        if (level >= 10) return "Advanced";
        if (level >= 5) return "Intermediate";
        return "Newbie";
    };
    const rank = getRank(userData.level);

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
            {/* --- LỚP NỀN (BACKGROUND) --- */}
            {/* Lưới tọa độ Cyber */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Hiệu ứng Scanline (Vạch nhiễu màn hình) */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            {/* Hologram Cầu ở trung tâm */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
                <div className="relative h-[500px] w-[500px]">
                    <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed border-cyan-500/40" />
                    <div className="absolute inset-10 animate-[spin_15s_linear_infinite_reverse] rounded-full border border-green-500/30" />
                    <div className="absolute inset-20 animate-pulse rounded-full bg-cyan-500/5 blur-[100px]" />
                </div>
            </div>

            {/* --- GIAO DIỆN CHÍNH (UI) --- */}
            <div className="relative z-10 flex h-screen flex-col justify-between p-10">

                {/* TOP: Player Info */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
                                    {userData.username}
                                </h1>
                                <span className="skew-x-[-10deg] bg-gradient-to-r from-[#39FF14] to-[#00F0FF] px-3 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
                                    {rank}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4">
                                <span className="text-sm font-bold text-[#39FF14]">Level {userData.level}</span>
                                <div className="group relative h-3 w-64 border border-white/20 bg-black/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#39FF14] to-[#00F0FF] shadow-[0_0_15px_#39FF14] transition-all duration-1000"
                                        style={{ width: `${expPercentage}%` }}
                                    />
                                    {/* Tooltip EXP */}
                                    <span className="absolute -top-6 right-0 text-[10px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                                        {currentExp} / {maxExp} XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Player Stats */}
                    <div className="hidden md:flex gap-4">
                        <div className="border-r-2 border-[#39FF14] bg-white/5 px-4 py-2 text-right">
                            <p className="text-sm uppercase text-gray-400">Rank</p>
                            <p className="font-mono text-xl font-bold text-[#39FF14]">{rank}</p>
                        </div>
                        <div className="border-r-2 border-[#00F0FF] bg-white/5 px-4 py-2 text-right">
                            <p className="text-sm uppercase text-gray-400">Tổng XP</p>
                            <p className="font-mono text-xl font-bold text-[#00F0FF]">{userData.total_xp}</p>
                        </div>
                    </div>
                </div>

                {/* MIDDLE: Main Menu (Right Aligned) */}
                <div className="flex flex-col items-end gap-8 pr-10">
                    {menuItems.map((item, idx) => (
                        <button key={idx} className="group relative text-right transition-transform hover:scale-110 cursor-pointer">
                            <span className="block text-sm font-bold uppercase tracking-[0.3em] text-[#39FF14] opacity-80">
                                {item.desc}
                            </span>
                            <span className={`relative text-6xl font-black uppercase italic leading-none transition-colors group-hover:text-[#00F0FF]`}>
                                {item.name}
                            </span>
                            {/* Decorative line */}
                            <div className="mt-2 h-[2px] w-0 bg-gradient-to-l from-[#00F0FF] to-transparent transition-all duration-500 group-hover:w-full shadow-[0_0_10px_#00F0FF]" />
                        </button>
                    ))}
                </div>

                {/* BOTTOM BAR: Systems */}
                <div className="flex items-end justify-between border-t border-white/10 pt-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-mono text-[#39FF14]/60 uppercase tracking-widest">
                            &gt; Player_Level: {userData.level} | XP: {userData.total_xp}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                            &gt; Rank: {rank} | Story_Progress: Chapter {userData.current_chap}/9
                        </p>
                    </div>

                    <div className="flex gap-10">
                        <button className="group flex flex-col items-center gap-1 cursor-pointer">
                            <span className="h-1 w-12 bg-gray-700 transition-colors group-hover:bg-[#39FF14]" />
                            <span className="text-base font-bold italic tracking-tighter text-gray-400 group-hover:text-white">CÀI ĐẶT</span>
                        </button>
                        <button onClick={handleLogout} className="group flex flex-col items-center gap-1 cursor-pointer">
                            <span className="h-1 w-12 bg-gray-700 transition-colors group-hover:bg-red-500" />
                            <span className="text-base font-bold italic tracking-tighter text-gray-400 group-hover:text-white">ĐĂNG XUẤT</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute bottom-0 left-0 h-32 w-32 border-b-4 border-l-4 border-[#39FF14]/20 p-2 opacity-50">
                <div className="h-full w-full border-b border-l border-[#00F0FF]/30" />
            </div>
        </main>
    );
}



// 'use client';

// export default function LobbyPage() {
//     return (
//         <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden p-8 cyber-grid">

//             {/* 1. Top Section: Player Info */}
//             <div className="relative z-10 flex items-center gap-4">
//                 {/* Avatar vát góc */}
//                 <div className="h-16 w-16 bg-gradient-to-br from-[#39FF14] to-[#00F0FF] [clip-path:polygon(25%_0%,_100%_0%,_75%_100%,_0%_100%)] p-[2px]">
//                     <div className="h-full w-full bg-black [clip-path:polygon(25%_0%,_100%_0%,_75%_100%,_0%_100%)] flex items-center justify-center font-black text-cyan-400">
//                         OP
//                     </div>
//                 </div>

//                 <div>
//                     <h2 className="text-2xl font-black italic tracking-tighter text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
//                         CYBER_USER_01
//                     </h2>
//                     <div className="flex items-center gap-3">
//                         <span className="bg-[#39FF14] px-2 text-xs font-bold text-black uppercase">Lv. 15</span>
//                         {/* Thanh EXP */}
//                         <div className="h-2 w-48 bg-gray-800 rounded-full overflow-hidden border border-white/10">
//                             <div className="h-full bg-gradient-to-r from-[#39FF14] to-[#00e6ff] shadow-[0_0_10px_#39FF14]" style={{ width: '65%' }}></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* 2. Center: Decor (Hologram Effect) */}
//             <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
//                 <div className="w-[500px] h-[500px] border border-cyan-500/30 rounded-full animate-spin-slow flex items-center justify-center">
//                     <div className="w-[400px] h-[400px] border border-[#39FF14]/20 rounded-full animate-reverse-spin"></div>
//                 </div>
//             </div>

//             {/* 3. Right: Main Menu */}
//             <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-end">
//                 {[
//                     { name: "Story Mode", desc: "Khám phá thế giới AI" },
//                     { name: "Single Player", desc: "Luyện tập 1-1" },
//                     { name: "Multiplayer", desc: "Thách đấu cộng đồng" }
//                 ].map((item, index) => (
//                     <button key={index} className="group relative text-right">
//                         <div className="relative z-10 pr-4 transition-all group-hover:pr-8">
//                             <span className="block text-xs uppercase text-[#39FF14] font-bold tracking-widest">{item.desc}</span>
//                             <span className="text-4xl font-black uppercase italic group-hover:text-[#00F0FF] transition-colors">
//                                 {item.name}
//                             </span>
//                         </div>
//                         {/* Thanh gạch dưới khi hover */}
//                         <div className="absolute bottom-0 right-0 h-[2px] w-0 bg-[#00F0FF] transition-all group-hover:w-full shadow-[0_0_10px_#00F0FF]"></div>
//                     </button>
//                 ))}
//             </div>

//             {/* 4. Bottom Bar */}
//             <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end border-t border-white/10 pt-4">
//                 <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
//                     System Status: <span className="text-green-500 animate-pulse">Operational</span>
//                 </div>
//                 <div className="flex gap-4">
//                     <button className="text-xs font-bold hover:text-[#39FF14] transition-colors italic">// SETTINGS</button>
//                     <button className="text-xs font-bold hover:text-red-500 transition-colors italic">// LOGOUT</button>
//                 </div>
//             </div>

//             <style jsx>{`
//         .animate-spin-slow { animation: spin 20s linear infinite; }
//         .animate-reverse-spin { animation: spin-reverse 15s linear infinite; }
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
//       `}</style>
//         </div>
//     );
// }