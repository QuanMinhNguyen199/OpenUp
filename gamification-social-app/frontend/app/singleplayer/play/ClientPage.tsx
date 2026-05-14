"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import HomeButton from "../../components/HomeButton";
import AdminWarning from "../../components/AdminWarning";
import SingleplayerResultPopup from "../../components/SingleplayerResultPopup";
import ChatWindow from "./components/ChatWindow";
import ProfilePanel from "./components/ProfilePanel";
import ScoreBar from "./components/ScoreBar";

interface Message {
  role: "user" | "npc";
  content: string;
  type?: "start_context" | "normal" | "score";
  npc_behavior?: string;
  score_delta?: number;
  reason?: string;
}

interface GameState {
  turn: number;
  npcName: string;
  npcJob: string;
  relationship: string;
  location: string;
  score: number;
  messages: Message[];
  num: number[];
  loading: boolean;
}

export default function ClientPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<{ username: string; level: number; total_xp: number; role: string } | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    turn: 1,
    npcName: "",
    npcJob: "",
    relationship: "",
    location: "",
    score: 20,
    messages: [],
    num: [],
    loading: false,
  });
  const [pageLoading, setPageLoading] = useState(true);
  const initRequestedRef = useRef(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);

  // Auth & Fetch User
  useEffect(() => {
    if (initRequestedRef.current) return;
    initRequestedRef.current = true;

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      router.push("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/status/${userId}`,
          {
            headers: {
              "x-token": token,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Invalid token");
        }

        const data = await res.json();
        setUserData(data);
        setPageLoading(false);

        // Initialize game - Turn 1
        initRequestedRef.current = true;
        await initializeGame(userId, token);
      } catch {
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  const initializeGame = async (userId: string, token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/singleplayer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-token": token,
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            turn: 1,
            history: [],
            num: [],
            event: false,
            location: "Không rõ",
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to initialize game");
      }

      const data = await res.json();

      if (data.error) {
        console.error("Backend error:", data.error);
        return;
      }

      // Extract data from backend response (Turn 1)
      const npcName = data.name || "Unknown";
      const startContext = data.start_context || "";
      const location = data.location || "Không rõ";
      const npcBehavior = data.npc_behavior || "";
      const npcSay = data.npc_say || "";
      const num = data.num || [];
      const job = data.job || "Không rõ";
      const relationship = data.relationship || "Không rõ";

      // Add messages
      const initialMessages: Message[] = [];

      if (startContext) {
        initialMessages.push({
          role: "npc",
          content: startContext,
          type: "start_context",
        });
      }

      if (npcSay) {
        initialMessages.push({
          role: "npc",
          content: npcSay,
          type: "normal",
          npc_behavior: npcBehavior,
        });
      }

      setGameState((prev) => ({
        ...prev,
        turn: 1,
        npcName,
        npcJob: job,
        relationship,
        location,
        messages: initialMessages,
        num,
      }));
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  };

  const checkSingleplayerWin = async (payload: {
    history: { role: string; content: string }[];
    num: number[];
    turn: number;
    name: string;
    relationship: string;
    score: number;
  }) => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId || !token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/check_singleplayer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-token": token,
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            history: payload.history,
            num: payload.num,
            turn: payload.turn,
            name: payload.name,
            relationship: payload.relationship,
            score: payload.score,
          }),
        }
      );

      if (!res.ok) {
        console.error("Failed to check singleplayer win");
      }
    } catch (error) {
      console.error("Error checking singleplayer win:", error);
    }
  };

  const handleReplay = () => {
    setGameState({
      turn: 1,
      npcName: "",
      npcJob: "",
      relationship: "",
      location: "",
      score: 20,
      messages: [],
      num: [],
      loading: false,
    });
    setGameResult(null);
    initRequestedRef.current = false;

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");
    if (userId && token) {
      initializeGame(userId, token);
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || gameState.loading) return;

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId || !token) return;

    // Add user message to chat
    const newMessages = [
      ...gameState.messages,
      {
        role: "user" as const,
        content: userMessage,
        type: "normal" as const,
      },
    ];

    setGameState((prev) => ({
      ...prev,
      messages: newMessages,
      loading: true,
    }));

    try {
      // Convert messages to backend format
      const history = newMessages.slice(1).slice(-6)
        .filter((m) => m.role === "npc" || m.role === "user")
        .map((m) => ({
          role: m.role === "npc" ? "assistant" : "user",
          content: m.content,
        }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/singleplayer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-token": token,
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            turn: gameState.turn + 1,
            history,
            num: gameState.num,
            location: gameState.location,
            event: false,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to get NPC response");
      }

      const data = await res.json();

      // Parse NPC response
      const npcBehavior = data.npc_behavior || "";
      const npcSay = data.npc_say || "";
      const score = data.score !== undefined ? data.score : 0;
      const reason = data.reason || "";

      // Update user message with score feedback (inject into last user message)
      const userMessageWithScore = [...newMessages];
      if (userMessageWithScore.length > 0) {
        userMessageWithScore[userMessageWithScore.length - 1] = {
          ...userMessageWithScore[userMessageWithScore.length - 1],
          score_delta: score,
          reason,
        };
      }

      // Add NPC message (without score)
      const updatedMessages = [
        ...userMessageWithScore,
        {
          role: "npc" as const,
          content: npcSay,
          type: "normal" as const,
          npc_behavior: npcBehavior,
        },
      ];

      const newScore = Math.max(0, gameState.score + score);

      setGameState((prev) => ({
        ...prev,
        turn: prev.turn + 1,
        messages: updatedMessages,
        score: newScore,
        loading: false,
        num: data.num || prev.num,
      }));

      // Check win/lose conditions
      if (newScore >= 100) {
        const historyPayload = updatedMessages
          .filter((msg) => msg.role === "npc" || msg.role === "user")
          .slice(-6)
          .map((msg) => ({
            role: msg.role === "npc" ? "assistant" : "user",
            content: msg.content,
          }));

        await checkSingleplayerWin({
          history: historyPayload,
          num: data.num || gameState.num,
          turn: gameState.turn + 1,
          name: gameState.npcName,
          relationship: gameState.relationship,
          score: 100,
        });
        setGameResult("win");
      } else if (newScore <= 0) {
        // Lose - delay 0.5s before showing popup
        setTimeout(() => {
          setGameResult("lose");
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setGameState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  if (pageLoading || gameState.messages.length === 0) return <Loading />;

  if (userData?.role === "ADMIN") {
    return <AdminWarning modeName="Singleplayer" />;
  }

  if (gameResult) {
    return <SingleplayerResultPopup mode={gameResult} onReplay={handleReplay} />;
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white">
      {/* ===== LAYER 1: Futuristic Background ===== */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a,0%,#000_100%)]" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#39FF1408_1px,transparent_1px),linear-gradient(to_bottom,#39FF1408_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Scanline & Noise */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_2px,3px_100%] opacity-50" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#39FF14]/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F0FF]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

      {/* ===== LAYER 2: Main Interface ===== */}
      <div className="relative z-10 flex flex-col h-screen p-4 md:p-6">
        {/* --- Top Dashboard Info --- */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#39FF14] uppercase opacity-60">
              Session_Type: Single_Player
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#39FF14] animate-ping rounded-full" />
              <span className="text-xs font-bold text-white/40 italic">LIVE_FEED: ENCRYPTED_CONNECTION</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Player Quick Stats */}
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-4">
              <span className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest">{userData?.username}</span>
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">Level {userData?.level} • {userData?.role}</span>
            </div>
            <HomeButton />
          </div>
        </div>

        {/* --- 3-COLUMN CORE LAYOUT --- */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* LEFT: Target Data */}
          <div className="hidden xl:block h-full">
            <ProfilePanel
              npcName={gameState.npcName}
              npcJob={gameState.npcJob}
              relationship={gameState.relationship}
              location={gameState.location}
              num={gameState.num}
            />
          </div>

          {/* CENTER: Communication Hub */}
          <div className="flex-1 h-full flex flex-col min-w-0">
            <ChatWindow
              messages={gameState.messages}
              gameLoading={gameState.loading}
              npcName={gameState.npcName}
              onSendMessage={handleSendMessage}
            />
          </div>

          {/* RIGHT: Status Monitor */}
          <div className="hidden lg:flex flex-col gap-6 h-full">
            <ScoreBar score={gameState.score} />
            
            {/* Mission Objectives Decor */}
            <div className="bg-black/40 border border-white/10 p-5 rounded-lg flex-1 backdrop-blur-sm">
              <h3 className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest mb-4">Current_Objectives</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className={`w-1.5 h-1.5 mt-1 border border-[#39FF14] ${gameState.score >= 50 ? "bg-[#39FF14]" : "bg-transparent"}`} />
                  <p className={`text-[11px] font-bold ${gameState.score >= 50 ? "text-white" : "text-white/30"} uppercase`}>Reach 50_Points</p>
                </li>
                <li className="flex gap-3 items-start">
                  <div className={`w-1.5 h-1.5 mt-1 border border-[#39FF14] ${gameState.score >= 100 ? "bg-[#39FF14]" : "bg-transparent"}`} />
                  <p className={`text-[11px] font-bold ${gameState.score >= 100 ? "text-white" : "text-white/30"} uppercase`}>Achieve Completion_100</p>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 mt-1 border border-[#00F0FF] bg-[#00F0FF]" />
                  <p className="text-[11px] font-bold text-white uppercase italic tracking-tighter">Maintain Social_Cohesion</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Footer Status Line --- */}
        <div className="mt-4 flex justify-between items-center px-2 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
          <div className="flex gap-6">
            <span>CORE_SYNC: 98.4%</span>
            <span>LATENCY: 12ms</span>
            <span>OS_VERSION: v0.8.2-BETA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <div key={i} className="w-3 h-1 bg-[#39FF14]/40" />)}
            </div>
            <span>SOCIAL_RECOGNITION_ACTIVE</span>
          </div>
        </div>
      </div>
    </main>
  );
}

