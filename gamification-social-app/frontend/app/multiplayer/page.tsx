"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";
import AdminWarning from "../components/AdminWarning";

interface MatchInfo {
    room_id: string;
    you: { username: string; level: number; rank: string };
    opponent: { username: string; level: number; rank: string };
}

export default function MultiplayerPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [searchTime, setSearchTime] = useState(0);
    const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token) { router.push("/"); return; }

        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/status/${userId}`, {
                    headers: { "x-token": token },
                });
                if (!res.ok) throw new Error();
                setUserData(await res.json());
                setLoading(false);
            } catch {
                localStorage.removeItem("user_id");
                localStorage.removeItem("token");
                router.push("/");
            }
        };
        fetchUser();
    }, [router]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            wsRef.current?.close();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleFindMatch = useCallback(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token) return;

        const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
            .replace("http", "ws");
        const ws = new WebSocket(`${wsUrl}/ws/multiplayer?user_id=${userId}&token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setSearching(true);
            setSearchTime(0);
            timerRef.current = setInterval(() => {
                setSearchTime(prev => {
                    if (prev >= 90) {
                        ws.close();
                        setSearching(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "match_found") {
                if (timerRef.current) clearInterval(timerRef.current);
                setSearching(false);
                setMatchInfo(data as MatchInfo);
                // store for play page
                sessionStorage.setItem("multiplayerRoom", JSON.stringify(data));
                // 3s popup then redirect
                setTimeout(() => {
                    router.push(`/multiplayer/play?room=${data.room_id}`);
                }, 3000);
            }
        };

        ws.onclose = () => {
            setSearching(false);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [router]);

    const handleCancel = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "cancel_match" }));
        }
        wsRef.current?.close();
        setSearching(false);
        setSearchTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

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
    const level = userData.level;
    const totalXp = userData.total_xp;
    const xpAtCurrentLevel = 50 * (level * level - level);
    const maxExp = 100 * level;
    const currentExp = totalXp - xpAtCurrentLevel;
    const expPercentage = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

    if (userData.role === "ADMIN") {
        return <AdminWarning modeName="Multiplayer" />;
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_3px,transparent_3px),linear-gradient(to_bottom,#80808012_3px,transparent_3px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            {/* TOP SECTION */}
            <div className="relative z-10 flex justify-between items-start p-8 md:p-10">
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
                <HomeButton />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
                <div className="max-w-3xl w-full">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none flex justify-center">
                            Multi <span className="text-[#FF6B35] drop-shadow-[0_0_20px_#FF6B35] ml-4">Player</span>
                        </h1>
                    </div>

                    {/* Rules Panel */}
                    <div className="relative p-8 md:p-10 border border-[#FF6B35]/30 bg-white/5 backdrop-blur-md rounded-br-[40px] overflow-hidden group animate-in fade-in slide-in-from-bottom-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF6B35]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-[#FF6B35]/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-black italic text-[#FF6B35] mb-6 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-[#FF6B35]"></span>
                                LUẬT CHƠI
                            </h3>

                            <div className="space-y-6">
                                <p className="text-lg md:text-xl font-medium text-gray-200 leading-relaxed italic">
                                    Thi đấu 1v1 với người chơi khác. Cả hai cùng phản hồi NPC trong 10 lượt, mỗi lượt 60 giây. Ai có tổng điểm cao hơn sẽ thắng!
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Số lượt</p>
                                        <p className="text-[#FF6B35] font-bold">10 lượt</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Thời gian/lượt</p>
                                        <p className="text-[#FF6B35] font-bold">60 giây</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Thắng</p>
                                        <p className="text-[#39FF14] font-bold">+30 XP</p>
                                    </div>
                                    <div className="border border-white/10 p-3 bg-black/40">
                                        <p className="text-gray-300 uppercase text-sm mb-1">Thua</p>
                                        <p className="text-red-500 font-bold">-10 XP</p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-300 space-y-1 mt-2">
                                    <p>• Hòa (tổng điểm {'>'} 0): cả 2 được +10 XP</p>
                                    <p>• Cả 2 không trả lời 3 lượt liên tiếp: kết thúc, cả 2 bị -10 XP</p>
                                    <p>• Cùng điểm 1 lượt: ai trả lời nhanh hơn được +5 điểm</p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-12 flex justify-center gap-6">
                                {!searching ? (
                                    <button
                                        className="relative px-12 py-5 group/btn overflow-hidden cursor-pointer"
                                        onClick={handleFindMatch}
                                    >
                                        <div className="absolute inset-0 bg-[#FF6B35] skew-x-[-15deg] translate-x-0 group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
                                        <div className="absolute inset-0 border-2 border-[#FF6B35] skew-x-[-15deg]" />
                                        <span className="relative z-10 text-2xl font-black italic tracking-tighter text-black group-hover/btn:text-[#FF6B35] transition-colors duration-300">
                                            TÌM TRẬN
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        {/* Searching animation */}
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-8 h-8">
                                                <div className="absolute inset-0 border-2 border-[#FF6B35]/30 rounded-full" />
                                                <div className="absolute inset-0 border-2 border-transparent border-t-[#FF6B35] rounded-full animate-spin" />
                                            </div>
                                            <span className="text-xl font-bold text-[#FF6B35] italic">
                                                Đang tìm đối thủ... {formatTime(searchTime)}
                                            </span>
                                        </div>
                                        <button
                                            className="relative px-10 py-4 group/btn overflow-hidden cursor-pointer"
                                            onClick={handleCancel}
                                        >
                                            <div className="absolute inset-0 bg-red-600 skew-x-[-15deg] translate-x-0 group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
                                            <div className="absolute inset-0 border-2 border-red-600 skew-x-[-15deg]" />
                                            <span className="relative z-10 text-xl font-black italic tracking-tighter text-white group-hover/btn:text-red-500 transition-colors duration-300">
                                                HỦY
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match Found Popup */}
            {matchInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-[600px] max-w-[90vw] p-8 border border-[#FF6B35]/50 bg-[#0a0a0a]/95 backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/5 to-transparent" />
                        <div className="relative z-10">
                            <h2 className="text-center text-2xl font-black italic text-[#FF6B35] mb-8 tracking-tighter uppercase">
                                Đã tìm thấy đối thủ!
                            </h2>
                            <div className="flex items-center justify-between gap-4">
                                {/* You */}
                                <div className="flex-1 text-center space-y-2 p-4 border border-[#39FF14]/30 bg-[#39FF14]/5">
                                    <p className="text-xs font-bold text-[#39FF14] uppercase tracking-widest">Bạn</p>
                                    <p className="text-2xl font-black italic text-white">{matchInfo.you.username}</p>
                                    <p className="text-sm text-gray-400">Lv.{matchInfo.you.level} • {matchInfo.you.rank}</p>
                                </div>
                                {/* VS */}
                                <div className="text-4xl font-black italic text-[#FF6B35] drop-shadow-[0_0_15px_#FF6B35] animate-pulse">
                                    VS
                                </div>
                                {/* Opponent */}
                                <div className="flex-1 text-center space-y-2 p-4 border border-[#00F0FF]/30 bg-[#00F0FF]/5">
                                    <p className="text-xs font-bold text-[#00F0FF] uppercase tracking-widest">Đối thủ</p>
                                    <p className="text-2xl font-black italic text-white">{matchInfo.opponent.username}</p>
                                    <p className="text-sm text-gray-400">Lv.{matchInfo.opponent.level} • {matchInfo.opponent.rank}</p>
                                </div>
                            </div>
                            <div className="mt-6 text-center text-sm text-gray-500 animate-pulse">
                                Đang vào trận...
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
