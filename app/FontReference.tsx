import React from 'react';

export const FONT_FAMILIES = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Garamond', 'Courier New', 'Lucida Console', 'Comic Sans MS', 'Impact', 'Palatino Linotype', 'Brush Script MT', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
export default function FontReference({language, onNext}: {language: string; onNext: () => void}) {
  return <section className="html-text-reference font-examples-reference" aria-label="Font examples">
    <header className="html-reference-header"><b>Font families</b><span>20 separate examples</span></header>
    <div className="html-tag-grid font-example-grid">{FONT_FAMILIES.map(font => {
      const family = font.includes(' ') ? `'${font}'` : font;
      const label = font === 'system-ui' ? 'System UI' : font.charAt(0).toUpperCase() + font.slice(1);
      return <article className="html-tag-example" data-font={font} key={font}>
        <code className="html-tag-code">{language === 'html' ? `<p style="font-family: ${family};">${label}</p>` : `font-family: ${family};`}</code>
        <p className="font-example-sample" style={{fontFamily:family}}>{label}</p>
      </article>;
    })}</div>
    <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue to the next lesson →</button></footer>
  </section>;
}
