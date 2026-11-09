import React, { createElement } from 'react';

type ExampleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'b' | 'strong' | 'i' | 'em' | 'mark' | 'small' | 'del' | 'ins' | 'sub' | 'sup' | 'a';
type TagExample = { tag: ExampleTag; text: string; before?: string; after?: string; code: string };

export const HTML_TEXT_EXAMPLES: TagExample[] = [
  ...([1, 2, 3, 4, 5, 6] as const).map(level => ({ tag: `h${level}` as ExampleTag, text: 'Heading', code: `<h${level}>Heading</h${level}>` })),
  { tag: 'p', text: 'A paragraph.', code: '<p>A paragraph.</p>' },
  { tag: 'b', text: 'Bold text', code: '<b>Bold text</b>' },
  { tag: 'strong', text: 'Important text', code: '<strong>Important text</strong>' },
  { tag: 'i', text: 'Italic text', code: '<i>Italic text</i>' },
  { tag: 'em', text: 'Emphasised text', code: '<em>Emphasised text</em>' },
  { tag: 'mark', text: 'Marked text', code: '<mark>Marked text</mark>' },
  { tag: 'small', text: 'Smaller text', code: '<small>Smaller text</small>' },
  { tag: 'del', text: 'Deleted text', code: '<del>Deleted text</del>' },
  { tag: 'ins', text: 'Inserted text', code: '<ins>Inserted text</ins>' },
  { tag: 'sub', before: 'H', text: '2', after: 'O', code: 'H<sub>2</sub>O' },
  { tag: 'sup', before: '2', text: '3', after: ' = 8', code: '2<sup>3</sup> = 8' },
  { tag: 'a', text: 'Open a page', code: '<a href="page.html">Open a page</a>' },
];

export default function HtmlTextReference({ onNext }: { onNext: () => void }) {
  return <section className="text-reference-preview html-text-reference" aria-label="HTML text examples">
    <header className="html-reference-header"><b>HTML text elements</b><span>{HTML_TEXT_EXAMPLES.length} separate examples</span></header>
    <div className="html-tag-grid">
      {HTML_TEXT_EXAMPLES.map(example => <article className="html-tag-example" data-html-tag={example.tag} aria-label={`<${example.tag}> example`} key={example.tag}>
        <code className="html-tag-code">{example.code}</code>
        <div className="html-tag-sample"><div className="html-tag-rendered">{example.before}{example.tag === 'a' ? <a href="page.html" onClick={event => event.preventDefault()}>{example.text}</a> : createElement(example.tag, null, example.text)}{example.after}</div></div>
      </article>)}
    </div>
    <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue to the next lesson →</button></footer>
  </section>;
}
