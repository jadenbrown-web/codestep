"use client";

import { useRef, useState, type PointerEvent } from "react";

type Drag = { text: string; from?: number; x: number; y: number; moved: boolean };

export default function CodeBlocks({ code, answer, onChange }: { code: string; answer: string; onChange: (code: string) => void }) {
  const lines = code ? code.split("\n") : [];
  const choices = [...new Set(answer.split("\n").filter(line => line.trim()))].sort((a, b) => a.trim().localeCompare(b.trim()));
  const drag = useRef<Drag | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  function insert(text: string, at = lines.length, from?: number) {
    const next = [...lines];
    if (from !== undefined) { next.splice(from, 1); if (from < at) at--; }
    next.splice(at, 0, text);
    onChange(next.join("\n"));
    setMessage(from === undefined ? "Block added." : "Block moved.");
  }
  function start(event: PointerEvent<HTMLButtonElement>, text: string, from?: number) {
    if (event.button !== 0) return;
    drag.current = { text, from, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current) return;
    current.moved ||= Math.hypot(event.clientX - current.x, event.clientY - current.y) > 8;
    if (!current.moved) return;
    const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-block-drop]");
    setTarget(zone ? Number(zone.dataset.blockDrop) : null);
  }
  function end(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (current?.moved) {
      const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-block-drop]");
      if (zone) insert(current.text, Number(zone.dataset.blockDrop), current.from);
    }
    drag.current = null;
    setTarget(null);
  }
  const pointerHandlers = { onPointerMove: move, onPointerUp: end, onPointerCancel: () => { drag.current = null; setTarget(null); } };

  return <div className="block-builder">
    <p className="block-instructions">Tap a block to add it, or drag its ⠿ handle into your code. Use the arrows to change the order.</p>
    <div className="block-program" role="group" aria-label="Your code blocks">
      {lines.map((line, i) => <div key={i} data-block-drop={i} className={`block-row ${target === i ? "drop-active" : ""}`}>
        <span className="block-number">{i + 1}</span>
        <div className="placed-block"><code>{line || "Blank line"}</code></div>
        <div className="block-row-actions">
          <button className="block-drag-handle" aria-label={`Drag line ${i + 1}`} onPointerDown={event => start(event, line, i)} {...pointerHandlers}>⠿</button>
          <button aria-label={`Move line ${i + 1} up`} disabled={i === 0} onClick={() => insert(line, i - 1, i)}>↑</button>
          <button aria-label={`Move line ${i + 1} down`} disabled={i === lines.length - 1} onClick={() => insert(line, i + 2, i)}>↓</button>
          <button aria-label={`Remove line ${i + 1}`} onClick={() => { onChange(lines.filter((_, n) => n !== i).join("\n")); setMessage("Block removed."); }}>×</button>
        </div>
      </div>)}
      <div data-block-drop={lines.length} className={`block-drop-end ${target === lines.length ? "drop-active" : ""}`}>{lines.length ? "Drop here to add at the end" : "Your code starts here"}</div>
    </div>
    <div className="block-bank" role="group" aria-label="Available code blocks">
      <b>Lesson blocks</b>
      <div className="block-choices">{choices.map(text => <div className="block-choice" key={text}><button className="code-block-choice" onClick={() => insert(text)}><span aria-hidden="true">＋</span><code>{text.trim()}</code></button><button className="block-drag-handle" aria-label={`Drag block: ${text.trim()}`} onPointerDown={event => start(event, text)} {...pointerHandlers}>⠿</button></div>)}</div>
      <small>Blocks can be used more than once. Brackets and punctuation are included.</small>
    </div>
    <span className="block-announcement" role="status" aria-live="polite">{message}</span>
  </div>;
}
