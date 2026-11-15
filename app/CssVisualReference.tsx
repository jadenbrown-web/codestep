import React, {useState} from 'react';
import CopyCodeButton from './CopyCodeButton';

export const WEB_COLOURS = [
 ['Red','#FF0000'],['Green','#008000'],['Blue','#0000FF'],['Yellow','#FFFF00'],
 ['Orange','#FFA500'],['Purple','#800080'],['Pink','#FFC0CB'],['Brown','#A52A2A'],
 ['Black','#000000'],['White','#FFFFFF'],['Gray','#808080'],['Silver','#C0C0C0'],
 ['Lime','#00FF00'],['Aqua','#00FFFF'],['Teal','#008080'],['Navy','#000080'],
 ['Maroon','#800000'],['Olive','#808000'],['Fuchsia','#FF00FF'],['RebeccaPurple','#663399'],
];
export const BORDER_EXAMPLES = [
 {name:'Solid border',css:'border: 5px solid red;',style:{border:'5px solid red'}},
 {name:'Dotted border',css:'border: 5px dotted blue;',style:{border:'5px dotted blue'}},
 {name:'Dashed border',css:'border: 5px dashed green;',style:{border:'5px dashed green'}},
 {name:'Left border',css:'border-left: 5px solid blue;',style:{borderLeft:'5px solid blue'}},
 {name:'Bottom border',css:'border-bottom: 5px solid red;',style:{borderBottom:'5px solid red'}},
 {name:'Rounded dotted border',css:'border: 5px dotted blue; border-radius: 12px;',style:{border:'5px dotted blue',borderRadius:'12px'}},
];
export default function CssVisualReference({kind,onNext,actions,renderCode,colourName="Red",onColourChange,onOpenTextColour}:{colourName?:string;onColourChange?:(name:string)=>void;onOpenTextColour?:()=>void;kind:'borders'|'colours';onNext:()=>void;actions?:React.ReactNode;renderCode?:(code:string,syntax?:"html"|"css")=>React.ReactNode}){
 const colours=kind==='colours';
 const [selected,setSelected]=useState(BORDER_EXAMPLES[5]);
 const [localColour,setLocalColour]=useState(colourName);
 const [name,hex]=WEB_COLOURS.find(([name])=>name===(onColourChange?colourName:localColour))??WEB_COLOURS[0];
 const example=colours?`<p style="color: ${hex};">${name} text</p>`:`p.notice {\n  ${selected.css.replace('; ', ';\n  ')}\n}`;
 return <section className={`html-text-reference css-visual-reference ${colours?'colour-reference':'border-reference'}`} aria-label={colours?'Hex colour examples':'Border examples'}>
  <div className="font-featured-example">
   <div className="font-example-heading"><b>{colours?`Example · ${name} text`:`Example · ${selected.name}`}</b><div className="desktop-pane-actions">{actions}</div></div>
   <div className="visual-example-code css-featured-code"><code className="example-syntax-code">{renderCode ? renderCode(example) : example}</code><CopyCodeButton iconOnly code={example} label={colours?`${name.toLowerCase()} HTML tag`:'border example'} /></div>
   {colours?<><p className="featured-red-text" style={{color:hex,backgroundColor:["White","Yellow","Pink","Silver","Lime","Aqua"].includes(name)?"#17251f":"#fff"}}>{name} text</p>{onOpenTextColour&&<button className="colour-lesson-link" onClick={onOpenTextColour}>See {name} as a named colour in HTML →</button>}</>:<span>Use <code>{renderCode ? renderCode('<p class="notice">Border text</p>',"html") : '<p class="notice">Border text</p>'}</code> in your HTML. Change the border style to try the examples below.</span>}
  </div>
  <div className={`html-tag-grid ${colours?'colour-example-grid':'border-example-grid'}`}>
   {colours?WEB_COLOURS.map(([name,hex])=><article className="html-tag-example colour-example" data-colour={name} data-example={hex===(WEB_COLOURS.find(([n])=>n===(onColourChange?colourName:localColour))?.[1])||undefined} key={name}>
    <button className="visual-example-choice" aria-label={`Use ${name} hex colour`} aria-pressed={name===(onColourChange?colourName:localColour)} onClick={()=>{setLocalColour(name);onColourChange?.(name);}}><b className="font-example-label">{name}</b>
    <div className="colour-swatch" style={{backgroundColor:hex}} aria-label={`${name} colour swatch`} /></button>
    <div className="visual-example-code colour-code-row"><code className="colour-hex">{renderCode ? renderCode(hex,"css") : hex}</code><CopyCodeButton iconOnly code={hex} label={`${name} hex`} /></div>
   </article>):BORDER_EXAMPLES.map(item=><article className="html-tag-example" data-border={item.name} data-example={selected.name === item.name || undefined} key={item.name}>
    <button className="visual-example-choice" aria-label={`Show ${item.name} code`} aria-pressed={selected.name === item.name} onClick={() => setSelected(item)}>
     <b className="font-example-label">{item.name}</b>
     <span className="border-example-sample" style={item.style}>Border text</span>
    </button>
   </article>)}
  </div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>{colours?'Finish CSS path →':'Continue to hex colours →'}</button></footer>
 </section>;
}
