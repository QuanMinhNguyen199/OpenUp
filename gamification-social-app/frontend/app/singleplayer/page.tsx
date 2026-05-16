"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import HomeButton from "../components/HomeButton";
import AdminWarning from "../components/AdminWarning";

export default function SingleplayerPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'random' | 'custom'>('random');
    const [customForm, setCustomForm] = useState({
        name: '',
        relationship: '',
        location: '',
        npcGoal: '',
        userGoal: '',
        npcGender: 'Nam',
        userGender: 'Nam',
        job: '',
        personality: '',
        additionalInfo: ''
    });

    const isFormValid = customForm.name.trim() && customForm.relationship.trim() && customForm.location.trim() && customForm.npcGoal.trim() && customForm.userGoal.trim();

    const handleStartCustom = () => {
        if (!isFormValid) return;

        const trimmedData = Object.fromEntries(
            Object.entries(customForm).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        );

        sessionStorage.setItem('customPlayData', JSON.stringify(trimmedData));
        router.push('/singleplayer/play?mode=custom');
    };

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
            } catch {
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
        return <AdminWarning modeName="Single Player" />;
    }

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_3px,transparent_3px),linear-gradient(to_bottom,#80808012_3px,transparent_3px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            {/* TOP SECTION */}
            <div className="relative z-10 flex justify-between items-start p-8 md:p-10">
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
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
                <div className="max-w-3xl w-full">
                    {/* Mode Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none flex justify-center">
                            Single <span className="text-[#00F0FF] drop-shadow-[0_0_20px_#00F0FF] ml-4">Player</span>
                        </h1>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-white/10 mb-8">
                        <button
                            onClick={() => setActiveTab('random')}
                            className={`flex-1 py-4 text-center font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'random'
                                    ? 'text-[#39FF14] border-b-2 border-[#39FF14] bg-[#39FF14]/5'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Tình huống ngẫu nhiên
                        </button>
                        <button
                            onClick={() => setActiveTab('custom')}
                            className={`flex-1 py-4 text-center font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'custom'
                                    ? 'text-[#00F0FF] border-b-2 border-[#00F0FF] bg-[#00F0FF]/5'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Tình huống tùy chỉnh
                        </button>
                    </div>

                    {/* Tab Content: Random */}
                    {activeTab === 'random' && (
                        <div className="relative p-8 md:p-10 border border-white/10 bg-white/5 backdrop-blur-md rounded-br-[40px] overflow-hidden group animate-in fade-in slide-in-from-bottom-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#39FF14]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-[#39FF14]/20 transition-all duration-700" />

                            <div className="relative z-10">
                                <h3 className="text-xl font-black italic text-[#39FF14] mb-6 flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-[#39FF14]"></span>
                                    LUẬT CHƠI
                                </h3>

                                <div className="space-y-6">
                                    <p className="text-lg md:text-xl font-medium text-gray-200 leading-relaxed italic">
                                        Bạn sẽ được đặt vào 1 tình huống giao tiếp ngẫu nhiên với AI, bạn cần trả lời AI hướng tới mục tiêu ẩn để tăng điểm.
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
                                        <div className="border border-white/10 p-3 bg-black/40">
                                            <p className="text-gray-300 uppercase text-sm mb-1">Điều kiện Thua</p>
                                            <p className="text-red-500 font-bold">Điểm về 0</p>
                                        </div>
                                        <div className="border border-white/10 p-3 bg-black/40">
                                            <p className="text-gray-300 uppercase text-sm mb-1">Điều kiện Thắng</p>
                                            <p className="text-[#39FF14] font-bold">Đạt 100 điểm</p>
                                        </div>
                                        <div className="border border-white/10 p-3 bg-black/40 col-span-2 md:col-span-1">
                                            <p className="text-gray-300 uppercase text-sm mb-1">Phần thưởng</p>
                                            <p className="text-[#00F0FF] font-bold">+10 XP</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <div className="mt-12 flex justify-center">
                                    <button className="relative px-12 py-5 group/btn overflow-hidden cursor-pointer" onClick={() => router.push('/singleplayer/play')}>
                                        <div className="absolute inset-0 bg-[#39FF14] skew-x-[-15deg] translate-x-0 group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
                                        <div className="absolute inset-0 border-2 border-[#39FF14] skew-x-[-15deg]" />
                                        <span className="relative z-10 text-2xl font-black italic tracking-tighter text-black group-hover/btn:text-[#39FF14] transition-colors duration-300">
                                            BẮT ĐẦU NGAY
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Custom */}
                    {activeTab === 'custom' && (
                        <div className="relative p-8 md:p-10 border border-[#00F0FF]/30 bg-white/5 backdrop-blur-md rounded-br-[40px] overflow-hidden group animate-in fade-in slide-in-from-bottom-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00F0FF]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-[#00F0FF]/20 transition-all duration-700" />

                            <div className="relative z-10">
                                <h3 className="text-xl font-black italic text-[#00F0FF] mb-6 flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-[#00F0FF]"></span>
                                    LUẬT CHƠI
                                </h3>

                                <div className="space-y-6 mb-10">
                                    <p className="text-lg md:text-xl font-medium text-gray-200 leading-relaxed italic">
                                        Bạn sẽ tạo ra một tình huống giao tiếp tùy chỉnh. Hãy cung cấp đầy đủ thông tin để AI có thể nhập vai tốt nhất.
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
                                        <div className="border border-white/10 p-3 bg-black/40">
                                            <p className="text-gray-300 uppercase text-sm mb-1">Điều kiện Thua</p>
                                            <p className="text-red-500 font-bold">Điểm về 0</p>
                                        </div>
                                        <div className="border border-white/10 p-3 bg-black/40">
                                            <p className="text-gray-300 uppercase text-sm mb-1">Điều kiện Thắng</p>
                                            <p className="text-[#39FF14] font-bold">Đạt 100 điểm</p>
                                        </div>
                                        <div className="border border-white/10 p-3 bg-black/40 col-span-2 md:col-span-1">
                                            <p className="text-gray-300 uppercase text-sm mb-1">Phần thưởng</p>
                                            <p className="text-[#00F0FF] font-bold">+7 XP</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-white/10 mb-8" />

                                {/* Customplay Form */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Tên NPC <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={customForm.name}
                                                onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
                                                placeholder="VD: Nguyễn Văn A"
                                            />
                                        </div>
                                        {/* Gender NPC */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Giới tính NPC <span className="text-red-500">*</span></label>
                                            <select
                                                value={customForm.npcGender}
                                                onChange={(e) => setCustomForm({ ...customForm, npcGender: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors appearance-none"
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>
                                        {/* Relationship */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Mối quan hệ <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={customForm.relationship}
                                                onChange={(e) => setCustomForm({ ...customForm, relationship: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
                                                placeholder="VD: Sếp và nhân viên"
                                            />
                                        </div>
                                        {/* Location */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Địa điểm <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={customForm.location}
                                                onChange={(e) => setCustomForm({ ...customForm, location: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
                                                placeholder="VD: Quán cafe"
                                            />
                                        </div>
                                        {/* NPC Goal */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Mục tiêu của NPC <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={customForm.npcGoal}
                                                onChange={(e) => setCustomForm({ ...customForm, npcGoal: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
                                                placeholder="VD: Đòi lại số tiền đã cho vay"
                                            />
                                        </div>
                                        {/* User Gender */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Giới tính của bạn <span className="text-red-500">*</span></label>
                                            <select
                                                value={customForm.userGender}
                                                onChange={(e) => setCustomForm({ ...customForm, userGender: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors appearance-none"
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>
                                        {/* User Goal */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-widest">Mục tiêu của bạn <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={customForm.userGoal}
                                                onChange={(e) => setCustomForm({ ...customForm, userGoal: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
                                                placeholder="VD: Thuyết phục NPC cho khất nợ"
                                            />
                                        </div>

                                        {/* Optionals */}
                                        <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-white/5 space-y-6">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thông tin bổ sung (Không bắt buộc)</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nghề nghiệp NPC</label>
                                                    <input
                                                        type="text"
                                                        value={customForm.job}
                                                        onChange={(e) => setCustomForm({ ...customForm, job: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tính cách NPC</label>
                                                    <input
                                                        type="text"
                                                        value={customForm.personality}
                                                        onChange={(e) => setCustomForm({ ...customForm, personality: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ghi chú thêm</label>
                                                    <textarea
                                                        value={customForm.additionalInfo}
                                                        onChange={(e) => setCustomForm({ ...customForm, additionalInfo: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none h-24"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <div className="mt-12 flex justify-center">
                                    <button
                                        disabled={!isFormValid}
                                        onClick={handleStartCustom}
                                        className="relative px-12 py-5 group/btn overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-[#00F0FF] skew-x-[-15deg] translate-x-0 group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
                                        <div className="absolute inset-0 border-2 border-[#00F0FF] skew-x-[-15deg]" />
                                        <span className="relative z-10 text-2xl font-black italic tracking-tighter text-black group-hover/btn:text-[#00F0FF] transition-colors duration-300">
                                            BẮT ĐẦU NGAY
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
