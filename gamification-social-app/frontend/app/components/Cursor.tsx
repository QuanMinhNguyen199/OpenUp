"use client";
import { useEffect } from "react";

export default function Cursor() {
    useEffect(() => {
        const dot = document.createElement("div");
        dot.className = "cursor-dot";
        document.body.appendChild(dot);

        const move = (e: MouseEvent) => {
            // dot.style.left = e.clientX + "px";
            // dot.style.top = e.clientY + "px";
            // dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        };

        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return null;
}