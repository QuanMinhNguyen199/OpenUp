"use client";

import React, { useEffect, useRef, useState } from "react";
import Avatar from "../../../singleplayer/play/components/Avatar";

interface Message {
    role: "user" | "npc";
    content: string;
    type?: "start_context" | "normal";
    npc_behavior?: string;
    username?: string;
    isLoser?: boolean;
}

interface Props {
    messages: Message[];
    gameLoading: boolean;
    npcName: string;
    onSendMessage: (msg: string) => void;
    currentTurn: number;
    maxTurns: number;
    timerSeconds: number;
    answered: boolean;
    opponentAnswered: boolean;
    myUsername: string;
}

export default function MultiplayerChatWindow({
    messages, gameLoading, npcName, onSendMessage,
    currentTurn, maxTurns, timerSeconds, answered, opponentAnswered, myUsername,
}: Props) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (!answered) inputRef.current?.focus();
    }, [messages, answered]);

    const handleSend = () => {
        if (inputValue.trim() && !answered) {
            onSendMessage(inputValue);
            setInputValue("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !answered) {
            e.preventDefault();
            handleSend();
        }
    };

    const timerColor = timerSeconds <= 10 ? "text-red-500" : timerSeconds <= 30 ? "text-yellow-400" : "text-[#FF6B35]";

    return (
        <div className="flex-1 flex flex-col gap-3 bg-white/5 border border-[#FF6B35]/30 rounded-lg p-4 backdrop-blur-md relative overflow-hidden group shadow-2xl">
            <style>{`
                .chat-scrollbar::-webkit-scrollbar { width: 4px; }
                .chat-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .chat-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #FF6B35, #00F0FF); border-radius: 2px; }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <Avatar mood="neutral" size="md" isNpc />
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-black italic tracking-tighter text-[#FF6B35] uppercase">
                            {npcName || "..."}
                        </h2>
                        <p className="text-[10px] font-bold text-[#00F0FF]/80 uppercase tracking-widest">
                            Đang trò chuyện...
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Lượt <span className="text-white text-lg">{currentTurn}</span>/{maxTurns}
                    </div>
                    <div className={`text-2xl font-black italic ${timerColor} tabular-nums drop-shadow-[0_0_10px_currentColor]`}>
                        {timerSeconds}s
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 chat-scrollbar py-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} ${msg.isLoser ? "opacity-40 grayscale-[0.5]" : ""}`}
                    >
                        <div className="mt-1 shrink-0">
                            <Avatar mood="neutral" size="sm" isNpc={msg.role === "npc"} />
                        </div>
                        <div className="relative max-w-[85%] lg:max-w-[70%]"
                            style={{
                                filter: msg.role === "user"
                                    ? msg.isLoser
                                        ? "drop-shadow(0 4px 12px rgba(128,128,128,0.15))"
                                        : "drop-shadow(0 4px 12px rgba(57, 255, 20, 0.15))"
                                    : "drop-shadow(0 4px 12px rgba(255,107,53, 0.15))"
                            }}
                        >
                            {/* Username label */}
                            {msg.role === "user" && msg.username && (
                                <p className={`text-[10px] font-black mb-1 uppercase tracking-tighter ${msg.role === "user" ? "text-right" : "text-left"} ${msg.isLoser ? "text-gray-500" : "text-[#39FF14]"}`}>
                                    {msg.username}
                                </p>
                            )}
                            
                            {/* Slanted Box */}
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath: msg.role === "user"
                                        ? "polygon(0 0, 94% 0, 100% 12%, 100% 100%, 6% 100%, 0 88%)"
                                        : "polygon(6% 0, 100% 0, 100% 88%, 94% 100%, 0 100%, 0 12%)"
                                }}
                            >
                                <div className={`p-4 backdrop-blur-md border-white/10 ${
                                    msg.type === "start_context"
                                        ? "bg-white/5 border border-white/10 text-gray-400 italic text-sm"
                                        : msg.role === "npc"
                                            ? "bg-[#FF6B35]/20 border-l-2 border-[#FF6B35] text-gray-100"
                                            : msg.isLoser
                                                ? "bg-gray-700/30 border-r-2 border-gray-500 text-gray-500"
                                                : "bg-[#39FF14]/20 border-r-2 border-[#39FF14] text-gray-100"
                                } border-y border-x`}>
                                    {msg.npc_behavior && msg.role === "npc" && msg.type === "normal" && (
                                        <div className="text-xs text-[#39FF14] font-bold italic mb-2 tracking-wide opacity-90">
                                            [{msg.npc_behavior}]
                                        </div>
                                    )}
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Opponent answered indicator */}
                {opponentAnswered && !answered && (
                    <div className="flex gap-4 flex-row-reverse animate-in fade-in duration-300 opacity-60">
                        <div className="mt-1 shrink-0"><Avatar mood="neutral" size="sm" isNpc={false} /></div>
                        <div className="px-5 py-3 bg-white/5 border border-white/10 text-gray-500 italic text-xs backdrop-blur-xl font-mono">
                            &gt; ĐỐI THỦ ĐANG CHỜ PHẢN HỒI CỦA BẠN...
                        </div>
                    </div>
                )}

                {/* Loading NPC dot animation */}
                {gameLoading && (
                    <div className="flex gap-4 items-center animate-pulse">
                        <Avatar mood="neutral" size="sm" isNpc />
                        <div className="bg-white/5 border border-[#FF6B35]/30 p-4 rounded-lg flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
                            <div className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: "400ms" }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Terminal Input Section */}
            <div className="relative mt-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B35]/20 to-[#00F0FF]/20 blur opacity-75" />
                
                <div className="relative flex flex-col bg-black/40 border border-white/10 p-1">
                    <div className="flex justify-between items-center px-3 py-1 bg-white/5 text-[9px] font-black text-[#FF6B35] tracking-widest uppercase">
                        <span>{answered ? "DỮ LIỆU ĐÃ GỬI - ĐANG ĐỢI" : "NGHĨ KỸ TRƯỚC KHI NÓI"}</span>
                        <span className="animate-pulse">{answered ? "_WAITING" : "_READY"}</span>
                    </div>

                    <div className="flex gap-2 p-2 min-h-[60px]">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
                            onKeyDown={handleKeyPress}
                            placeholder={answered ? "Đang chờ đối thủ..." : "Nhập câu trả lời của bạn..."}
                            disabled={gameLoading || answered}
                            rows={2}
                            className="flex-1 bg-transparent border-none text-sm text-white placeholder-white/20 focus:outline-none resize-none disabled:opacity-50 font-mono"
                        />

                        {!answered && (
                            <button
                                onClick={handleSend}
                                disabled={gameLoading || !inputValue.trim()}
                                className="relative group/send px-8 flex items-center justify-center overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                <div className="absolute inset-0 bg-[#FF6B35] skew-x-[-20deg] group-hover/send:translate-x-full transition-transform duration-500" />
                                <div className="absolute inset-0 border border-[#FF6B35] skew-x-[-20deg]" />
                                <span className="relative z-10 text-xs font-black text-black group-hover/send:text-[#FF6B35] uppercase italic tracking-tighter">
                                    GỬI
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-3 py-1 text-[9px] font-mono text-white/70 border-t border-white/5">
                        <div className="flex gap-4">
                            <span>LEN: {inputValue.length}/500</span>
                            <span>{myUsername.toUpperCase()}@OPENUP:~$</span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <div className={`w-2 h-2 rounded-full ${answered ? "bg-[#39FF14] animate-pulse" : "bg-gray-600"}`} />
                            <span>SYNC_STATUS</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
