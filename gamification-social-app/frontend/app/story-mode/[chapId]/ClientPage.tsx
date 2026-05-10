"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import HomeButton from "../../components/HomeButton";
import AdminWarning from "../../components/AdminWarning";
import LessonPopup from "../components/LessonPopup";
import BossPuzzle from "../components/BossPuzzle";
import { CHAPTERS, LESSONS } from "../constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------- Types ----------
interface NpcOption {
    option: string;
    quantity: number;
}

interface NpcDialogData {
    npc_behavior: string;
    npc_say: string;
    event?: string;
    options: NpcOption[];
}

interface HistoryItem {
    role: string;
    content: string;
}

type NpcEmotion = "normal" | "happy" | "angry";

// ---------- Helpers ----------
function determineEmotion(chosenQuantity: number, allOptions: NpcOption[]): NpcEmotion {
    const sorted = [...allOptions].map(o => o.quantity).sort((a, b) => b - a);
    if (chosenQuantity === sorted[0]) return "happy";
    if (chosenQuantity === sorted[sorted.length - 1]) return "angry";
    return "normal";
}

function shuffleOptions(options: NpcOption[]): NpcOption[] {
    return [...options].sort(() => Math.random() - 0.5);
}

// ========== COMPONENT ==========

export default function ClientChapterPage({ chapIdStr }: { chapIdStr: string }) {
    const chapId = parseInt(chapIdStr, 10);
    const router = useRouter();

    // Auth & user state
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Game state
    const [npcData, setNpcData] = useState<NpcDialogData | null>(null);
    const [npcEmotion, setNpcEmotion] = useState<NpcEmotion>("normal");
    const [affinity, setAffinity] = useState(20);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [optionLocked, setOptionLocked] = useState(false);

    // Result state
    const [resultPopup, setResultPopup] = useState<"win" | "lose" | null>(null);
    const [resultMessage, setResultMessage] = useState("");

    // Chapter metadata
    const chapter = CHAPTERS.find(c => c.id === chapId);

    // ---------- Auth ----------
    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            router.push("/");
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/user/status/${userId}`, {
                    headers: { "x-token": token },
                });
                if (!res.ok) throw new Error("Invalid token");
                const data = await res.json();
                setUserData(data);

                // Check: chapter must be unlocked and valid (1-8)
                if (chapId < 1 || chapId > 8 || chapId > data.current_chap) {
                    router.push("/story-mode");
                    return;
                }

                setLoading(false);
            } catch {
                localStorage.removeItem("user_id");
                localStorage.removeItem("token");
                router.push("/");
            }
        };
        fetchUser();
    }, [router, chapId]);

    // ---------- Fetch NPC Dialog ----------
    const fetchDialog = useCallback(async (currentHistory: HistoryItem[]) => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token) return;

        setIsThinking(true);
        setOptionLocked(true);

        try {
            const shouldEvent = Math.random() < 0.3;
            const randomCase = Math.floor(Math.random() * 2);

            const res = await fetch(`${API_URL}/story_mode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-token": token,
                },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    index: chapId - 1, // Backend uses 0-based index
                    event: shouldEvent,
                    case: randomCase,
                    history: currentHistory,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Lỗi khi tải kịch bản");
            }

            const data: NpcDialogData = await res.json();
            if (data.options) {
                data.options = shuffleOptions(data.options);
            }
            setNpcData(data);
            setOptionLocked(false);
        } catch (error: any) {
            console.error("Story mode fetch error:", error);
            // Fallback
            setNpcData({
                npc_behavior: "đang suy nghĩ",
                npc_say: "Có gì đó không ổn... bạn thử lại nhé?",
                options: [
                    { option: "Thử lại", quantity: 0 },
                    { option: "Nói lại lần nữa", quantity: 0 },
                    { option: "Chờ đợi", quantity: 0 },
                ],
            });
            setOptionLocked(false);
        } finally {
            setIsThinking(false);
        }
    }, [chapId]);

    // ---------- Initial Load ----------
    useEffect(() => {
        if (!loading && userData && chapId !== 8) {
            fetchDialog([]);
        }
    }, [loading, userData, fetchDialog, chapId]);

    // ---------- Choose Option ----------
    const handleChooseOption = async (option: NpcOption) => {
        if (optionLocked || !npcData) return;
        setOptionLocked(true);

        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token) return;

        // Determine emotion from choice
        const emotion = determineEmotion(option.quantity, npcData.options);
        setNpcEmotion(emotion);

        try {
            // Call choose-option (query params)
            const params = new URLSearchParams({
                npc_id: chapId.toString(),
                score_change: option.quantity.toString(),
                user_id: userId,
            });

            const res = await fetch(`${API_URL}/game/choose-option?${params}`, {
                method: "POST",
                headers: { "x-token": token },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Lỗi chọn đáp án");
            }

            const result = await res.json();
            setAffinity(Math.round(result.new_affinity));

            if (result.is_chapter_completed) {
                setResultMessage(result.message);
                setResultPopup("win");
                return;
            }

            if (result.is_failed) {
                setResultMessage(result.message);
                setResultPopup("lose");
                setAffinity(20); // Reset
                return;
            }

            // Continue: push to history and fetch next dialog
            const newHistory: HistoryItem[] = [
                ...history,
                { role: "assistant", content: npcData.npc_say },
                { role: "user", content: option.option },
            ];
            setHistory(newHistory);

            // Small delay then fetch next
            await fetchDialog(newHistory);

        } catch (error: any) {
            console.error("Choose option error:", error);
            setOptionLocked(false);
        }
    };

    // ---------- Retry after failure ----------
    const handleRetry = () => {
        setResultPopup(null);
        setHistory([]);
        setNpcEmotion("normal");
        setAffinity(20);
        setNpcData(null);
        fetchDialog([]);
    };

    // ---------- Render guards ----------
    if (loading) return <Loading />;
    if (!chapter || chapId < 1 || chapId > 8) return null;
    if (userData?.role === "ADMIN") return <AdminWarning modeName="Story Mode" />;

    // BOSS MODE RENDER
    if (chapId === 8) {
        return (
            <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url('/bg_poster.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
                <div className="relative z-10">
                    <div className="flex justify-between items-center p-6">
                        <h1 className="text-xl font-bold tracking-widest text-cyan-400 uppercase">Chapter 8: The Mirror of Truth</h1>
                        <HomeButton />
                    </div>
                    <BossPuzzle
                        userId={localStorage.getItem("user_id") || ""}
                        token={localStorage.getItem("token") || ""}
                    />
                </div>
            </main>
        );
    }

    const affinityPercent = Math.min(100, Math.max(0, affinity));

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white">
            {/* ===== LAYER 1: Background ===== */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url('/bg${chapId}.jpg')` }}
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
            {/* Scanline effect */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_2px,3px_100%]" />

            {/* ===== LAYER 2: NPC Character ===== */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none">
                <img
                    src={`/npc${chapId}-${npcEmotion}.png`}
                    alt={chapter.npcName}
                    className="h-[90vh] md:h-[98vh] object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-500"
                    style={{ filter: isThinking ? "brightness(0.8)" : "brightness(1)" }}
                />
            </div>

            {/* ===== LAYER 3: UI Overlay ===== */}
            <div className="relative z-20 flex flex-col min-h-screen">

                {/* --- Top Bar --- */}
                <div className="flex items-start justify-between p-4 md:p-6">
                    {/* Left: Chapter Info */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold tracking-[0.3em] text-[#00F0FF] uppercase opacity-80">
                                {chapter.name}
                            </span>
                            <span className="text-xs text-white/40">•</span>
                            <span className="text-xs font-bold text-white/80 italic">{chapter.location}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black italic text-white tracking-tight">
                            {chapter.npcName}
                        </h1>
                    </div>

                    {/* Right: Home Button */}
                    <HomeButton />
                </div>

                {/* --- Affinity Bar --- */}
                <div className="px-4 md:px-6 mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-widest text-[#39FF14] uppercase opacity-70">
                            Thiện cảm
                        </span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${affinityPercent}%`,
                                    background: affinityPercent >= 80
                                        ? "linear-gradient(90deg, #39FF14, #00F0FF)"
                                        : affinityPercent >= 40
                                            ? "linear-gradient(90deg, #00F0FF, #39FF14)"
                                            : "linear-gradient(90deg, #ef4444, #f97316)",
                                    boxShadow: affinityPercent >= 80
                                        ? "0 0 12px #39FF14"
                                        : affinityPercent >= 40
                                            ? "0 0 8px #00F0FF"
                                            : "0 0 8px #ef4444",
                                }}
                            />
                        </div>
                        <span className={`text-sm font-black tabular-nums min-w-[3ch] text-right ${affinityPercent >= 80 ? "text-[#39FF14]"
                            : affinityPercent >= 40 ? "text-[#00F0FF]"
                                : "text-red-400"
                            }`}>
                            {affinity}
                        </span>
                    </div>
                </div>

                {/* --- Spacer (push conversation to bottom) --- */}
                <div className="flex-1" />

                {/* --- Event Badge --- */}
                {npcData?.event && (
                    <div className="px-4 md:px-6 mb-3 animate-in fade-in duration-500">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg backdrop-blur-sm">
                            <span className="text-yellow-400 text-lg">⚡</span>
                            <p className="text-sm text-yellow-200 italic">{npcData.event}</p>
                        </div>
                    </div>
                )}

                {/* --- Conversation Panel --- */}
                <div className="px-4 md:px-6 pb-6">
                    {/* NPC Dialog Box */}
                    {npcData && !isThinking && (
                        <div className="relative mb-4 p-5 md:p-6 bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg animate-in fade-in duration-300">
                            {/* NPC name tag */}
                            <div className="absolute -top-3 left-4 px-3 py-0.5 bg-[#00F0FF] text-black text-xs font-black uppercase tracking-wider">
                                {chapter.npcName}
                            </div>

                            {/* Behavior (action description) */}
                            {npcData.npc_behavior && (
                                <p className="text-sm text-[#00F0FF]/70 italic mb-2 mt-1">
                                    *{npcData.npc_behavior}*
                                </p>
                            )}

                            {/* Dialog text */}
                            <p className="text-base md:text-lg text-gray-100 leading-relaxed">
                                {npcData.npc_say}
                            </p>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isThinking && (
                        <div className="relative mb-4 p-5 md:p-6 bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg">
                            <div className="absolute -top-3 left-4 px-3 py-0.5 bg-[#00F0FF] text-black text-xs font-black uppercase tracking-wider">
                                {chapter.npcName}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <span className="text-sm text-white/50 italic">Đang suy nghĩ...</span>
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    {npcData && !isThinking && !resultPopup && (
                        <div className="flex flex-col gap-2">
                            {npcData.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    disabled={optionLocked}
                                    onClick={() => handleChooseOption(opt)}
                                    className={`group relative w-full text-left p-4 border rounded-lg transition-all duration-200 ${optionLocked
                                        ? "border-white/5 bg-white/5 opacity-50 cursor-not-allowed"
                                        : "border-[#00F0FF]/20 bg-black/60 backdrop-blur-sm hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] cursor-pointer"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center border rounded-full text-xs font-black transition-colors ${optionLocked
                                            ? "border-white/20 text-white/30"
                                            : "border-[#00F0FF]/40 text-[#00F0FF] group-hover:border-[#00F0FF] group-hover:bg-[#00F0FF]/20"
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-sm md:text-base text-gray-200 group-hover:text-white transition-colors leading-relaxed">
                                            {opt.option}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== POPUPS ===== */}

            {/* Win Popup */}
            {resultPopup === "win" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-300" />
                    <LessonPopup
                        chapterId={chapId}
                        lesson={LESSONS[chapId]}
                        onClose={() => router.push("/story-mode")}
                    />
                </div>
            )}

            {/* Lose Popup */}
            {resultPopup === "lose" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-300" />
                    <div className="relative z-10 w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="absolute inset-0 bg-red-500/5 blur-xl rounded-xl"></div>
                        <div className="relative border-2 border-red-500/40 bg-black/90 p-8 md:p-10 rounded-xl backdrop-blur-sm">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>

                            <h2 className="text-2xl md:text-3xl font-black italic text-red-500 mb-2 uppercase text-center drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                                Thất bại
                            </h2>
                            <p className="text-center text-red-400/70 font-mono text-[10px] tracking-[0.3em] uppercase mb-6 italic">
                                Connection Lost
                            </p>

                            <div className="relative p-5 border border-white/5 bg-white/[0.03] rounded-lg mb-8">
                                <p className="text-base text-gray-300 leading-relaxed italic text-center">
                                    {resultMessage}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetry}
                                    className="flex-1 relative group overflow-hidden py-4 rounded font-black uppercase tracking-widest transition-all"
                                >
                                    <div className="absolute inset-0 border border-[#00F0FF]/30 group-hover:border-[#00F0FF] transition-colors"></div>
                                    <div className="absolute inset-0 bg-[#00F0FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative z-10 text-[#00F0FF] text-sm">Thử lại</span>
                                </button>
                                <button
                                    onClick={() => router.push("/story-mode")}
                                    className="flex-1 relative group overflow-hidden py-4 rounded font-black uppercase tracking-widest transition-all"
                                >
                                    <div className="absolute inset-0 border border-white/20 group-hover:border-white/40 transition-colors"></div>
                                    <span className="relative z-10 text-white/60 group-hover:text-white/80 text-sm">Quay về</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
