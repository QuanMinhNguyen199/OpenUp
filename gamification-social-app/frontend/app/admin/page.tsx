"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminStats {
    dau: number;
    mau: number;
    total_users: number;
    chart_data: { date: string; dau: number }[];
    mau_chart_data: { month: string; mau: number }[];
    error_logs: { timestamp: string; message: string; detail: string }[];
}

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "ADMIN") {
            router.push("/lobby");
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/stats?month=${selectedMonth}&year=${selectedYear}`, {
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
    }, [router, selectedMonth, selectedYear]);

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/logout`, {
                    method: "POST",
                    headers: { "x-token": token },
                });
            } catch (error) {
                console.error("Logout error:", error);
            }
        }
        localStorage.clear();
        router.push("/");
    };

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
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Hệ thống quản trị</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group relative flex items-center justify-center p-3 border border-red-500/30 bg-black/40 hover:bg-red-500/10 transition-all duration-300 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-red-500"
                    >
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-red-500"></div>
                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-red-500"></div>
                        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-red-500"></div>
                        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-red-500"></div>

                        <div className="flex flex-col items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span className="h-0 overflow-hidden group-hover:h-4 group-hover:mt-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all duration-300">
                                ĐĂNG XUẤT
                            </span>
                        </div>
                    </button>
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

                    {/* Charts */}
                    <div className="flex flex-col gap-6">
                        {/* DAU Chart */}
                        <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-lg space-y-4 flex-grow">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#39FF14]">DAU Trend</h2>
                                <select 
                                    className="bg-black/50 border border-white/20 text-white text-xs p-1 rounded font-mono focus:outline-none focus:border-[#39FF14]"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                >
                                    {Array.from({length: 12}, (_, i) => (
                                        <option key={i+1} value={i+1}>Tháng {i+1}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="h-[200px] w-full">
                                {stats?.chart_data && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.chart_data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                                            <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #39FF1450', borderRadius: '8px' }}
                                                itemStyle={{ color: '#39FF14', fontWeight: 'bold' }}
                                            />
                                            <Line type="monotone" dataKey="dau" stroke="#39FF14" strokeWidth={2} dot={{ r: 3, fill: '#39FF14' }} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* MAU Chart */}
                        <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-lg space-y-4 flex-grow">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#00F0FF]">MAU Trend</h2>
                                <select 
                                    className="bg-black/50 border border-white/20 text-white text-xs p-1 rounded font-mono focus:outline-none focus:border-[#00F0FF]"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                                </select>
                            </div>
                            <div className="h-[200px] w-full">
                                {stats?.mau_chart_data && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.mau_chart_data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="month" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                                            <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #00F0FF50', borderRadius: '8px' }}
                                                itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                                            />
                                            <Line type="step" dataKey="mau" stroke="#00F0FF" strokeWidth={2} dot={{ r: 3, fill: '#00F0FF' }} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 rounded-lg flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black italic uppercase text-white">Langfuse Tracing</h2>
                                <p className="text-gray-400 text-xs mt-1">Theo dõi hội thoại & chi phí token</p>
                            </div>
                            <a
                                href="https://cloud.langfuse.com/project/cmp6a5fis073had0710m5vfox"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-[#00F0FF] text-black font-black italic uppercase tracking-tighter hover:bg-[#00F0FF]/80 transition-all text-sm"
                            >
                                Mở Console
                            </a>
                        </div>
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
