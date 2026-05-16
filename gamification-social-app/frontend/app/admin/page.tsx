"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";

interface AdminStats {
    dau: number;
    mau: number;
    total_users: number;
    error_logs: { timestamp: string; message: string; detail: string }[];
}

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token || role !== "ADMIN") {
            router.push("/lobby");
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/stats`, {
                    headers: { "x-token": token }
                });
                if (!res.ok) throw new Error();
                setStats(await res.json());
                setLoading(false);
            } catch (error) {
                console.error("Admin stats fetch error:", error);
                router.push("/lobby");
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Auto refresh every 30s
        return () => clearInterval(interval);
    }, [router]);

    if (loading) return <Loading />;

    return (
        <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white font-sans p-8 md:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            <div className="relative z-10 max-w-7xl mx-auto space-y-12">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            Admin <span className="text-white">Dashboard</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Hệ thống quản trị tối cao</p>
                    </div>
                    <HomeButton />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Daily Active Users" value={stats?.dau || 0} color="text-[#39FF14]" />
                    <StatCard title="Monthly Active Users" value={stats?.mau || 0} color="text-[#00F0FF]" />
                    <StatCard title="Total Registered" value={stats?.total_users || 0} color="text-yellow-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Error Logs */}
                    <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-lg space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-red-400">System Logs</h2>
                            <span className="text-[10px] font-mono text-gray-500">LAST 100 ERRORS</span>
                        </div>
                        <div className="h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-red-500/20">
                            {stats?.error_logs.length === 0 ? (
                                <p className="text-center text-gray-600 italic py-10">Hệ thống đang hoạt động ổn định...</p>
                            ) : (
                                stats?.error_logs.map((log, i) => (
                                    <div key={i} className="p-3 bg-red-500/5 border-l-2 border-red-500 text-xs font-mono">
                                        <div className="flex justify-between text-red-400/70 mb-1">
                                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-gray-200 font-bold">{log.message}</p>
                                        <p className="text-gray-500 mt-1">{log.detail}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Langfuse Trace Link */}
                    <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-lg space-y-6 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-[#00F0FF]/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black italic uppercase text-white">Langfuse Tracing</h2>
                        <p className="text-gray-400 text-sm max-w-sm">
                            Theo dõi chi tiết các cuộc hội thoại AI, chi phí token và độ trễ phản hồi thời gian thực.
                        </p>
                        <a 
                            href="https://cloud.langfuse.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-[#00F0FF] text-black font-black italic uppercase tracking-tighter hover:bg-[#00F0FF]/80 transition-all"
                        >
                            Mở Langfuse Console
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
    return (
        <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-lg relative overflow-hidden group">
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${color.replace('text', 'bg')}`} />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
            <p className={`text-5xl font-black italic ${color}`}>{value.toLocaleString()}</p>
        </div>
    );
}
