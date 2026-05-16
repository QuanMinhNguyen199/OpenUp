"use client";

import React, { useEffect, useState } from "react";

interface RoundResult {
    round: number;
    p1_username: string; p2_username: string;
    p1_msg: string; p2_msg: string;
    p1_score: number; p2_score: number;
    p1_reason: string; p2_reason: string;
    p1_time: number; p2_time: number;
    total_p1: number; total_p2: number;
    winner_round: string;
}

interface Props {
    result: RoundResult;
    myUsername: string;
    isPlayer1: boolean;
    onClose: () => void;
}

export default function RoundResultPopup({ result, myUsername, isPlayer1, onClose }: Props) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onClose]);

    const myMsg = isPlayer1 ? result.p1_msg : result.p2_msg;
    const oppMsg = isPlayer1 ? result.p2_msg : result.p1_msg;
    const myScore = isPlayer1 ? result.p1_score : result.p2_score;
    const oppScore = isPlayer1 ? result.p2_score : result.p1_score;
    const myReason = isPlayer1 ? result.p1_reason : result.p2_reason;
    const oppReason = isPlayer1 ? result.p2_reason : result.p1_reason;
    const myTime = isPlayer1 ? result.p1_time : result.p2_time;
    const oppTime = isPlayer1 ? result.p2_time : result.p1_time;
    const myName = isPlayer1 ? result.p1_username : result.p2_username;
    const oppName = isPlayer1 ? result.p2_username : result.p1_username;

    const iWon = myScore > oppScore;
    const oppWon = oppScore > myScore;
    const isDraw = myScore === oppScore;

    // check tiebreaker
    const hasTiebreaker = isDraw && myScore !== 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-6 border border-[#FF6B35]/40 bg-[#0a0a0a]/95 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/5 to-transparent pointer-events-none" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black italic text-[#FF6B35] uppercase tracking-tighter">
                            Kết quả lượt {result.round}
                        </h2>
                        <span className="text-sm font-mono text-gray-500">{countdown}s</span>
                    </div>

                    {/* Two columns */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* My result */}
                        <div className={`p-4 border ${iWon ? "border-[#39FF14]/40 bg-[#39FF14]/5" : oppWon ? "border-gray-600/30 bg-gray-800/20" : "border-white/10 bg-white/5"}`}>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${iWon ? "text-[#39FF14]" : "text-gray-400"}`}>
                                {myName} {iWon ? "👑" : ""}
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Câu trả lời</p>
                                    <p className="text-sm text-gray-200 italic leading-relaxed">
                                        {myMsg || <span className="text-gray-600">Không trả lời</span>}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Điểm</p>
                                        <p className={`text-2xl font-black italic ${myScore > 0 ? "text-[#39FF14]" : myScore < 0 ? "text-red-500" : "text-gray-400"}`}>
                                            {myScore > 0 ? "+" : ""}{myScore}
                                            {hasTiebreaker && myTime < oppTime && <span className="text-xs ml-1 text-yellow-400">⚡+5</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase">Thời gian</p>
                                        <p className="text-lg font-bold text-white tabular-nums">{myTime}s</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Nhận xét</p>
                                    <p className="text-xs text-gray-400 italic">{myReason || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Opponent result */}
                        <div className={`p-4 border ${oppWon ? "border-[#00F0FF]/40 bg-[#00F0FF]/5" : iWon ? "border-gray-600/30 bg-gray-800/20" : "border-white/10 bg-white/5"}`}>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${oppWon ? "text-[#00F0FF]" : "text-gray-400"}`}>
                                {oppName} {oppWon ? "👑" : ""}
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Câu trả lời</p>
                                    <p className="text-sm text-gray-200 italic leading-relaxed">
                                        {oppMsg || <span className="text-gray-600">Không trả lời</span>}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Điểm</p>
                                        <p className={`text-2xl font-black italic ${oppScore > 0 ? "text-[#39FF14]" : oppScore < 0 ? "text-red-500" : "text-gray-400"}`}>
                                            {oppScore > 0 ? "+" : ""}{oppScore}
                                            {hasTiebreaker && oppTime < myTime && <span className="text-xs ml-1 text-yellow-400">⚡+5</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase">Thời gian</p>
                                        <p className="text-lg font-bold text-white tabular-nums">{oppTime}s</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Nhận xét</p>
                                    <p className="text-xs text-gray-400 italic">{oppReason || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Score totals */}
                    <div className="mt-4 flex justify-center gap-8 text-sm font-mono text-gray-500">
                        <span>Tổng: <span className="text-white font-bold">{isPlayer1 ? result.total_p1 : result.total_p2}</span></span>
                        <span>vs</span>
                        <span>Tổng: <span className="text-white font-bold">{isPlayer1 ? result.total_p2 : result.total_p1}</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
