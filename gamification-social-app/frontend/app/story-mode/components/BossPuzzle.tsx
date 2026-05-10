"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface BossPuzzleProps {
    userId: string;
    token: string;
}

export default function BossPuzzle({ userId, token }: BossPuzzleProps) {
    const router = useRouter();
    const [tiles, setTiles] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("'Cháu hãy sắp xếp lại các mảnh ghép để hoàn thiện bức tranh.'");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSolved, setIsSolved] = useState(false);

    // Initial shuffle (must be solvable for a 3x3 sliding puzzle)
    const initPuzzle = useCallback(() => {
        let newTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

        // Simple shuffle: make 100 random valid moves from solved state
        let emptyIdx = 8;
        for (let i = 0; i < 200; i++) {
            const neighbors = getNeighbors(emptyIdx);
            const moveIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
            [newTiles[emptyIdx], newTiles[moveIdx]] = [newTiles[moveIdx], newTiles[emptyIdx]];
            emptyIdx = moveIdx;
        }

        setTiles(newTiles);
        setLoading(false);
    }, []);

    function getNeighbors(idx: number) {
        const neighbors = [];
        const x = idx % 3;
        const y = Math.floor(idx / 3);
        if (x > 0) neighbors.push(idx - 1);
        if (x < 2) neighbors.push(idx + 1);
        if (y > 0) neighbors.push(idx - 3);
        if (y < 2) neighbors.push(idx + 3);
        return neighbors;
    }

    useEffect(() => {
        initPuzzle();
    }, [initPuzzle]);

    const handleTileClick = (idx: number) => {
        if (isSolved || isSubmitting) return;

        const emptyIdx = tiles.indexOf(8);
        const neighbors = getNeighbors(emptyIdx);

        if (neighbors.includes(idx)) {
            const newTiles = [...tiles];
            [newTiles[emptyIdx], newTiles[idx]] = [newTiles[idx], newTiles[emptyIdx]];
            setTiles(newTiles);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/game/boss-challenge?user_id=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-token": token,
                },
                body: JSON.stringify(tiles),
            });

            if (!res.ok) throw new Error("Submission failed");

            const result = await res.json();
            setMessage(result.message);

            if (result.is_correct) {
                setIsSolved(true);
                // Delay before redirecting to winner screen or lobby
                setTimeout(() => {
                    router.push("/story-mode");
                }, 4000);
            }
        } catch (error) {
            setMessage("Lỗi kết nối. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
            <div className="max-w-xl w-full bg-black/80 border-2 border-cyan-500/30 p-8 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.15)]">
                {/* Boss Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase mb-2">
                        THE <span className="text-cyan-400 drop-shadow-[0_0_10px_#00F0FF]">FINAL</span> CHALLENGE
                    </h2>
                    <div className="h-1 w-32 bg-cyan-500/50 mx-auto rounded-full"></div>
                </div>

                {/* Dialog Box */}
                <div className="relative p-6 border border-white/10 bg-white/5 rounded-lg mb-8 min-h-[100px] flex items-center">
                    <div className="absolute -top-3 left-6 px-3 py-0.5 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest">
                        CU PHAN
                    </div>
                    <p className="text-gray-200 italic text-lg leading-relaxed text-center w-full">
                        {message}
                    </p>
                </div>

                {/* Sliding Puzzle Grid */}
                <div className="grid grid-cols-3 gap-2 aspect-square w-full max-w-[400px] mx-auto bg-white/5 p-2 rounded-lg border border-white/10 mb-8">
                    {tiles.map((targetIdx, currentIdx) => {
                        if (targetIdx === 8) {
                            return <div key={currentIdx} className="bg-black/40 rounded-sm"></div>;
                        }
                        return (
                            <button
                                key={currentIdx}
                                onClick={() => handleTileClick(currentIdx)}
                                className="relative aspect-square bg-cover bg-no-repeat rounded-sm border border-white/10 hover:border-cyan-400/50 transition-all duration-200 active:scale-95 group"
                                style={{
                                    backgroundImage: "url('/puzzle.webp')",
                                    backgroundSize: "300% 300%",
                                    backgroundPosition: `${(targetIdx % 3) * 50}% ${Math.floor(targetIdx / 3) * 50}%`,
                                }}
                            >
                                <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors"></div>
                                <div className="absolute top-1 right-1 text-[10px] font-bold text-white/20">{targetIdx + 1}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={initPuzzle}
                        disabled={isSubmitting || isSolved}
                        className="flex-[2] py-4 border border-white/10 rounded font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                    >
                        XÁO TRỘN LẠI
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isSolved}
                        className="flex-[2] py-4 bg-cyan-500 rounded font-black text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                ĐANG KIỂM TRA...
                            </>
                        ) : (
                            "GỬI ĐÁP ÁN"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
