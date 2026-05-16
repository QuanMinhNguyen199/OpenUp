"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";

interface LeaderboardEntry {
    id: number;
    rank: number;
    username: string;
    total_xp: number;
    level: number;
    rank_title: string;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
    const [myId, setMyId] = useState<number>(-1);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token) { router.push("/"); return; }
        
        const parsedId = parseInt(userId);
        setMyId(parsedId);

        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leaderboard`);
                const data = await res.json();
                setEntries(data);

                // Find my rank
                const me = data.find((e: any) => e.id === parsedId);
                if (me) setMyRank(me);

                setLoading(false);
            } catch (error) {
                console.error("Leaderboard fetch error:", error);
            }
        };
        fetchLeaderboard();
    }, [router]);

    if (loading) return <Loading />;

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_3px,transparent_3px),linear-gradient(to_bottom,#80808012_3px,transparent_3px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            <div className="relative z-10 p-8 md:p-12 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase text-[#39FF14] drop-shadow-[0_0_20px_#39FF14]">
                            Leader <span className="text-white">board</span>
                        </h1>
                        <p className="text-xs font-bold text-[#00F0FF] uppercase tracking-[0.3em] opacity-70">
                            Xếp hạng hệ thống
                        </p>
                    </div>
                    <HomeButton />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Leaderboard Table */}
                    <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl p-1 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent opacity-50" />

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 font-black italic uppercase tracking-widest text-[10px] text-[#00F0FF]">
                                    <th className="px-6 py-4">STT</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Level</th>
                                    <th className="px-6 py-4 text-right">Total XP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry) => (
                                    <tr
                                        key={entry.rank}
                                        className={`group hover:bg-white/5 transition-colors ${entry.id === myId ? "bg-[#39FF14]/20 border-l-4 border-l-[#39FF14]" : ""}`}
                                    >
                                        <td className="px-6 py-5">
                                            <span className={`text-xl font-black italic ${entry.rank === 1 ? "text-yellow-400" :
                                                    entry.rank === 2 ? "text-gray-300" :
                                                        entry.rank === 3 ? "text-orange-500" : "text-gray-500"
                                                }`}>
                                                #{entry.rank.toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 flex items-center justify-center font-black text-xs border ${entry.rank <= 3 ? "border-[#39FF14] text-[#39FF14]" : "border-white/20 text-white"}`}>
                                                    {entry.username[0].toUpperCase()}
                                                </div>
                                                <span className="font-bold text-lg">{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00F0FF]">
                                                {entry.rank_title}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-gray-400">LV.{entry.level}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-xl font-black italic text-[#39FF14] drop-shadow-[0_0_10px_#39FF14]">
                                                {entry.total_xp.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
