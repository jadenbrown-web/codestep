"use client";
import React from 'react';
import BrowserResultPreview from './BrowserResultPreview';
import CopyCodeButton from './CopyCodeButton';

export type LayoutKind='alignment'|'positioning'|'combined-styles';
export type LayoutOptions={align:'left'|'center'|'right';top:number;left:number;fontSize:number};
export function layoutExample(kind:LayoutKind,options:LayoutOptions){
 const {align,top,left,fontSize}=options;
 const label=align==='center'?'centred':`aligned ${align}`;
 const text=kind==='alignment'?`This text is ${label}.`:kind==='positioning'?'Positioned text':`This text is red and ${label}.`;
 const declarations=kind==='alignment'?`text-align: ${align};`:`${kind==='combined-styles'?'color: red; ':''}position: absolute; top: ${top}px; left: ${left}px; font-size: ${fontSize}px;${kind==='combined-styles'?` font-family: sans-serif; width: 160px; text-align: ${align};`:''} margin: 0;`;
 const paragraph=`<p style="${declarations}">${text}</p>`;
 const context='position: relative; height: 180px;';
 const html=kind==='alignment'?paragraph:`<div style="${context}">\n  ${paragraph}\n</div>`;
 const css=(kind==='alignment'?'':`div {\n  ${context.replace('; ', ';\n  ')}\n}\n\n`)+`p {\n  ${declarations.replaceAll('; ', ';\n  ')}\n}`;
 const companion=kind==='alignment'?`<p>${text}</p>`:`<div>\n  <p>${text}</p>\n</div>`;
 return {html,css,companion};
}
export default function LayoutReference({kind,language,options,onChange,onAlternate,onNext,actions,renderCode}:{kind:LayoutKind;language:'html'|'css';options:LayoutOptions;onChange:(options:LayoutOptions)=>void;onAlternate:()=>void;onNext:()=>void;actions?:React.ReactNode;renderCode:(value:string,language:'html'|'css')=>React.ReactNode}){
 const example=layoutExample(kind,options),code=example[language];
 const titles={alignment:'Text alignment',positioning:'Positioned paragraph','combined-styles':'Styles working together'};
 const adjust=(patch:Partial<LayoutOptions>)=>onChange({...options,...patch});
 return <section className="html-text-reference layout-reference" aria-label={`${titles[kind]} examples`}>
  <div className="font-featured-example">
   <div className="font-example-heading"><b>Example · {titles[kind]}</b><div className="desktop-pane-actions">{actions}</div></div>
   <div className="visual-example-code css-featured-code"><code className="example-syntax-code" tabIndex={0} aria-label="Complete layout code">{renderCode(code,language)}</code><CopyCodeButton iconOnly code={code} label="layout example" /></div>
   <button className="colour-lesson-link" onClick={onAlternate}>See matching {language==='html'?'CSS':'HTML'} →</button>
  </div>
  <div className="layout-reference-body">
   <div className="layout-controls">
    {kind!=='positioning'&&<div className="layout-alignment-control" role="group" aria-label="Text alignment"><b>Text alignment</b><div className="layout-choice-row">{(['left','center','right'] as const).map(value=><button className="layout-choice" key={value} aria-pressed={options.align===value} onClick={()=>adjust({align:value})}>{value==='center'?'Centre':value==='left'?'Left':'Right'}</button>)}</div></div>}
    {kind!=='alignment'&&<><label>Distance from top <output>{options.top}px</output><input aria-label="Distance from top" type="range" min="0" max="100" value={options.top} onChange={event=>adjust({top:Number(event.target.value)})}/></label><label>Distance from left <output>{options.left}px</output><input aria-label="Distance from left" type="range" min="0" max="100" value={options.left} onChange={event=>adjust({left:Number(event.target.value)})}/></label><label>Text size<select aria-label="Text size" value={options.fontSize} onChange={event=>adjust({fontSize:Number(event.target.value)})}>{[12,16,20,24].map(size=><option key={size} value={size}>{size}px</option>)}</select></label></>}
   </div>
   <div className="layout-preview"><b>Web page preview</b><BrowserResultPreview code={language==='html'?example.html:example.companion} css={language==='css'?example.css:undefined}/></div>
  </div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>{kind==='combined-styles'&&language==='css'?'Finish CSS path →':'Continue to the next lesson →'}</button></footer>
 </section>;
}
