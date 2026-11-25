"use client";
import React from 'react';
import BrowserResultPreview from './BrowserResultPreview';
import CopyCodeButton from './CopyCodeButton';
import StylesheetCompanion,{linkedStylesheetHtml} from './StylesheetCompanion';

export type LayoutKind='alignment'|'positioning'|'combined-styles';
export type LayoutOptions={align:'left'|'center'|'right';top:number;left:number;fontSize:number;colour?:string;fontFamily?:string};
export function layoutExample(kind:LayoutKind,options:LayoutOptions){
 const {align,top,left,fontSize,colour='red',fontFamily='Arial'}=options;
 const family=fontFamily.includes(' ')?`'${fontFamily}'`:fontFamily;
 const label=align==='center'?'centred':`aligned ${align}`;
 const tag=kind==='alignment'?'h1':'p';
 const text=kind==='alignment'?`This text is ${label}.`:kind==='positioning'?'Positioned text':'This paragraph uses three styles.';
 const declarations=kind==='alignment'?`color: ${colour}; text-align: ${align};`:kind==='combined-styles'?`color: ${colour}; font-family: ${family}; text-align: ${align};`:`position: absolute; margin: 0; top: ${top}px; left: ${left}px; font-size: ${fontSize}px;`;
 const html=`<${tag} style="${declarations}">${text}</${tag}>`;
 const css=`${tag} {\n  ${declarations.replaceAll('; ', ';\n  ')}\n}`;
 const companion=`<${tag}>${text}</${tag}>`;
 const setupCss='';
 const previewHtml=html,previewCompanion=companion;
 const linkedHtml=linkedStylesheetHtml(companion);
 const completeHtml=(language:'html'|'css')=>`<!DOCTYPE html>
<html>
<head>
${language==='css'?'  <link rel="stylesheet" href="styles.css">\n':''}</head>
<body>
${language==='html'?html:companion}
</body>
</html>`;
 return {html,css,companion,linkedHtml,setupCss,previewHtml,previewCompanion,completeHtml};
}
export default function LayoutReference({kind,language,options,onChange,onAlternate,onNext,nextLabel="Continue to the next lesson →",actions,renderCode}:{kind:LayoutKind;language:'html'|'css';options:LayoutOptions;onChange:(options:LayoutOptions)=>void;onAlternate:()=>void;onNext:()=>void;nextLabel?:string;actions?:React.ReactNode;renderCode:(value:string,language:'html'|'css')=>React.ReactNode}){
 const example=layoutExample(kind,options),code=example[language];
 const titles={alignment:'Text alignment',positioning:'Precise text position','combined-styles':language==='html'?'One style attribute, three properties':'One rule, three properties'};
 const adjust=(patch:Partial<LayoutOptions>)=>onChange({...options,...patch});
 return <section className="html-text-reference layout-reference" aria-label={`${titles[kind]} examples`} data-layout-kind={kind}>
  <div className="font-featured-example">
   <div className="font-example-heading"><b>Example · {titles[kind]}</b><div className="desktop-pane-actions">{actions}</div></div>
   {language==='html'?<><button className="colour-lesson-link" onClick={onAlternate}>See matching CSS →</button><div className="visual-example-code css-featured-code"><code className="example-syntax-code layout-primary-code" tabIndex={0} aria-label="Lesson example code">{renderCode(code,language)}</code><CopyCodeButton iconOnly code={code} label="layout example" /></div></>:<div className="stylesheet-file-pair">
    <article className="stylesheet-file"><header><b>styles.css</b><CopyCodeButton iconOnly code={code} label="layout example"/></header><pre><code className="example-syntax-code layout-primary-code" tabIndex={0} aria-label="Lesson example code">{renderCode(code,'css')}</code></pre></article>
    <StylesheetCompanion html={example.companion} selector={kind==='alignment'?'h1':'p'} renderCode={renderCode}/>
   </div>}
  </div>
  <div className="layout-reference-body">
   <div className="layout-controls">
    {kind!=='positioning'&&<div className="layout-alignment-control" role="group" aria-label="Text alignment"><b>Text alignment</b><div className="layout-choice-row">{(['left','center','right'] as const).map(value=><button className="layout-choice" key={value} aria-pressed={options.align===value} onClick={()=>adjust({align:value})}>{value==='center'?'Centre':value==='left'?'Left':'Right'}</button>)}</div></div>}
    {kind==='positioning'&&<><label>From top <output>{options.top}px</output><input aria-label="Distance from top" type="range" min="0" max="100" value={options.top} onChange={event=>adjust({top:Number(event.target.value)})}/></label><label>From left <output>{options.left}px</output><input aria-label="Distance from left" type="range" min="0" max="100" value={options.left} onChange={event=>adjust({left:Number(event.target.value)})}/></label><div className="layout-option-group layout-size-control" role="group" aria-label="Text size"><b>Text size</b><div className="layout-choice-row">{[12,16,20,24].map(size=><button className="layout-choice" key={size} aria-pressed={options.fontSize===size} onClick={()=>adjust({fontSize:size})}>{size}px</button>)}</div></div></>}
    {kind!=='positioning'&&<div className="layout-option-group" role="group" aria-label="Text colour"><b>Text colour</b><div className="layout-choice-row">{['red','blue','green'].map(value=><button className="layout-choice" key={value} aria-pressed={(options.colour??'red')===value} onClick={()=>adjust({colour:value})}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div></div>}
    {kind==='combined-styles'&&<><div className="layout-option-group" role="group" aria-label="Font"><b>Font</b><div className="layout-choice-row">{['Arial','Georgia','Courier New'].map(value=><button className="layout-choice" key={value} aria-pressed={(options.fontFamily??'Arial')===value} onClick={()=>adjust({fontFamily:value})}>{value}</button>)}</div></div></>}
   </div>
   <div className="layout-preview"><BrowserResultPreview code={language==='html'?example.previewHtml:example.previewCompanion} css={example.setupCss+(language==='css'?'\n'+example.css:'')}/></div>
  </div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>{nextLabel}</button></footer>
 </section>;
}
