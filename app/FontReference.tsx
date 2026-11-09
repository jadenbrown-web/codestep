import React from 'react';

export const FONT_FAMILIES = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Garamond', 'Courier New', 'Lucida Console', 'Comic Sans MS', 'Impact', 'Palatino Linotype', 'Brush Script MT', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
export default function FontReference({language, onNext, actions}: {language: string; onNext: () => void; actions?: React.ReactNode}) {
  return <section className="html-text-reference font-examples-reference" aria-label="Font examples">
    <div className="font-featured-example" aria-label="Font code example">
      <div className="font-example-heading"><b>Example · Courier New</b>{actions && <div className="desktop-pane-actions">{actions}</div>}</div>
      <code>{language === 'html' ? `<p style="font-family: 'Courier New';">Courier New</p>` : `p { font-family: 'Courier New'; }`}</code>
      <span>Replace <strong>Courier New</strong> with a font name below to try it.</span>
    </div>
    <div className="html-tag-grid font-example-grid">{FONT_FAMILIES.map(font => {
      const family = font.includes(' ') ? `'${font}'` : font;
      const label = font === 'system-ui' ? 'System UI' : font.charAt(0).toUpperCase() + font.slice(1);
      return <article className="html-tag-example" data-font={font} data-example={font === 'Courier New' || undefined} key={font}>
        <b className="font-example-label">{label}{font === 'Courier New' && <small>Example above</small>}</b>
        <p className="font-example-sample" style={{fontFamily:family}}>{label}</p>
      </article>;
    })}</div>
    <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue to the next lesson →</button></footer>
  </section>;
}
