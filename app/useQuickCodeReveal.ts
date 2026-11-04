"use client";

import { useEffect, useState } from "react";
import { CODE_TYPING_START_DELAY, codeTypingDelay } from "./typing-rhythm";

export default function useQuickCodeReveal(code: string, replayKey: string, enabled = true) {
  const [reveal, setReveal] = useState({ code, key: replayKey, length: 0 });
  useEffect(() => {
    if (!enabled) { setReveal({ code, key: replayKey, length: 0 }); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReveal({ code, key: replayKey, length: code.length });
      return;
    }
    let position = 0;
    let timer: ReturnType<typeof setTimeout>;
    setReveal({ code, key: replayKey, length: 0 });
    if (!code) return;
    const typeCharacter = () => {
      position += 1;
      setReveal({ code, key: replayKey, length: position });
      if (position < code.length) timer = setTimeout(typeCharacter, codeTypingDelay(code[position - 1], position));
    };
    timer = setTimeout(typeCharacter, CODE_TYPING_START_DELAY);
    return () => clearTimeout(timer);
  }, [code, replayKey, enabled]);
  return enabled && reveal.code === code && reveal.key === replayKey ? code.slice(0, reveal.length) : "";
}
