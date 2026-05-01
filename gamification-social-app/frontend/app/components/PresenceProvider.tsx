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
    const [onlineCount, setOnlineCount] = useState<number | null>(null);
    const pathname = usePathname();

    // Cập nhật sessionUserId khi chuyển trang (để nhận diện login/logout)
    useEffect(() => {
        const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        if (userId !== sessionUserId) {
            setSessionUserId(userId);
        }
    }, [pathname, sessionUserId]);

    useEffect(() => {
        // Nếu không có userId (chưa login), không join channel
        if (!sessionUserId) {
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
                setOnlineCount(Object.keys(state).length);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({ user_id: sessionUserId, online_at: new Date().toISOString() });
                }
            });

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
        };
    }, [sessionUserId]); // Chỉ chạy lại khi userId thay đổi thật sự (Login/Logout)

    return (
        <PresenceContext.Provider value={{ onlineCount }}>
            {children}
        </PresenceContext.Provider>
    );
}
