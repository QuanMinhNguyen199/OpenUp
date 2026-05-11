"use client";

import React from "react";

interface AvatarProps {
  mood?: "happy" | "neutral" | "sad";
  size?: "sm" | "md" | "lg";
  isNpc: boolean;
}

export default function Avatar({
  mood = "neutral",
  size = "md",
  isNpc,
}: AvatarProps) {
  const sizeStyles = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-4xl",
  };

  const moodEmojis = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
  };

  const userEmoji = "👤";

  const emoji = isNpc ? moodEmojis[mood] : userEmoji;

  const borderColor = isNpc ? "border-[#00F0FF]" : "border-[#39FF14]";
  const glowColor = isNpc
    ? "shadow-[0_0_12px_rgba(0,240,255,0.3)]"
    : "shadow-[0_0_12px_rgba(57,255,20,0.3)]";

  return (
    <div
      className={`${sizeStyles[size]} rounded-full flex items-center justify-center border-2 ${borderColor} bg-black/40 ${glowColor} flex-shrink-0`}
    >
      {emoji}
    </div>
  );
}
