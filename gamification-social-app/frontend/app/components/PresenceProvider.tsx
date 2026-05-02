"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

interface PresenceContextType {
    onlineCount: number | null;
}

const PresenceContext = createContext<PresenceContextType>({ onlineCount: null });

export const usePresence = () => useContext(PresenceContext);

export default function PresenceProvider({ children }: { children: React.ReactNode }) {
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [onlineCount, setOnlineCount] = useState<number | null>(null);
    const pathname = usePathname();

    // 1. Cập nhật sessionUserId khi chuyển trang (để nhận diện login/logout)
    useEffect(() => {
        const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        if (userId !== sessionUserId) {
            setSessionUserId(userId);
        }
    }, [pathname, sessionUserId]);

    // 2. Fetch role từ backend mỗi khi sessionUserId thay đổi (không tin tưởng localStorage)
    useEffect(() => {
        if (!sessionUserId) {
            setUserRole(null);
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/status/${sessionUserId}`, {
            headers: { "x-token": token }
        })
        .then(res => res.json())
        .then(data => {
            setUserRole(data.role || "PLAYER");
        })
        .catch(() => setUserRole("PLAYER"));
    }, [sessionUserId]);

    // 3. Chỉ kết nối/ngắt kết nối khi sessionUserId hoặc userRole thay đổi thật sự
    useEffect(() => {
        if (!sessionUserId || !userRole) {
            setOnlineCount(null);
            return;
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
        );

        const channel = supabase.channel("app-presence", {
            config: { presence: { key: sessionUserId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                // Chỉ đếm số lượng User ID duy nhất có role là PLAYER
                const playerUserIds = Object.keys(state).filter((key) => {
                    const presences = state[key] as any[];
                    return presences.some((p) => p.role === "PLAYER");
                });
                setOnlineCount(playerUserIds.length);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({ 
                        user_id: sessionUserId, 
                        role: userRole,
                        online_at: new Date().toISOString() 
                    });
                }
            });

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
        };
    }, [sessionUserId, userRole]); // Chỉ chạy lại khi userId thay đổi thật sự (Login/Logout)

    return (
        <PresenceContext.Provider value={{ onlineCount }}>
            {children}
        </PresenceContext.Provider>
    );
}
