"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../../components/Loading";
import HomeButton from "../../components/HomeButton";
import AdminWarning from "../../components/AdminWarning";
import ProfilePanel from "../../singleplayer/play/components/ProfilePanel";
import MultiplayerChatWindow from "./components/MultiplayerChatWindow";
import DualScoreBar from "./components/DualScoreBar";
import RoundResultPopup from "./components/RoundResultPopup";
import MultiplayerResultPopup from "./components/MultiplayerResultPopup";

interface Message {
    role: "user" | "npc";
    content: string;
    type?: "start_context" | "normal";
    npc_behavior?: string;
    username?: string;
    isLoser?: boolean; // gray out loser's message
}

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

interface GameOver {
    result: "win" | "lose" | "draw";
    total_your: number;
    total_opponent: number;
    xp_change: number;
    opponent_username: string;
}

export default function MultiplayerClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("room");

    const [pageLoading, setPageLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [myUsername, setMyUsername] = useState("");
    const [opponentUsername, setOpponentUsername] = useState("");

    // NPC info
    const [npcName, setNpcName] = useState("");
    const [npcJob, setNpcJob] = useState("");
    const [relationship, setRelationship] = useState("");
    const [location, setLocation] = useState("");

    // Game state
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [myTotalScore, setMyTotalScore] = useState(0);
    const [opponentTotalScore, setOpponentTotalScore] = useState(0);
    const [gameLoading, setGameLoading] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [opponentAnswered, setOpponentAnswered] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(60);
    const [timerActive, setTimerActive] = useState(false);

    // Popups
    const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
    const [gameOver, setGameOver] = useState<GameOver | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const connectionStartedRef = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isPlayer1Ref = useRef(false);

    // Auth + connect
    useEffect(() => {
        if (connectionStartedRef.current) return;
        
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!userId || !token || !roomId) { router.push("/multiplayer"); return; }

        connectionStartedRef.current = true;

        // get match info from session
        const stored = sessionStorage.getItem("multiplayerRoom");
        if (stored) {
            const info = JSON.parse(stored);
            setMyUsername(info.you.username);
            setOpponentUsername(info.opponent.username);
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/status/${userId}`, {
                    headers: { "x-token": token },
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setUserData(data);
                if (!myUsername) setMyUsername(data.username);
            } catch {
                router.push("/");
                return;
            }

            // connect WebSocket to game room
            const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("http", "ws");
            const ws = new WebSocket(`${wsUrl}/ws/multiplayer?user_id=${userId}&token=${token}&room_id=${roomId}`);
            wsRef.current = ws;

            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                handleWsMessage(data);
            };

            ws.onclose = () => {
                stopTimer();
            };
        };
        fetchUser();

        return () => {
            wsRef.current?.close();
            stopTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopTimer = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setTimerActive(false);
    };

    const startTimer = () => {
        stopTimer();
        setTimerSeconds(60);
        setTimerActive(true);
        timerRef.current = setInterval(() => {
            setTimerSeconds(prev => {
                if (prev <= 1) { stopTimer(); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleWsMessage = useCallback((data: any) => {
        switch (data.type) {
            case "game_start": {
                setNpcName(data.npc.name);
                setNpcJob(data.npc.job);
                setRelationship(data.npc.relationship);
                setLocation(data.npc.location);
                setCurrentTurn(1);

                const msgs: Message[] = [];
                if (data.start_context) {
                    msgs.push({ role: "npc", content: data.start_context, type: "start_context" });
                }
                if (data.npc_say) {
                    msgs.push({ role: "npc", content: data.npc_say, type: "normal", npc_behavior: data.npc_behavior });
                }
                setMessages(msgs);
                setAnswered(false);
                setOpponentAnswered(false);
                setPageLoading(false); // Tắt loading khi đã có dữ liệu game
                startTimer();
                break;
            }

            case "npc_message": {
                setCurrentTurn(data.turn);
                setMessages(prev => [
                    ...prev,
                    { role: "npc", content: data.npc_say, type: "normal", npc_behavior: data.npc_behavior },
                ]);
                setAnswered(false);
                setOpponentAnswered(false);
                setGameLoading(false);
                startTimer();
                break;
            }

            case "you_answered":
                setAnswered(true);
                break;

            case "opponent_answered":
                setOpponentAnswered(true);
                break;

            case "round_result": {
                stopTimer();
                setGameLoading(false);
                const rr = data as RoundResult;

                // determine if we are player1 or player2
                const storedInfo = sessionStorage.getItem("multiplayerRoom");
                if (storedInfo) {
                    const info = JSON.parse(storedInfo);
                    isPlayer1Ref.current = info.you.username === rr.p1_username;
                }

                const isP1 = isPlayer1Ref.current;
                setMyTotalScore(isP1 ? rr.total_p1 : rr.total_p2);
                setOpponentTotalScore(isP1 ? rr.total_p2 : rr.total_p1);

                // add user messages to chat
                const myMsg = isP1 ? rr.p1_msg : rr.p2_msg;
                const oppMsg = isP1 ? rr.p2_msg : rr.p1_msg;
                const myName = isP1 ? rr.p1_username : rr.p2_username;
                const oppName = isP1 ? rr.p2_username : rr.p1_username;
                const myScore = isP1 ? rr.p1_score : rr.p2_score;
                const oppScore = isP1 ? rr.p2_score : rr.p1_score;
                const iWon = myScore > oppScore;
                const oppWon = oppScore > myScore;

                setMessages(prev => {
                    // Tránh duplicate bằng cách lọc tin nhắn npc cuối cùng nếu cần, 
                    // nhưng quan trọng là logic thêm user message ở đây chỉ chạy 1 lần khi nhận rr
                    const updated = [...prev];
                    if (myMsg) {
                        updated.push({ role: "user", content: myMsg, type: "normal", username: myName, isLoser: oppWon });
                    }
                    if (oppMsg) {
                        updated.push({ role: "user", content: oppMsg, type: "normal", username: oppName, isLoser: iWon });
                    }
                    return updated;
                });

                setRoundResult(rr);
                break;
            }

            case "game_over": {
                stopTimer();
                setGameOver(data as GameOver);
                break;
            }

            case "opponent_disconnected": {
                stopTimer();
                setGameOver({
                    result: "win",
                    total_your: myTotalScore,
                    total_opponent: opponentTotalScore,
                    xp_change: data.xp_change || 30,
                    opponent_username: opponentUsername,
                });
                break;
            }

            case "both_afk_penalty": {
                stopTimer();
                setGameOver({
                    result: "lose",
                    total_your: myTotalScore,
                    total_opponent: opponentTotalScore,
                    xp_change: data.xp_change || -10,
                    opponent_username: opponentUsername,
                });
                break;
            }

            case "error":
                console.error("WS error:", data.message);
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myTotalScore, opponentTotalScore, opponentUsername]);

    const handleSendMessage = (content: string) => {
        if (!content.trim() || answered || !wsRef.current) return;
        wsRef.current.send(JSON.stringify({
            type: "user_answer",
            content: content.trim(),
        }));
        setGameLoading(true);
    };

    const handleRoundPopupClose = () => {
        setRoundResult(null);
    };

    if (pageLoading) return <Loading />;
    if (userData?.role === "ADMIN") return <AdminWarning modeName="Multiplayer" />;

    if (gameOver) {
        return (
            <MultiplayerResultPopup
                result={gameOver.result}
                myScore={gameOver.total_your}
                opponentScore={gameOver.total_opponent}
                xpChange={gameOver.xp_change}
                opponentUsername={gameOver.opponent_username}
                myUsername={myUsername}
                onBackToLobby={() => router.push("/multiplayer")}
            />
        );
    }

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] font-sans text-white">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_3px,transparent_3px),linear-gradient(to_bottom,#80808012_3px,transparent_3px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />

            <div className="relative z-10 flex h-screen gap-6 p-6">
                {/* LEFT: Profile */}
                <ProfilePanel
                    npcName={npcName}
                    npcJob={npcJob}
                    relationship={relationship}
                    location={location}
                    num={[]}
                />

                {/* CENTER: Chat */}
                <MultiplayerChatWindow
                    messages={messages}
                    gameLoading={gameLoading}
                    npcName={npcName}
                    onSendMessage={handleSendMessage}
                    currentTurn={currentTurn}
                    maxTurns={10}
                    timerSeconds={timerSeconds}
                    answered={answered}
                    opponentAnswered={opponentAnswered}
                    myUsername={myUsername}
                />

                {/* RIGHT: Home + Scores */}
                <div className="flex flex-col gap-4 min-w-fit">
                    <HomeButton />
                    <DualScoreBar
                        myUsername={myUsername}
                        opponentUsername={opponentUsername}
                        myScore={myTotalScore}
                        opponentScore={opponentTotalScore}
                    />
                </div>
            </div>

            {/* Round Result Popup */}
            {roundResult && (
                <RoundResultPopup
                    result={roundResult}
                    myUsername={myUsername}
                    isPlayer1={isPlayer1Ref.current}
                    onClose={handleRoundPopupClose}
                />
            )}
        </main>
    );
}
