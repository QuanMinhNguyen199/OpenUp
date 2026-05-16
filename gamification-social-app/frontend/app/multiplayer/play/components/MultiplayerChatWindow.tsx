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
                    {/* Turn counter */}
                    <div className="text-sm font-bold text-gray-400">
                        Lượt <span className="text-white text-lg">{currentTurn}</span>/{maxTurns}
                    </div>
                    {/* Timer */}
                    <div className={`text-2xl font-black italic ${timerColor} tabular-nums`}>
                        {timerSeconds}s
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 chat-scrollbar py-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} ${msg.isLoser ? "opacity-40" : ""}`}
                    >
                        <div className="mt-1">
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
                            {/* Username label for user messages */}
                            {msg.role === "user" && msg.username && (
                                <p className={`text-xs font-bold mb-1 text-right ${msg.isLoser ? "text-gray-500" : "text-[#39FF14]/70"}`}>
                                    {msg.username}
                                </p>
                            )}
                            {/* Behavior tag for NPC */}
                            {msg.role === "npc" && msg.npc_behavior && msg.type === "normal" && (
                                <p className="text-xs italic text-[#FF6B35]/60 mb-1">*{msg.npc_behavior}*</p>
                            )}
                            <div className={`px-5 py-3 ${
                                msg.type === "start_context"
                                    ? "bg-white/5 border border-white/10 text-gray-400 italic text-sm"
                                    : msg.role === "npc"
                                        ? "bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-gray-100"
                                        : msg.isLoser
                                            ? "bg-gray-700/30 border border-gray-600/20 text-gray-500"
                                            : "bg-[#39FF14]/10 border border-[#39FF14]/20 text-gray-100"
                            }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Opponent answered indicator */}
                {opponentAnswered && !answered && (
                    <div className="flex gap-4 flex-row-reverse animate-in fade-in duration-300">
                        <div className="mt-1"><Avatar mood="neutral" size="sm" isNpc={false} /></div>
                        <div className="px-5 py-3 bg-white/5 border border-white/10 text-gray-500 italic text-sm backdrop-blur-xl">
                            Đối thủ đã trả lời...
                        </div>
                    </div>
                )}

                {/* Loading */}
                {gameLoading && (
                    <div className="flex gap-4 items-center">
                        <Avatar mood="neutral" size="sm" isNpc />
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2.5 h-2.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative border-t border-white/10 pt-4">
                {answered ? (
                    <div className="text-center text-sm text-[#39FF14] font-bold italic py-3">
                        ✓ Đã gửi — đang chờ đối thủ...
                    </div>
                ) : (
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <span className="absolute top-2 left-3 text-[#FF6B35] font-mono text-xs opacity-50">{">"}</span>
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Nhập câu trả lời..."
                                rows={1}
                                maxLength={500}
                                disabled={gameLoading}
                                className="w-full bg-black/50 border border-white/10 py-3 pl-7 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]/50 transition-colors resize-none font-mono text-sm disabled:opacity-50"
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || gameLoading}
                            className="px-6 py-3 bg-[#FF6B35] text-black font-black italic text-sm uppercase tracking-wider hover:bg-[#FF8C5A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            GỬI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
