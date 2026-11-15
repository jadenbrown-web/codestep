"use client";
import React from 'react';
import BrowserResultPreview from './BrowserResultPreview';
import CopyCodeButton from './CopyCodeButton';

export type LayoutKind='alignment'|'positioning'|'combined-styles';
export type LayoutOptions={align:'left'|'center'|'right';top:number;left:number;fontSize:number;colour?:string;fontFamily?:string};
export function layoutExample(kind:LayoutKind,options:LayoutOptions){
 const {align,top,left,fontSize,colour='red',fontFamily='Arial'}=options;
 const family=fontFamily.includes(' ')?`'${fontFamily}'`:fontFamily;
 const label=align==='center'?'centred':`aligned ${align}`;
 const text=kind==='alignment'?`This text is ${label}.`:kind==='positioning'?'Positioned text':'This paragraph uses three styles.';
 const declarations=kind==='alignment'?`text-align: ${align};`:kind==='combined-styles'?`color: ${colour}; font-family: ${family}; text-align: ${align};`:`position: absolute; top: ${top}px; left: ${left}px; font-size: ${fontSize}px;`;
 const html=`<p style="${declarations}">${text}</p>`;
 const css=`p {\n  ${declarations.replaceAll('; ', ';\n  ')}\n}`;
 const companion=`<p>${text}</p>`;
 const setupCss=kind==='positioning'?'.preview { position: relative; height: 180px; }\np { margin: 0; }':'';
 const wrap=(paragraph:string)=>kind!=='positioning'?paragraph:`<div class="preview">\n  ${paragraph}\n</div>`;
 const previewHtml=wrap(html),previewCompanion=wrap(companion);
 const completeHtml=(language:'html'|'css')=>`<!DOCTYPE html>\n<html>\n<head>\n  <style>\n${setupCss}${language==='css'?'\n'+css:''}\n  </style>\n</head>\n<body>\n${language==='html'?previewHtml:previewCompanion}\n</body>\n</html>`;
 return {html,css,companion,setupCss,previewHtml,previewCompanion,completeHtml};
}
export default function LayoutReference({kind,language,options,onChange,onAlternate,onNext,nextLabel="Continue to the next lesson →",actions,renderCode}:{kind:LayoutKind;language:'html'|'css';options:LayoutOptions;onChange:(options:LayoutOptions)=>void;onAlternate:()=>void;onNext:()=>void;nextLabel?:string;actions?:React.ReactNode;renderCode:(value:string,language:'html'|'css')=>React.ReactNode}){
 const example=layoutExample(kind,options),code=example[language];
 const titles={alignment:'Text alignment',positioning:'Precise text position','combined-styles':language==='html'?'One style attribute, three properties':'One rule, three properties'};
 const adjust=(patch:Partial<LayoutOptions>)=>onChange({...options,...patch});
 return <section className="html-text-reference layout-reference" aria-label={`${titles[kind]} examples`} data-layout-kind={kind}>
  <div className="font-featured-example">
   <div className="font-example-heading"><b>Example · {titles[kind]}</b><div className="desktop-pane-actions">{actions}</div></div>
   <div className="visual-example-code css-featured-code"><code className="example-syntax-code" tabIndex={0} aria-label="Lesson example code">{renderCode(code,language)}</code><CopyCodeButton iconOnly code={code} label="layout example" /></div>
   <button className="colour-lesson-link" onClick={onAlternate}>See matching {language==='html'?'CSS':'HTML'} →</button>
  </div>
  <div className="layout-reference-body">
   <div className="layout-controls">
    {kind!=='positioning'&&<div className="layout-alignment-control" role="group" aria-label="Text alignment"><b>Text alignment</b><div className="layout-choice-row">{(['left','center','right'] as const).map(value=><button className="layout-choice" key={value} aria-pressed={options.align===value} onClick={()=>adjust({align:value})}>{value==='center'?'Centre':value==='left'?'Left':'Right'}</button>)}</div></div>}
    {kind==='positioning'&&<><label>From top <output>{options.top}px</output><input aria-label="Distance from top" type="range" min="0" max="100" value={options.top} onChange={event=>adjust({top:Number(event.target.value)})}/></label><label>From left <output>{options.left}px</output><input aria-label="Distance from left" type="range" min="0" max="100" value={options.left} onChange={event=>adjust({left:Number(event.target.value)})}/></label><label>Text size<select aria-label="Text size" value={options.fontSize} onChange={event=>adjust({fontSize:Number(event.target.value)})}>{[12,16,20,24].map(size=><option key={size} value={size}>{size}px</option>)}</select></label></>}
    {kind==='combined-styles'&&<><label>Text colour<select aria-label="Text colour" value={options.colour??'red'} onChange={event=>adjust({colour:event.target.value})}>{['red','blue','green'].map(value=><option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select></label><label>Font<select aria-label="Font" value={options.fontFamily??'Arial'} onChange={event=>adjust({fontFamily:event.target.value})}>{['Arial','Georgia','Courier New'].map(value=><option key={value} value={value}>{value}</option>)}</select></label></>}
   </div>
   <div className="layout-preview"><b>Web page preview</b><BrowserResultPreview code={language==='html'?example.previewHtml:example.previewCompanion} css={example.setupCss+(language==='css'?'\n'+example.css:'')}/></div>
  </div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>{nextLabel}</button></footer>
 </section>;
}
