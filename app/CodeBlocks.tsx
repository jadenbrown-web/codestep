"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type DragEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { availableCodeBlocks, splitCodeBlocks } from "./code-blocks";

type Drag = { text: string; from?: number; startX: number; startY: number; x: number; y: number; moved: boolean };

export default function CodeBlocks({ code, answer, onChange, renderCode }: { code: string; answer: string; onChange: (code: string) => void; renderCode: (code: string) => ReactNode }) {
  const lines = splitCodeBlocks(code);
  const choices = availableCodeBlocks(answer, code);
  const latestCode = useRef(code);
  latestCode.current = code;
  const program = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const [preview, setPreview] = useState<Drag | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [openActions, setOpenActions] = useState<number | null>(null);

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  function insert(text: string, at = lines.length, from?: number) {
    setOpenActions(null);
    if (from === undefined && !availableCodeBlocks(answer, latestCode.current).some(block => block.text === text)) return;
    const next = splitCodeBlocks(latestCode.current);
    if (from !== undefined) { next.splice(from, 1); if (from < at) at--; }
    next.splice(at, 0, text);
    latestCode.current = next.join("\n");
    onChange(latestCode.current);
    setMessage(from === undefined ? "Block added." : "Block moved.");
  }

  function dropIndex(x: number, y: number) {
    const box = program.current?.getBoundingClientRect();
    if (!box || x < box.left || x > box.right || y < box.top || y > box.bottom) return null;
    const rows = Array.from(program.current!.querySelectorAll<HTMLElement>("[data-code-row]"));
    const index = rows.findIndex(row => { const bounds = row.getBoundingClientRect(); return y < bounds.top + bounds.height / 2; });
    return index < 0 ? rows.length : index;
  }

  function animateDrag() {
    const current = drag.current;
    if (!current?.moved) return;
    const box = program.current?.getBoundingClientRect();
    if (box && current.x >= box.left && current.x <= box.right && current.y >= box.top && current.y <= box.bottom) {
      if (current.y < box.top + 48) program.current!.scrollTop -= 9;
      else if (current.y > box.bottom - 48) program.current!.scrollTop += 9;
    }
    if (current.y < 70) window.scrollBy(0, -10);
    else if (current.y > window.innerHeight - 70) window.scrollBy(0, 10);
    setTarget(dropIndex(current.x, current.y));
    frame.current = requestAnimationFrame(animateDrag);
  }

  function start(event: PointerEvent<HTMLButtonElement>, text: string, from?: number) {
    if (event.button !== 0 || !event.isPrimary) return;
    setOpenActions(null);
    suppressClick.current = false;
    drag.current = { text, from, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current) return;
    current.x = event.clientX; current.y = event.clientY;
    if (!current.moved && Math.hypot(current.x - current.startX, current.y - current.startY) > 6) {
      current.moved = true;
      suppressClick.current = true;
      setMessage("Dragging block. Drop it into your code.");
      frame.current = requestAnimationFrame(animateDrag);
    }
    if (current.moved) { event.preventDefault(); setPreview({ ...current }); setTarget(dropIndex(current.x, current.y)); }
  }

  function cancel() {
    drag.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setPreview(null); setTarget(null);
  }

  function end(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (current?.moved) {
      const at = dropIndex(event.clientX, event.clientY);
      if (at !== null) insert(current.text, at, current.from);
      else setMessage("Drop cancelled. Your code is unchanged.");
    }
    cancel();
  }
  const pointerHandlers = { onPointerMove: move, onPointerUp: end, onPointerCancel: cancel, onLostPointerCapture: cancel, onDragStart: (event: DragEvent) => event.preventDefault(), onKeyDown: (event: KeyboardEvent) => { if (event.key === "Escape") cancel(); } };

  return <div className={`block-builder ${preview ? "is-dragging" : ""}`}>
    <p className="block-instructions">Drag a block into your code. Drag it again to change its position. You can also tap to add.</p>
    <div ref={program} className={`block-program ${preview ? "accepting-block" : ""}`} role="group" aria-label="Your code blocks">
      {lines.map((line, i) => <div key={i} data-code-row={i} className={`block-row ${target === i ? "drop-active" : ""} ${preview?.from === i ? "block-source" : ""}`}>
        <span className="block-number">{i + 1}</span>
        <button className="placed-block" aria-label={`Drag line ${i + 1}: ${line || "Blank line"}`} onPointerDown={event => start(event, line, i)} {...pointerHandlers}><span className="block-grip" aria-hidden="true">⠿</span><code>{renderCode(line || "Blank line")}</code></button>
        <div className={`block-row-actions ${openActions === i ? "actions-open" : ""}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenActions(null); }} onKeyDown={event => { if (event.key === "Escape") { setOpenActions(null); event.currentTarget.querySelector<HTMLButtonElement>(".block-options-toggle")?.focus(); } }}>
          <button className="block-options-toggle" aria-label={`Options for block ${i + 1}`} aria-expanded={openActions === i} onClick={() => setOpenActions(openActions === i ? null : i)}>⋯</button>
          <div className="block-action-buttons">
          <button aria-label={`Move line ${i + 1} up`} disabled={i === 0} onClick={() => insert(line, i - 1, i)}>↑</button>
          <button aria-label={`Move line ${i + 1} down`} disabled={i === lines.length - 1} onClick={() => insert(line, i + 2, i)}>↓</button>
          <button aria-label={`Remove line ${i + 1}`} onClick={() => { setOpenActions(null); latestCode.current = lines.filter((_, n) => n !== i).join("\n"); onChange(latestCode.current); setMessage("Block returned to the tray."); }}>×</button>
          </div>
        </div>
      </div>)}
      <div className={`block-drop-end ${target === lines.length ? "drop-active" : ""}`}>{preview ? "Drop your block here" : lines.length ? "Drag a block here to add it at the end" : "Drag your first block here"}</div>
    </div>
    <div className="block-bank" role="group" aria-label="Available code blocks">
      <b>Lesson blocks</b>
      <div className="block-choices">{choices.map(({ text, id }) => <button key={id} className={`code-block-choice ${preview?.text === text && preview.from === undefined ? "block-source" : ""}`} onPointerDown={event => start(event, text)} {...pointerHandlers} onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } insert(text); }}><span className="block-grip" aria-hidden="true">⠿</span><code>{renderCode(text.trim())}</code></button>)}</div>
      {!choices.length && <p className="block-instructions">All lesson blocks are in your code.</p>}
      <small>Each block can be placed once. Remove it from your code to return it here. Parentheses stay attached to their code.</small>
    </div>
    {preview && createPortal(<div className="block-drag-preview" aria-hidden="true" style={{ left: Math.max(8, Math.min(preview.x - 60, window.innerWidth - Math.min(330, window.innerWidth - 24) - 8)), top: Math.max(8, preview.y - 68), width: Math.min(330, window.innerWidth - 24) }}><span className="block-grip">⠿</span><code>{renderCode(preview.text)}</code></div>, document.body)}
    <span className="block-announcement" role="status" aria-live="polite">{message}</span>
  </div>;
}
