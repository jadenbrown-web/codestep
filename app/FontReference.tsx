import CopyCodeButton from "./CopyCodeButton";
import React, {useState} from 'react';

export const FONT_FAMILIES = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Garamond', 'Courier New', 'Lucida Console', 'Comic Sans MS', 'Impact', 'Palatino Linotype', 'Brush Script MT', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
export default function FontReference({language, onNext, actions}: {language: string; onNext: () => void; actions?: React.ReactNode}) {
  const [selected, setSelected] = useState('Courier New');
  const selectedFamily = selected.includes(' ') ? `'${selected}'` : selected;
  const selectedLabel = selected === 'system-ui' ? 'System UI' : selected.charAt(0).toUpperCase() + selected.slice(1);
  const exampleCode = language === 'html' ? `<p style="font-family: ${selectedFamily};">${selectedLabel}</p>` : `p { font-family: ${selectedFamily}; }`;
  return <section className="html-text-reference font-examples-reference" aria-label="Font examples">
    <div className="font-featured-example" aria-label="Font code example">
      <div className="font-example-heading"><b>Example · {selectedLabel}</b>{actions && <div className="desktop-pane-actions">{actions}</div>}</div>
      <div className="visual-example-code"><code>{exampleCode}</code><CopyCodeButton iconOnly code={exampleCode} label="font example" /></div>
      <span>Choose a font below to see its code here. Copy the example to use it in your page.</span>
    </div>
    <div className="html-tag-grid font-example-grid">{FONT_FAMILIES.map(font => {
      const family = font.includes(' ') ? `'${font}'` : font;
      const label = font === 'system-ui' ? 'System UI' : font.charAt(0).toUpperCase() + font.slice(1);
      return <article className="html-tag-example" data-font={font} data-example={font === selected || undefined} key={font}>
        <button className="visual-example-choice" aria-label={`Show ${label} code`} aria-pressed={font === selected} onClick={() => setSelected(font)}>
          <b className="font-example-label">{label}{font === selected && <small>Example above</small>}</b>
          <span className="font-example-sample" style={{fontFamily:family}}>{label}</span>
        </button>
      </article>;
    })}</div>
    <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue to the next lesson →</button></footer>
  </section>;
}
