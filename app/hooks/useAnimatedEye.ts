// src/app/hooks/useAnimatedEye.ts
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook that encapsulates the eye‑blink animation and mouse‑tracking logic used by the
 * password visibility toggle. It returns the blink state, the pupil offset and a ref
 * that should be attached to the button containing the eye.
 */
export const useAnimatedEye = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLButtonElement>(null);

  // Random blink effect – runs continuously while the component is mounted
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000; // 2‑4 s random interval
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        timer = scheduleBlink();
      }, delay);
    };
    let timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  // Mouse‑tracking for pupil – follows the cursor when over the eye button
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = 2.5; // maximum pupil travel radius
      setMouseOffset({
        x: dist === 0 ? 0 : (dx / dist) * Math.min(dist / 40, max),
        y: dist === 0 ? 0 : (dy / dist) * Math.min(dist / 40, max),
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return { isBlinking, mouseOffset, eyeRef };
};
