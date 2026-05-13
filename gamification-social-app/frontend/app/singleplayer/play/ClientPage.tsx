"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import HomeButton from "../../components/HomeButton";
import AdminWarning from "../../components/AdminWarning";
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

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_3px,transparent_3px),linear-gradient(to_bottom,#80808012_3px,transparent_3px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

      {/* 3-COLUMN LAYOUT */}
      <div className="relative z-10 flex h-screen gap-6 p-6">
        {/* --- LEFT PANEL: PROFILE --- */}
        <ProfilePanel
          npcName={gameState.npcName}
          npcJob={gameState.npcJob}
          relationship={gameState.relationship}
          location={gameState.location}
          num={gameState.num}
        />

        {/* --- CENTER PANEL: CHAT WINDOW --- */}
        <ChatWindow
          messages={gameState.messages}
          gameLoading={gameState.loading}
          npcName={gameState.npcName}
          onSendMessage={handleSendMessage}
        />

        {/* --- RIGHT PANEL: HOME + SCORE --- */}
        <div className="flex flex-col gap-8">
          <HomeButton />
          <ScoreBar score={gameState.score} />
        </div>
      </div>
    </main>
  );
}
