"use client";
import React from 'react';
import CopyCodeButton from './CopyCodeButton';
import {WEB_COLOURS} from './CssVisualReference';
export default function TextColourReference({onNext,onOpenHex,actions,renderCode,colourName,onColourChange}:{onNext:()=>void;onOpenHex:()=>void;actions?:React.ReactNode;renderCode:(code:string)=>React.ReactNode;colourName:string;onColourChange:(name:string)=>void}){
 const colour=colourName.toLowerCase(),noun='paragraph';
 const tag='p';
 const example=`<${tag} style="color: ${colour};">This color is ${colour}</${tag}>`;
 return <section className="html-text-reference css-visual-reference named-text-colour-reference" aria-label="Text colour examples">
  <div className="font-featured-example">
   <div className="font-example-heading"><b>Example · {colour} {noun}</b><div className="desktop-pane-actions">{actions}</div></div>
   <div className="visual-example-code css-featured-code"><code className="example-syntax-code">{renderCode(example)}</code><CopyCodeButton iconOnly code={example} label="text colour example"/></div>
   <button className="colour-lesson-link" onClick={onOpenHex}>See {colourName} as a hex value in CSS →</button>
  </div>
  <div className="html-tag-grid named-text-colour-grid">{WEB_COLOURS.map(([name])=><article className="html-tag-example" data-text-colour={name} data-example={name===colourName||undefined} key={name}>
   <button className="visual-example-choice" aria-label={`Show ${name} ${noun} code`} aria-pressed={name===colourName} onClick={()=>onColourChange(name)}><div className="named-text-colour-preview" style={{backgroundColor:['White','Yellow','Pink','Silver','Lime','Aqua'].includes(name)?'#17251f':'#fff'}}>{React.createElement(tag,{style:{color:name.toLowerCase()}},`This color is ${name.toLowerCase()}`)}</div></button>
  </article>)}</div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue the HTML path →</button></footer>
 </section>;
}
