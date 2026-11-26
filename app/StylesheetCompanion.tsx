import React, {type ReactNode} from 'react';
import CopyCodeButton from './CopyCodeButton';

export const stylesheetLink='<link rel="stylesheet" href="styles.css">';
export function linkedStylesheetHtml(content=''){
 if(/<link\b[^>]*href=["']styles\.css["']/i.test(content))return content;
 if(/<head\b[^>]*>/i.test(content))return content.replace(/<head\b[^>]*>/i,head=>`${head}\n  ${stylesheetLink}`);
 return stylesheetLink+(content?'\n'+content:'');
}
export default function StylesheetCompanion({html='',selector,onOpenHtml,renderCode}:{html?:string;selector?:string;onOpenHtml?:()=>void;renderCode:(value:string,language:'html')=>ReactNode}){
 const code=linkedStylesheetHtml(html);
 return <article className="stylesheet-file stylesheet-companion" aria-label="Matching HTML file">
  <header><b>index.html</b><CopyCodeButton iconOnly code={code} label="matching HTML file"/></header>
  <pre><code className="file-example-code companion-html-code" tabIndex={0}>{renderCode(code,'html')}</code></pre>
  <p>The link loads <code>styles.css</code> from the same folder. Its <code>href</code> must match that filename.{selector&&<> The <code>{selector}</code> selector matches <code>{`<${selector}>`}</code> elements here.</>}</p>
  {onOpenHtml&&<button className="stylesheet-lesson-link" onClick={onOpenHtml}>See matching HTML →</button>}
 </article>;
}
