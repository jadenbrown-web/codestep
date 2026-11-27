"use client";
import React, {type ReactNode} from 'react';
import BrowserResultPreview from './BrowserResultPreview';
import CopyCodeButton from './CopyCodeButton';
import {linkedStylesheetHtml} from './StylesheetCompanion';
import StylesheetExample from './StylesheetExample';
import useReferenceSpace from './useReferenceSpace';

export type PaddingSide='top'|'right'|'bottom'|'left';
export type PaddingOptions={mode:'all'|'sides';top:number;right:number;bottom:number;left:number};
export const defaultPadding:PaddingOptions={mode:'all',top:20,right:20,bottom:20,left:20};
const sides:PaddingSide[]=['top','right','bottom','left'];
const messages=['Welcome to my website','Thank you for visiting'];
export function paddingExample(options:PaddingOptions){
 const padding=options.mode==='all'?`padding: ${options.top}px;`:sides.map(side=>`padding-${side}: ${options[side]}px;`).join('\n  ');
 const css=`p {\n  ${padding}\n}`;
 const html=messages.map(text=>`<p style="${padding.replace(/\n\s*/g,' ')}">${text}</p>`).join('\n');
 const companion=messages.map(text=>`<p>${text}</p>`).join('\n');
 return {html,css,companion,linkedHtml:linkedStylesheetHtml(companion)};
}
export default function PaddingReference({language,options,onChange,onAlternate,onNext,actions,renderCode}:{language:'html'|'css';options:PaddingOptions;onChange:(options:PaddingOptions)=>void;onAlternate:()=>void;onNext:()=>void;actions?:ReactNode;renderCode:(value:string,language:'html'|'css')=>ReactNode}){
 const example=paddingExample(options),code=example[language];
 const space=useReferenceSpace(code);
 const changeAll=(value:number)=>onChange({mode:'all',top:value,right:value,bottom:value,left:value});
 const slider=(side:PaddingSide|'all')=>{
  const value=options[side==='all'?'top':side],label=side==='all'?'All sides':side[0].toUpperCase()+side.slice(1);
  return <label className="padding-slider" key={side}><span>{label}<output>{value}px</output></span><input type="range" min="0" max="48" step="1" value={value} aria-label={side==='all'?'Padding on all sides':`${label} padding`} aria-valuetext={`${value} pixels`} onChange={event=>side==='all'?changeAll(Number(event.target.value)):onChange({...options,[side]:Number(event.target.value)})}/></label>;
 };
 const top=options.top,bottom=options.mode==='all'?options.top:options.bottom;
 return <section ref={space} className="html-text-reference padding-reference" aria-label="Padding examples">
  <div className="font-featured-example"><div className="font-example-heading"><b>Example · Padding</b><div className="desktop-pane-actions">{actions}</div></div>
   {language==='html'?<><button className="colour-lesson-link" onClick={onAlternate}>See matching CSS →</button><div className="visual-example-code css-featured-code"><code className="example-syntax-code padding-primary-code" tabIndex={0} aria-label="Lesson example code">{renderCode(code,'html')}</code><CopyCodeButton iconOnly code={code} label="padding example"/></div></>:<StylesheetExample css={code} html={example.companion} copyLabel="padding example" primaryClassName="padding-primary-code" onOpenHtml={onAlternate} renderCode={renderCode}/>}
  </div>
  <div className="padding-reference-body"><div className="padding-mode" role="group" aria-label="Padding sides"><button aria-pressed={options.mode==='all'} onClick={()=>changeAll(options.top)}>All sides</button><button aria-pressed={options.mode==='sides'} onClick={()=>onChange({...options,mode:'sides'})}>Each side</button></div>
   <div className="padding-sliders">{options.mode==='all'?slider('all'):sides.map(slider)}</div>
   <p className="padding-explanation">Padding adds space <strong>inside</strong> each paragraph. Left padding moves text inward from the left; right padding adds space after it. Text alignment controls where text lines up.</p>
   <div className="padding-preview" style={{'--padding-canvas-height':`${88+2*(top+bottom)}px`} as React.CSSProperties}><BrowserResultPreview code={language==='html'?example.html:example.companion} css={language==='css'?example.css:undefined}/></div>
   <p className="padding-explanation">Paragraphs fill the available width, so right padding reduces the room for text. The gaps outside are margins.</p>
  </div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue to positioning →</button></footer>
 </section>;
}
