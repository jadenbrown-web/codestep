"use client";
import React, {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import CopyCodeButton from './CopyCodeButton';

export const stylesheetLink='<link rel="stylesheet" href="styles.css">';
export function linkedStylesheetHtml(content=''){
 if(/<link\b[^>]*href=["']styles\.css["']/i.test(content))return content;
 if(/<head\b[^>]*>/i.test(content))return content.replace(/<head\b[^>]*>/i,head=>`${head}\n  ${stylesheetLink}`);
 return stylesheetLink+(content?'\n'+content:'');
}
export default function StylesheetCompanion({html='',selector,onOpenHtml,onOpenLesson,renderCode}:{html?:string;selector?:string;onOpenHtml?:()=>void;onOpenLesson?:()=>void;renderCode:(value:string,language:'html')=>ReactNode}){
 const code=linkedStylesheetHtml(html),id=useId();
 const [mobile,setMobile]=useState(false),[open,setOpen]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),launcher=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const media=window.matchMedia('(max-width: 850px)');
  const update=()=>setMobile(media.matches);update();media.addEventListener('change',update);
  return ()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{if(!mobile)setOpen(false);},[mobile]);
 useEffect(()=>{
  const sync=()=>setOpen(window.history.state?.codestepHtmlFile===id&&window.matchMedia('(max-width: 850px)').matches);
  window.addEventListener('popstate',sync);return ()=>window.removeEventListener('popstate',sync);
 },[id]);
 useEffect(()=>{
  if(!open)return;
  const file=dialog.current,previousOverflow=document.body.style.overflow;
  const state={...window.history.state,codestepHtmlFile:id};
  if(window.history.state?.codestepHtmlFile!==id)window.history.pushState(state,'');
  document.body.style.overflow='hidden';file?.showModal();if(file)file.scrollTop=0;
  return ()=>{
   file?.close();document.body.style.overflow=previousOverflow;
   if(window.history.state?.codestepHtmlFile===id)window.history.back();
   if(launcher.current?.isConnected)launcher.current.focus({preventScroll:true});
  };
 },[open,id]);
 const explanation=<p>The link loads <code>styles.css</code> from the same folder. Its <code>href</code> must match that filename.{selector&&<> The <code>{selector}</code> selector matches <code>{`<${selector}>`}</code> elements here.</>}</p>;
 const lesson=onOpenLesson??onOpenHtml;
 if(mobile)return <>
  <button ref={launcher} className="html-file-launcher" onClick={()=>setOpen(true)} aria-haspopup="dialog">View HTML file<span aria-hidden="true">index.html</span></button>
  {open&&createPortal(<dialog ref={dialog} className="mobile-html-file-view" aria-labelledby={`${id}-title`} onKeyDown={event=>{if(event.key==="Escape")event.stopPropagation();}} onCancel={event=>{event.preventDefault();setOpen(false);}}>
   <header className="mobile-file-heading"><button className="mobile-file-back" aria-label="Back to CSS" onClick={()=>setOpen(false)} autoFocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg><span>CSS</span></button><h1 id={`${id}-title`}>index.html</h1><CopyCodeButton iconOnly code={code} label="matching HTML file"/></header>
   <div className="mobile-file-content"><pre><code className="file-example-code companion-html-code" tabIndex={0}>{renderCode(code,'html')}</code></pre>{explanation}
    {lesson&&<button className="stylesheet-lesson-link" onClick={()=>{setOpen(false);lesson();}}>Open HTML lesson</button>}
   </div>
  </dialog>,document.body)}
 </>;
 return <article className="stylesheet-file stylesheet-companion" aria-label="Matching HTML file">
  <header><b>index.html</b><CopyCodeButton iconOnly code={code} label="matching HTML file"/></header>
  <pre><code className="file-example-code companion-html-code" tabIndex={0}>{renderCode(code,'html')}</code></pre>
  {explanation}
  {onOpenHtml&&<button className="stylesheet-lesson-link" onClick={onOpenHtml}>See matching HTML →</button>}
 </article>;
}
