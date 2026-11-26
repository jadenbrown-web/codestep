import React, {type ReactNode} from 'react';
import CopyCodeButton from './CopyCodeButton';
import StylesheetCompanion from './StylesheetCompanion';

export default function StylesheetExample({css,html,copyLabel,primaryClassName='',onOpenHtml,renderCode}:{css:string;html:string;copyLabel:string;primaryClassName?:string;onOpenHtml?:()=>void;renderCode?:(value:string,syntax:'html'|'css')=>ReactNode}){
 const highlight=renderCode??((value:string)=>value);
 return <div className="stylesheet-file-pair">
  <article className="stylesheet-file"><header><b>styles.css</b><CopyCodeButton iconOnly code={css} label={copyLabel}/></header><pre><code className={`example-syntax-code stylesheet-primary-code ${primaryClassName}`} tabIndex={0} aria-label="Lesson example code">{highlight(css,'css')}</code></pre></article>
  <StylesheetCompanion html={html} onOpenHtml={onOpenHtml} renderCode={highlight}/>
 </div>;
}
