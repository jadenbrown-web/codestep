"use client";

import { useEffect, useState } from "react";

export default function useQuickCodeReveal(code: string, replayKey: string) {
  const [reveal, setReveal] = useState({ code, key: replayKey, length: 0 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReveal({ code, key: replayKey, length: code.length });
      return;
    }
    const started = performance.now();
    const duration = Math.min(900, Math.max(180, code.length * 2));
    let frame = 0;
    setReveal({ code, key: replayKey, length: 0 });
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      setReveal({ code, key: replayKey, length: Math.floor(code.length * progress) });
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [code, replayKey]);
  return reveal.code === code && reveal.key === replayKey ? code.slice(0, reveal.length) : "";
}
