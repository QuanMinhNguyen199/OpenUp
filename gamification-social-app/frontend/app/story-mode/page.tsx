"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";
import AdminWarning from "../components/AdminWarning";

const CHAPTERS = [
    { id: 1, name: "Chapter 1", title: "Linh - Kẻ Lươn Lẹo" },
    { id: 2, name: "Chapter 2", title: "Bác Bảo - Cổng Trường" },
    { id: 3, name: "Chapter 3", title: "Chị Mai - Quán Cafe" },
    { id: 4, name: "Chapter 4", title: "Nam - Sân Bóng" },
    { id: 5, name: "Chapter 5", title: "Cô Hoa - Khu Chợ" },
    { id: 6, name: "Chapter 6", title: "Hoàng - Thư Viện" },
    { id: 7, name: "Chapter 7", title: "Cụ Phan - Đền Cổ" },
    { id: 8, name: "Chapter Cuối", title: "Thử Thách Giải Đố" },
];

export default function StoryModePage() {
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

    if (userData.role === "ADMIN") {
        return <AdminWarning modeName="Story Mode" />;
    }

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

    return (
        <main className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#050505] font-sans text-white pb-20">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none" />

            {/* TOP SECTION */}
            <div className="relative z-10 flex justify-between items-start p-8 md:p-10">
                {/* Top Left: Player Stats */}
                <div className="flex items-center gap-6">
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

            {/* MAIN CONTENT: Mode Intro & Map */}
            <div className="relative z-10 flex flex-col items-center justify-start mt-4 px-4">
                <div className="max-w-4xl w-full">
                    {/* Mode Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none flex justify-center">
                            Story <span className="text-[#00F0FF] drop-shadow-[0_0_20px_#00F0FF] ml-4">Mode</span>
                        </h1>
                    </div>

                    {/* Rules Box */}
                    <div className="relative p-6 md:p-8 border border-white/10 bg-white/5 backdrop-blur-md rounded-br-[40px] overflow-hidden group mb-16 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00F0FF]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-[#00F0FF]/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-black italic text-[#39FF14] mb-4 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-[#39FF14]"></span>
                                LUẬT CHƠI
                            </h3>

                            <div className="space-y-6">
                                <p className="text-lg md:text-xl font-medium text-gray-200 leading-relaxed italic">
                                    Khám phá câu chuyện qua 7 chapter. Bạn cần trò chuyện và lựa chọn phản hồi khéo léo để đạt 100 điểm tình cảm. Ở chapter cuối, một thử thách giải đố đang chờ đón bạn.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Điều kiện Thua</p>
                                        <p className="text-red-500 font-bold">Điểm về 0 hoặc liên tục hời hợt</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Điều kiện Thắng</p>
                                        <p className="text-[#39FF14] font-bold">Đạt 100 điểm</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40 col-span-2 md:col-span-1">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Phần thưởng</p>
                                        <p className="text-[#00F0FF] font-bold">+150 XP / Chapter</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHAPTER MAP */}
                    <div className="relative w-full">
                        <h2 className="text-2xl font-black italic tracking-widest text-center text-white/50 uppercase mb-12">
                            --- Bản Đồ Cốt Truyện ---
                        </h2>

                        <div className="flex flex-wrap justify-center gap-6 relative">
                            {/* Connecting lines background */}
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 z-0 hidden md:block"></div>

                            {CHAPTERS.map((chap) => {
                                const isCompleted = chap.id < userData.current_chap;
                                const isCurrent = chap.id === userData.current_chap;
                                const isLocked = chap.id > userData.current_chap;

                                let statusStyles = "";
                                let iconStyles = "";

                                if (isCompleted) {
                                    statusStyles = "border-[#39FF14]/50 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 hover:border-[#39FF14] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] cursor-pointer opacity-80";
                                    iconStyles = "text-[#39FF14]";
                                } else if (isCurrent) {
                                    statusStyles = "border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse hover:bg-[#00F0FF]/20 cursor-pointer";
                                    iconStyles = "text-[#00F0FF]";
                                } else {
                                    statusStyles = "border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed";
                                    iconStyles = "text-red-500/50";
                                }

                                return (
                                    <button
                                        key={chap.id}
                                        disabled={isLocked}
                                        onClick={() => {
                                            if (chap.id === 8) {
                                                router.push("/story-mode/boss");
                                            } else {
                                                router.push(`/story-mode/${chap.id}`);
                                            }
                                        }}
                                        className={`relative z-10 w-full md:w-[200px] p-4 flex flex-col items-center justify-center border-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${statusStyles}`}
                                    >
                                        <div className={`mb-3 w-12 h-12 flex items-center justify-center border-2 rounded-full ${isCurrent ? 'border-[#00F0FF]' : isCompleted ? 'border-[#39FF14]' : 'border-red-500/30'}`}>
                                            {isCompleted && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {isCurrent && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {isLocked && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            )}
                                        </div>
                                        <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${iconStyles}`}>
                                            {chap.name}
                                        </h4>
                                        <p className="text-sm font-medium text-white/80 text-center truncate w-full">
                                            {chap.title}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
