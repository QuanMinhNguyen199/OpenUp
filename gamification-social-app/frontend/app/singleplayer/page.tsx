"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";

export default function SingleplayerPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
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

    if (loading) return <Loading />;

    // Rank Logic
    const getRank = (level: number) => {
        if (level >= 50) return "Grandmaster";
        if (level >= 30) return "Master";
        if (level >= 20) return "Expert";
        if (level >= 10) return "Advanced";
        if (level >= 5) return "Intermediate";
        return "Newbie";
    };
    const rank = getRank(userData.level);

    // EXP Logic
    const level = userData.level;
    const totalXp = userData.total_xp;
    const xpAtCurrentLevel = 50 * (level * level - level);
    const maxExp = 100 * level;
    const currentExp = totalXp - xpAtCurrentLevel;
    const expPercentage = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

    if (userData.role === "ADMIN") {
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
                        Chế độ <span className="text-white font-bold">SINGLE PLAYER</span> chỉ dành cho người chơi.
                        Tài khoản <span className="text-red-400">ADMIN</span> không được phép tham gia để đảm bảo tính công bằng.
                    </p>
                    <div className="flex justify-center">
                        <HomeButton />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            {/* TOP SECTION */}
            <div className="relative z-10 flex justify-between items-start p-8 md:p-12">
                {/* Top Left: Player Stats (Copied from Lobby) */}
                <div className="flex items-center gap-6">
                    {/* <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rotate-45 border-2 border-[#39FF14] bg-black shadow-[0_0_15px_#39FF14]" />
                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-[#39FF14] drop-shadow-[0_0_5px_#39FF14]">
                            {userData.username[0].toUpperCase()}
                        </div>
                    </div> */}

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black italic tracking-tighter text-[#00F0FF] drop-shadow-[0_0_10px_#00F0FF]">
                                {userData.username}
                            </h1>
                            <span className="bg-[#39FF14] px-3 py-0.5 text-sm font-black text-black skew-x-[-15deg]">
                                {rank.toUpperCase()}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#39FF14] uppercase tracking-widest opacity-70">Level</span>
                                <span className="text-2xl font-black text-white italic">{userData.level}</span>
                            </div>
                            <div className="h-1.5 w-48 bg-white/15 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#39FF14] to-[#00F0FF] shadow-[0_0_10px_#39FF14]" style={{ width: `${expPercentage}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Right: Home Button */}
                <HomeButton />
            </div>

            {/* MAIN CONTENT: Mode Intro */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-2xl w-full">
                    {/* Mode Header */}
                    <div className="text-center mb-12">
                        {/* <h2 className="text-sm font-bold tracking-[0.5em] text-[#39FF14] uppercase mb-2 opacity-80">Game Mode</h2> */}
                        <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none flex">
                            Single <span className="text-[#00F0FF] drop-shadow-[0_0_20px_#00F0FF]">Player</span>
                        </h1>
                    </div>

                    {/* Rules Box */}
                    <div className="relative p-8 md:p-10 border border-white/10 bg-white/5 backdrop-blur-md rounded-br-[40px] overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00F0FF]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-[#00F0FF]/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-black italic text-[#39FF14] mb-6 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-[#39FF14]"></span>
                                LUẬT CHƠI & HƯỚNG DẪN
                            </h3>

                            <div className="space-y-6">
                                <p className="text-lg md:text-xl font-medium text-gray-200 leading-relaxed italic">
                                    Bạn sẽ được đặt vào 1 tình huống giao tiếp ngẫu nhiên với AI, bạn cần trả lời AI hướng tới mục tiêu ẩn để tăng điểm.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-500 uppercase text-[10px] mb-1">Điều kiện Thua</p>
                                        <p className="text-red-500 font-bold">Điểm về 0</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-500 uppercase text-[10px] mb-1">Điều kiện Thắng</p>
                                        <p className="text-[#39FF14] font-bold">Đạt 100 điểm</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40 col-span-2 md:col-span-1">
                                        <p className="text-gray-500 uppercase text-[10px] mb-1">Phần thưởng</p>
                                        <p className="text-[#00F0FF] font-bold">+10 XP</p>
                                    </div>
                                </div>
                            </div>

                            {/* Start Button */}
                            <div className="mt-12 flex justify-center">
                                <button className="relative px-12 py-5 group/btn overflow-hidden cursor-pointer">
                                    {/* Button Background & Animation */}
                                    <div className="absolute inset-0 bg-[#39FF14] skew-x-[-15deg] translate-x-0 group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
                                    <div className="absolute inset-0 border-2 border-[#39FF14] skew-x-[-15deg]" />

                                    <span className="relative z-10 text-2xl font-black italic tracking-tighter text-black group-hover/btn:text-[#39FF14] transition-colors duration-300">
                                        BẮT ĐẦU NGAY
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Corner Element */}
            <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-20">
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#00F0FF] to-transparent" />
                <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-[#00F0FF] to-transparent" />
            </div>
        </main>
    );
}
