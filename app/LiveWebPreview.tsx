"use client";
import React,{useState,type ReactNode} from "react";
import BrowserResultPreview from "./BrowserResultPreview";
import HtmlMediaPreview,{type HtmlMediaKind} from "./HtmlMediaPreview";

export default function LiveWebPreview({code,html,css,mediaKind,exampleCode,showTab=false,previewKind="page",checked,onClearCheck,hasScript=false,scriptOutput,children}:{code:string;html?:string;css?:string;mediaKind?:HtmlMediaKind;exampleCode?:string;showTab?:boolean;previewKind?:string;checked:boolean;onClearCheck:()=>void;hasScript?:boolean;scriptOutput?:string[];children?:ReactNode}){
 const [file,setFile]=useState("index.html");
 return <section className="console-panel live-web-panel" data-browser-preview={previewKind} aria-label="Live web preview">
  <header className="console-bar live-web-header"><span><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg>{mediaKind&&!code.trim()?"Example preview":"Live preview"}</span><code className="live-web-file">{file}</code>{checked&&<button onClick={onClearCheck}>Clear check</button>}</header>
  <div className="console-body live-web-body">{mediaKind?<HtmlMediaPreview kind={mediaKind} code={code.trim()?code:exampleCode??""} showHeader={false} onNavigate={setFile}/>:<BrowserResultPreview code={html??code} css={css} showTab={showTab}/>}</div>
  {css!==undefined&&<small className="live-preview-hint">Styles are applied to the preview HTML.</small>}
  {hasScript&&<div className="live-script-result"><small>{scriptOutput?"Example script result":"HTML and CSS update live. Check code to see the script result."}</small>{scriptOutput&&<div>{scriptOutput.map((line,i)=><p key={i}>{line}</p>)}</div>}</div>}
  {children&&<div className="live-check-message">{children}</div>}
 </section>;
}
