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
    const [onlineCount, setOnlineCount] = useState<number | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        
        // Nếu không có userId (chưa login), không join channel
        if (!userId) {
            setOnlineCount(null);
            return;
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
        );

        const channel = supabase.channel("app-presence", {
            config: { presence: { key: userId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                setOnlineCount(Object.keys(state).length);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({ user_id: userId, online_at: new Date().toISOString() });
                }
            });

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
        };
    }, [pathname]); // Re-check khi chuyển trang để đảm bảo vẫn đang online

    return (
        <PresenceContext.Provider value={{ onlineCount }}>
            {children}
        </PresenceContext.Provider>
    );
}
