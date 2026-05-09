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

const LESSONS: Record<number, string> = {
    1: "Học cách từ chối khéo léo những yêu cầu vô lý và sẵn sàng giúp đỡ khi có lý do chính đáng. Sự cả nể không đúng chỗ sẽ làm hại bản thân.",
    2: "Tôn trọng nguyên tắc và quy định. Đối mặt với người thi hành công vụ cần sự thành thật, lễ phép và kiên nhẫn giải thích thay vì chống đối hoặc dùng tiền bạc.",
    3: "Lắng nghe là một nghệ thuật. Khi người khác mang tâm trạng tiêu cực, một cái gật đầu chân thành và lời khuyên bình tĩnh có sức mạnh to lớn hơn vạn lời trách móc.",
    4: "Trong tập thể, lỗi lầm không quan trọng bằng cách chúng ta cùng nhau khắc phục nó. Sự khích lệ và đồng cảm sẽ gắn kết đồng đội vượt qua lúc khó khăn.",
    5: "Đừng vô cảm trước nỗi vất vả của người lao động. Một hành động giúp đỡ nhỏ nhoi hay sự trung thực trả lại tiền thừa đều gieo mầm cho những giá trị tử tế trong xã hội.",
    6: "Sự tập trung của mỗi người đều đáng quý. Biết nhận lỗi khi làm ồn và chủ động giúp đỡ người khác là biểu hiện của một văn hóa ứng xử văn minh.",
    7: "Trí tuệ thực sự không chỉ nằm ở kiến thức mà còn ở cách ta đối nhân xử thế. Lựa chọn sự thật dù khó khăn và chăm chỉ từ những việc nhỏ bé nhất là cốt lõi của đạo làm người."
};

export default function StoryModePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [popupOpen, setPopupOpen] = useState<'lesson' | 'puzzle' | null>(null);
    const [selectedChapId, setSelectedChapId] = useState<number | null>(null);

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
                        <h2 className="text-2xl font-black italic tracking-widest text-center text-white/80 uppercase mb-12">
                            --- Bản Đồ Cốt Truyện ---
                        </h2>

                        <div className="flex flex-wrap justify-center gap-6 relative">
                            {/* Connecting lines background */}
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 z-0 hidden md:block"></div>

                            {CHAPTERS.map((chap) => {
                                const isCompleted = chap.id < userData.current_chap;
                                const isCurrent = chap.id === userData.current_chap;
                                const isLocked = chap.id > userData.current_chap;
                                const isBoss = chap.id === 8;

                                let statusStyles = "";
                                let iconStyles = "";
                                let displayTitle = chap.title;

                                if (isCompleted) {
                                    statusStyles = "border-[#39FF14]/50 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 hover:border-[#39FF14] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] cursor-pointer opacity-80";
                                    iconStyles = "text-[#39FF14]";
                                    displayTitle = "Bài học rút ra";
                                } else if (isCurrent) {
                                    statusStyles = "border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse hover:bg-[#00F0FF]/20 cursor-pointer";
                                    iconStyles = "text-[#00F0FF]";
                                    displayTitle = "???";
                                } else {
                                    if (isBoss) {
                                        statusStyles = "border-red-500/80 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer hover:bg-red-500/30 hover:scale-105 opacity-90 animate-pulse";
                                        iconStyles = "text-red-500";
                                    } else {
                                        statusStyles = "border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed";
                                        iconStyles = "text-red-500/50";
                                        displayTitle = "???";
                                    }
                                }

                                return (
                                    <button
                                        key={chap.id}
                                        disabled={isLocked && !isBoss}
                                        onClick={() => {
                                            if (isBoss) {
                                                setSelectedChapId(8);
                                                setPopupOpen('puzzle');
                                            } else if (isCompleted) {
                                                setSelectedChapId(chap.id);
                                                setPopupOpen('lesson');
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
                                            {displayTitle}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* POPUPS */}
            {popupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    {/* Close Area */}
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setPopupOpen(null)}></div>
                    
                    {/* Lesson Popup */}
                    {popupOpen === 'lesson' && selectedChapId && (
                        <div className="relative z-10 w-full max-w-lg border-2 border-[#39FF14] bg-black p-8 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                            <h2 className="text-2xl md:text-3xl font-black italic text-[#39FF14] mb-2 uppercase text-center drop-shadow-[0_0_5px_#39FF14]">
                                Bạn đã vượt qua Chapter {selectedChapId}
                            </h2>
                            <div className="w-full h-[2px] bg-[#39FF14]/30 my-4" />
                            <h3 className="text-xl font-bold text-white mb-4">Bài học rút ra:</h3>
                            <p className="text-lg text-gray-300 leading-relaxed italic">
                                {LESSONS[selectedChapId]}
                            </p>
                            <button 
                                onClick={() => setPopupOpen(null)}
                                className="mt-8 w-full border border-[#39FF14]/50 hover:bg-[#39FF14]/20 text-[#39FF14] py-3 font-bold uppercase tracking-widest transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    )}

                    {/* Puzzle Popup */}
                    {popupOpen === 'puzzle' && (
                        <div className="relative z-10 w-full max-w-2xl border-2 border-[#00F0FF] bg-black p-6 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                            <h2 className="text-2xl font-black italic text-[#00F0FF] mb-6 uppercase text-center drop-shadow-[0_0_5px_#00F0FF]">
                                Bản Đồ Mảnh Ghép
                            </h2>
                            <p className="text-center text-sm text-gray-400 mb-6">
                                Hoàn thành các Chapter để thắp sáng các mảnh ghép tương ứng.
                            </p>

                            <div className="relative w-full aspect-square md:aspect-video bg-[#111] overflow-hidden border border-white/20">
                                {/* The Background Image */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center opacity-80"
                                    style={{ backgroundImage: "url('/puzzle.png')" }}
                                />
                                
                                {/* The 3x3 Grid Overlay */}
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10">
                                    {[...Array(9)].map((_, i) => {
                                        const cellIndex = i + 1;
                                        // Cells 8 & 9 are completely black
                                        if (cellIndex === 8 || cellIndex === 9) {
                                            return <div key={i} className="border border-white/10 bg-black/95"></div>;
                                        }
                                        
                                        // Cells 1-7: if passed, fully transparent (reveals background). If not, dark overlay.
                                        const isPassed = cellIndex < userData.current_chap;
                                        return (
                                            <div 
                                                key={i} 
                                                className={`border border-white/10 transition-all duration-500 ${isPassed ? 'bg-transparent shadow-[inset_0_0_20px_rgba(57,255,20,0.3)] border-[#39FF14]/50' : 'bg-black/90 backdrop-blur-sm'}`}
                                            >
                                                {!isPassed && (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-white/20 font-mono text-2xl font-bold">{cellIndex}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setPopupOpen(null);
                                    // If actually unlocked, they can also go to the real game
                                    if (userData.current_chap >= 8) {
                                        router.push("/story-mode/boss");
                                    }
                                }}
                                className="mt-8 w-full border border-[#00F0FF]/50 hover:bg-[#00F0FF]/20 text-[#00F0FF] py-3 font-bold uppercase tracking-widest transition-all"
                            >
                                {userData.current_chap >= 8 ? "Bắt đầu ghép hình" : "Đóng"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
