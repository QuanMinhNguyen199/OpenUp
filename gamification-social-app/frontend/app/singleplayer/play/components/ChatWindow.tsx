"use client";

import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";

interface Message {
  role: "user" | "npc";
  content: string;
  type?: "start_context" | "normal" | "score";
  npc_behavior?: string;
  score_delta?: number;
  reason?: string;
}

interface ChatWindowProps {
  messages: Message[];
  gameLoading: boolean;
  npcName: string;
  onSendMessage: (message: string) => void;
}

export default function ChatWindow({
  messages,
  gameLoading,
  npcName,
  onSendMessage,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate mood from last message
  const calculateMood = () => {
    // const lastMessage = messages[messages.length - 1];
    // if (
    //   lastMessage?.role === "npc" &&
    //   lastMessage?.score_delta !== undefined
    // ) {
    //   if (lastMessage.score_delta > 5) {
    //     return "happy";
    //   } else if (lastMessage.score_delta < -5) {
    //     return "sad";
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "user" && msg.score_delta !== undefined) {
        if (msg.score_delta > 5) {
          return "happy";
        } else if (msg.score_delta < -5) {
          return "sad";
        }
        return "neutral";
      }
    }
    return "neutral";
  };

  const moodState = calculateMood() as "happy" | "neutral" | "sad";

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !gameLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 bg-white/5 border border-[#00F0FF]/20 rounded-lg p-6 backdrop-blur-xs">
      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.5);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#39FF14]/30 pb-4">
        <div className="flex items-center gap-3">
          <Avatar mood={moodState} size="md" isNpc />
          <div>
            <h2 className="text-lg font-bold text-[#39FF14]">{npcName}</h2>
            <p className="text-xs text-[#00F0FF]/70">Đang trò chuyện...</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 chat-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "npc" && (
              <Avatar mood={moodState} size="sm" isNpc />
            )}

            <div
              className={`max-w-xs lg:max-w-md ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-[#39FF14]/20 to-[#39FF14]/10 border border-[#39FF14]/40"
                  : "bg-gradient-to-r from-[#00F0FF]/20 to-[#00F0FF]/10 border border-[#00F0FF]/40"
              } rounded-lg p-3 backdrop-blur-sm`}
            >
              {/* Start Context */}
              {msg.type === "start_context" && (
                <div className="text-xs italic text-[#00F0FF]/80 mb-2 pb-2 border-b border-[#00F0FF]/30">
                  📍 {msg.content}
                </div>
              )}

              {/* Normal message */}
              {msg.type === "normal" && (
                <>
                  {msg.npc_behavior && msg.role === "npc" && (
                    <div className="text-xs text-[#39FF14]/70 italic mb-1">
                      *{msg.npc_behavior}*
                    </div>
                  )}
                  <p className="text-sm text-white leading-relaxed">
                    {msg.content}
                  </p>
                </>
              )}

              {/* Score feedback */}
              {msg.score_delta !== undefined && msg.role === "user" && (
                <div className="mt-2 pt-2 border-t border-[#00F0FF]/20">
                  <div
                    className={`text-xs font-bold flex items-center gap-1 ${
                      msg.score_delta > 0
                        ? "text-[#39FF14]"
                        : msg.score_delta < 0
                          ? "text-red-400"
                          : "text-[#00F0FF]"
                    }`}
                  >
                    {msg.score_delta > 0 ? "📈" : msg.score_delta < 0 ? "📉" : "➡️"}
                    {msg.score_delta > 0 ? "+" : ""}
                    {msg.score_delta} điểm
                  </div>
                  {msg.reason && (
                    <p className="text-xs text-[#00F0FF]/60 mt-1">
                      Lý do: {msg.reason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <Avatar mood="neutral" size="sm" isNpc={false} />
            )}
          </div>
        ))}

        {gameLoading && (
          <div className="flex gap-3 items-center">
            <Avatar mood={moodState} size="sm" isNpc />
            <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-lg p-3 flex gap-2">
              <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
              <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
              <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#39FF14]/30 pt-4 flex gap-2">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập câu trả lời của bạn..."
          disabled={gameLoading}
          rows={2}
          className="flex-1 bg-black/40 border border-[#39FF14]/30 rounded-lg px-3 py-2 text-sm text-white placeholder-[#39FF14]/50 focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={gameLoading || !inputValue.trim()}
          className="bg-gradient-to-r from-[#39FF14] to-[#00F0FF] text-black font-bold px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {gameLoading ? "..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}
