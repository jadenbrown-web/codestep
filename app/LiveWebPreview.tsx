"use client";
import React,{type ReactNode} from "react";
import BrowserResultPreview from "./BrowserResultPreview";
import HtmlMediaPreview,{type HtmlMediaKind} from "./HtmlMediaPreview";

export default function LiveWebPreview({code,html,css,mediaKind,exampleCode,showTab=false,previewKind="page",checked,onClearCheck,hasScript=false,scriptOutput,children}:{code:string;html?:string;css?:string;mediaKind?:HtmlMediaKind;exampleCode?:string;showTab?:boolean;previewKind?:string;checked:boolean;onClearCheck:()=>void;hasScript?:boolean;scriptOutput?:string[];children?:ReactNode}){
 const label=mediaKind&&!code.trim()?"Example preview":"Live preview";
 const actions=checked?<button onClick={onClearCheck}>Clear check</button>:undefined;
 return <section className="console-panel live-web-panel" data-browser-preview={previewKind} aria-label="Live web preview">
  <div className="console-body live-web-body">{mediaKind?<HtmlMediaPreview kind={mediaKind} code={code.trim()?code:exampleCode??""} label={label} actions={actions}/>:<BrowserResultPreview code={html??code} css={css} showTab={showTab} label={label} actions={actions}/>}</div>
  {css!==undefined&&<small className="live-preview-hint">Styles are applied to the preview HTML.</small>}
  {hasScript&&<div className="live-script-result"><small>{scriptOutput?"Example script result":"HTML and CSS update live. Check code to see the script result."}</small>{scriptOutput&&<div>{scriptOutput.map((line,i)=><p key={i}>{line}</p>)}</div>}</div>}
  {children&&<div className="live-check-message">{children}</div>}
 </section>;
}
