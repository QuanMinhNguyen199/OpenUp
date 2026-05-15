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
    inputRef.current?.focus();
  }, [messages]);

  const charCount = inputValue.length;

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !gameLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 bg-white/5 border border-[#00F0FF]/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group shadow-2xl">


      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #39FF14, #00F0FF);
          border-radius: 2px;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 relative">
        <div className="flex items-center gap-4">
          <Avatar mood={moodState} size="md" isNpc />
          <div className="space-y-0.5">
            <h2 className="text-xl font-black italic tracking-tighter text-[#39FF14] uppercase">
              {npcName}
            </h2>
            <p className="text-[10px] font-bold text-[#00F0FF]/80 uppercase tracking-widest">
              Đang trò chuyện...
            </p>
          </div>
        </div>


      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 chat-scrollbar py-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className="mt-1">
              <Avatar mood={msg.role === "npc" ? moodState : "neutral"} size="sm" isNpc={msg.role === "npc"} />
            </div>

            <div
              className={`relative max-w-[85%] lg:max-w-[70%] group/msg`}
              style={{
                filter: msg.role === "user"
                  ? "drop-shadow(0 4px 12px rgba(57, 255, 20, 0.15))"
                  : "drop-shadow(0 4px 12px rgba(0, 240, 255, 0.15))"
              }}
            >
              {/* Slanted Glass Wrapper */}
              <div
                className={`relative overflow-hidden`}
                style={{
                  clipPath: msg.role === "user"
                    ? "polygon(0 0, 94% 0, 100% 12%, 100% 100%, 6% 100%, 0 88%)"
                    : "polygon(6% 0, 100% 0, 100% 88%, 94% 100%, 0 100%, 0 12%)"
                }}
              >
                {/* Inner Glass Content */}
                <div
                  className={`p-4 backdrop-blur-md border-white/10 ${msg.role === "user"
                    ? "bg-[#39FF14]/20 border-r-2 border-[#39FF14]"
                    : "bg-[#00F0FF]/20 border-l-2 border-[#00F0FF]"
                    } border-y border-x`}
                >
                  {/* Start Context */}
                  {msg.type === "start_context" && (
                    <div className="text-base font-bold text-[#00F0FF] mb-3 pb-2 border-b border-[#00F0FF]/20">
                      📍 {msg.content}
                    </div>
                  )}

                  {/* Normal message content */}
                  {msg.type === "normal" && (
                    <>
                      {msg.npc_behavior && msg.role === "npc" && (
                        <div className="text-base text-[#39FF14] font-bold italic mb-2 tracking-wide opacity-90">
                          [{msg.npc_behavior}]
                        </div>
                      )}
                      <p className="text-sm md:text-base text-gray-100 leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </>
                  )}

                  {/* Score feedback for user messages */}
                  {msg.score_delta !== undefined && msg.role === "user" && (
                    <div className="mt-4 pt-3 border-t border-white/50">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-0.5 text-[10px] font-black rounded-sm ${msg.score_delta > 0 ? "bg-[#39FF14] text-black" : "bg-red-500 text-white"
                          }`}>
                          {msg.score_delta > 0 ? "▲" : "▼"}
                        </div>
                        <span className={`text-sm font-black ${msg.score_delta > 0 ? "text-[#39FF14]" : "text-red-400"}`}>
                          {msg.score_delta >= 0 ? "+" : ""}{msg.score_delta}{' ĐIỂM'}
                        </span>
                      </div>
                      {msg.reason && (
                        <p className="text-md text-[#00F0FF]/100 mt-2 font-mono italic">
                          &gt; Lý do: {msg.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}





        {gameLoading && (
          <div className="flex gap-4 animate-pulse">
            <Avatar mood={moodState} size="sm" isNpc />
            <div className="bg-white/5 border border-[#00F0FF]/30 p-4 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
              <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: "400ms" }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Terminal */}
      <div className="relative mt-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#39FF14]/20 to-[#00F0FF]/20 blur opacity-75" />

        <div className="relative flex flex-col bg-black/40 border border-white/10 p-1">
          {/* Terminal Header */}
          <div className="flex justify-between items-center px-3 py-1 bg-white/5 text-[9px] font-black text-[#39FF14] tracking-widest uppercase">
            <span>Nghĩ kỹ trước khi nói</span>
            <span className="animate-pulse">_READY</span>
          </div>

          <div className="flex gap-2 p-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, 300))}
              onKeyPress={handleKeyPress}
              placeholder="Gõ lệnh giao tiếp của bạn..."
              disabled={gameLoading}
              rows={2}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-white/20 focus:outline-none resize-none disabled:opacity-50 font-mono"
            />

            <button
              onClick={handleSend}
              disabled={gameLoading || !inputValue.trim()}
              className="relative group/send px-6 flex items-center justify-center overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <div className="absolute inset-0 bg-[#39FF14] skew-x-[-20deg] group-hover/send:translate-x-full transition-transform duration-500" />
              <div className="absolute inset-0 border border-[#39FF14] skew-x-[-20deg]" />
              <span className="relative z-10 text-xs font-black text-black group-hover/send:text-[#39FF14] uppercase italic tracking-tighter">
                Gửi
              </span>
            </button>
          </div>

          {/* Character Counter */}
          <div className="flex justify-between items-center px-3 py-1 text-[9px] font-mono text-white/70 border-t border-white/5">
            <div className="flex gap-4">
              <span>TRẠNG THÁI: {gameLoading ? "ĐANG TÍNH TOÁN" : "SẴN SÀNG"}</span>
              <span>KÝ TỰ: {charCount}/300</span>
            </div>
            <div className="flex gap-1">
              <div className={`w-1 h-1 ${charCount > 250 ? "bg-red-500" : "bg-[#39FF14]"}`} />
              <div className="w-1 h-1 bg-[#00F0FF]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
