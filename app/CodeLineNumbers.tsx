import React from "react";

/** Invisible text mirrors wrapping so numbers stay with logical source lines. */
export default function CodeLineNumbers({ text, minimumLines = 1 }: { text: string; minimumLines?: number }) {
  const lines = text.split("\n");
  while (lines.length < minimumLines) lines.push("");
  return <div className="code-line-ruler" aria-hidden="true">{lines.map((line, index) => <div className="code-line-ruler-row" key={index}><span className="code-line-number">{index + 1}</span><code className="code-line-measure">{line || "\u00a0"}</code></div>)}</div>;
}
