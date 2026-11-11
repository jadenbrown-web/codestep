"use client";
import React from 'react';
import CopyCodeButton from './CopyCodeButton';
import {WEB_COLOURS} from './CssVisualReference';
export default function TextColourReference({onNext,onOpenHex,actions,renderCode,colourName,onColourChange,element,onElementChange}:{onNext:()=>void;onOpenHex:()=>void;actions?:React.ReactNode;renderCode:(code:string)=>React.ReactNode;colourName:string;onColourChange:(name:string)=>void;element:'h1'|'p';onElementChange:(tag:'h1'|'p')=>void}){
 const colour=colourName.toLowerCase(),noun=element==='h1'?'heading':'paragraph';
 const example=`<${element} style="color: ${colour};">This ${noun} is ${colour}.</${element}>`;
 return <section className="html-text-reference css-visual-reference named-text-colour-reference" aria-label="Text colour examples">
  <div className="font-featured-example">
   <div className="font-example-heading"><b>Example · {colour} {noun}</b><div className="desktop-pane-actions">{actions}</div></div>
   <div className="runtime-picker" role="group" aria-label="Text element"><button aria-pressed={element==='h1'} data-active={element==='h1'} onClick={()=>onElementChange('h1')}>Heading &lt;h1&gt;</button><button aria-pressed={element==='p'} data-active={element==='p'} onClick={()=>onElementChange('p')}>Paragraph &lt;p&gt;</button></div>
   <div className="visual-example-code css-featured-code"><code className="example-syntax-code">{renderCode(example)}</code><CopyCodeButton iconOnly code={example} label="text colour example"/></div>
   <span>Choose a named colour below. Change the words between the tags to write your own {noun}.</span>
   <button className="colour-lesson-link" onClick={onOpenHex}>See {colourName} as a hex value in CSS →</button>
  </div>
  <div className="html-tag-grid named-text-colour-grid">{WEB_COLOURS.map(([name])=><article className="html-tag-example" data-text-colour={name} data-example={name===colourName||undefined} key={name}>
   <button className="visual-example-choice" aria-label={`Show ${name} ${noun} code`} aria-pressed={name===colourName} onClick={()=>onColourChange(name)}><b className="font-example-label">{name}</b><div className="named-text-colour-preview" style={{backgroundColor:['White','Yellow','Pink','Silver','Lime','Aqua'].includes(name)?'#17251f':'#fff'}}>{React.createElement(element,{style:{color:name.toLowerCase()}},`This ${noun} is ${name.toLowerCase()}.`)}</div></button>
  </article>)}</div>
  <p className="named-text-colour-note">Here we use a name such as <code>red</code>; in CSS Hex colours you will see <code>#FF0000</code>. Both mean the same colour, and either form works in an HTML style attribute or a CSS file. The two lessons keep your colour selection when you move between them. The property is spelled <code>color</code>; <code>background-color</code> changes the area behind the text.</p>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>Continue the HTML path →</button></footer>
 </section>;
}
