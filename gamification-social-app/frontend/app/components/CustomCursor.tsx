"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function CustomCursor() {
  const targetPos = useRef({ x: -100, y: -100 });
  const trailingPos = useRef({ x: -100, y: -100 });
  const isInteracting = useRef(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const lowerLipRef = useRef<SVGGElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const SIZE = 64; // Increased size as requested
  const HALF = SIZE / 2;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetPos.current.x = e.clientX;
    targetPos.current.y = e.clientY;
    if (!visible) setVisible(true);
  }, [visible]);

  const handleInteractionStart = useCallback(() => {
    isInteracting.current = true;
    setIsOpen(true);
  }, []);

  const isInteractiveElement = (target: HTMLElement) => {
    const tag = target.tagName?.toLowerCase();
    return (
      tag === "a" ||
      tag === "button" ||
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      tag === "label" ||
      target.getAttribute("role") === "button" ||
      target.closest("a") !== null ||
      target.closest("button") !== null ||
      target.closest("[role='button']") !== null ||
      window.getComputedStyle(target).cursor === "pointer"
    );
  };

  const handleInteractionEnd = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!isInteractiveElement(target)) {
      isInteracting.current = false;
      setIsOpen(false);
    }
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (isInteractiveElement(target)) {
      isInteracting.current = true;
      setIsOpen(true);
    }
  }, []);

  const handleMouseOut = useCallback(() => {
    isInteracting.current = false;
    setIsOpen(false);
  }, []);

  const handleMouseLeaveWindow = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleInteractionStart);
    document.addEventListener("mouseup", handleInteractionEnd);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleInteractionStart);
      document.removeEventListener("mouseup", handleInteractionEnd);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
    };
  }, [
    handleMouseMove,
    handleInteractionStart,
    handleInteractionEnd,
    handleMouseOver,
    handleMouseOut,
    handleMouseLeaveWindow,
  ]);

  // High performance DOM loop (60fps without React state re-renders)
  useEffect(() => {
    let rafId: number;
    let initialized = false;

    const loop = () => {
      if (!initialized && targetPos.current.x !== -100) {
        trailingPos.current.x = targetPos.current.x;
        trailingPos.current.y = targetPos.current.y;
        initialized = true;
      }

      if (isInteracting.current) {
        trailingPos.current.x = targetPos.current.x;
        trailingPos.current.y = targetPos.current.y;
      } else {
        const dx = targetPos.current.x - trailingPos.current.x;
        const dy = targetPos.current.y - trailingPos.current.y;
        trailingPos.current.x += dx * 0.25; // Smoother catch-up
        trailingPos.current.y += dy * 0.25;
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${targetPos.current.x - HALF}px`;
        cursorRef.current.style.top = `${targetPos.current.y - HALF}px`;
      }

      if (lowerLipRef.current) {
        const tx = trailingPos.current.x - targetPos.current.x;
        const ty = trailingPos.current.y - targetPos.current.y;
        lowerLipRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [HALF]);

  const color = isOpen ? "#39FF14" : "#00F0FF";
  
  // Custom paths: strictly 15px thickness for both lips to ensure perfect symmetry and avoid overlapping/inversion.
  
  // Upper Lip (Cupid's bow)
  // Closed: Top middle Y=35, Bottom middle Y=50
  const upperClosed = "M 15 50 Q 32 15 50 35 Q 68 15 85 50 Q 50 50 15 50 Z";
  // Open: Top middle Y=25, Bottom middle Y=40
  const upperOpen   = "M 15 50 Q 32 5 50 25 Q 68 5 85 50 Q 50 40 15 50 Z";

  // Lower Lip
  // Closed: Top middle Y=50, Bottom middle Y=65 (using Q 80 means curve reaches 65)
  const lowerClosed = "M 15 50 Q 50 50 85 50 Q 50 80 15 50 Z";
  // Open: Top middle Y=60 (Q 70), Bottom middle Y=75 (Q 100)
  const lowerOpen   = "M 15 50 Q 50 70 85 50 Q 50 100 15 50 Z";

  // Mouth Hole (Black background between the lips when open)
  const holeClosed = "M 15 50 Q 50 50 85 50 Q 50 50 15 50 Z";
  const holeOpen   = "M 15 50 Q 50 40 85 50 Q 50 70 15 50 Z";

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        width: SIZE,
        height: SIZE,
        pointerEvents: "none",
        zIndex: 99999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease, color 0.2s ease, filter 0.2s ease",
        color: color,
        filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color})`,
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Mouth Hole (dark inside) */}
        <path
          d={isOpen ? holeOpen : holeClosed}
          fill="#020202"
          style={{ transition: "d 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />

        {/* UPPER LIP */}
        <path
          d={isOpen ? upperOpen : upperClosed}
          fill="#050505"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ transition: "d 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />

        {/* LOWER LIP (trailing effect applied via ref) */}
        <g ref={lowerLipRef}>
          <path
            d={isOpen ? lowerOpen : lowerClosed}
            fill="#050505"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            style={{ transition: "d 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </g>
      </svg>
    </div>
  );
}
