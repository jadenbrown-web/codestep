"use client";
import React, {useEffect, useState} from "react";

async function copyCodeText(value: string) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true; }
  } catch { /* Try the browser's selection-based copy below. */ }
  const previous = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  // A modal dialog makes elements outside it inert.
  (document.querySelector("dialog[open]") ?? document.body).appendChild(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand("copy"); } catch {}
  field.remove();
  previous?.focus();
  return copied;
}

export default function CopyCodeButton({ code, label, text = "Copy code", iconOnly = false }: { code: string; label: string; text?: string; iconOnly?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => { setStatus("idle"); }, [code]);
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2400);
    return () => clearTimeout(timer);
  }, [status]);
  return <span className="copy-code-control"><button className="copy-code-button" title={status === "failed" ? "Select the code and copy it manually." : "Copy code with its indentation and line breaks"} aria-label={`Copy ${label} code`} disabled={!code.trim()} onClick={async () => setStatus(await copyCodeText(code) ? "copied" : "failed")}>{iconOnly ? <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{status === "copied" ? <path d="m5 12 4 4L19 6"/> : status === "failed" ? <path d="M12 4v10m0 4v2"/> : <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>}</svg> : status === "copied" ? "Copied" : status === "failed" ? "Copy blocked" : text}</button><span className="copy-code-status" role="status">{status === "copied" ? "Code copied." : status === "failed" ? "Copy was blocked. Select the code and copy it manually." : ""}</span></span>;
}

