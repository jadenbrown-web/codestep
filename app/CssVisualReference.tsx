import React from 'react';
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
export default function CssVisualReference({kind,onNext,actions}:{kind:'borders'|'colours';onNext:()=>void;actions?:React.ReactNode}){
 const colours=kind==='colours';
 const example=colours?'<p style="color: #FF0000;">Red text</p>':'p.notice {\n  border: 5px dotted blue;\n  border-radius: 12px;\n}';
 return <section className={`html-text-reference css-visual-reference ${colours?'colour-reference':'border-reference'}`} aria-label={colours?'Hex colour examples':'Border examples'}>
  <div className="font-featured-example">
   <div className="font-example-heading"><b>{colours?'Example · Red text':'Example · Rounded dotted border'}</b><div className="desktop-pane-actions">{actions}</div></div>
   <div className="visual-example-code"><code>{example}</code><CopyCodeButton iconOnly code={example} label={colours?'red HTML tag':'border example'} /></div>
   {colours?<><p className="featured-red-text">Red text</p><span>Put the hex value after <strong>color:</strong> inside the tag’s <strong>style</strong> attribute. In a CSS file, use <code>p {'{'} color: #FF0000; {'}'}</code>. Change the hex value to try another colour.</span></>:<span>Use <code>&lt;p class="notice"&gt;Border text&lt;/p&gt;</code> in your HTML. Change the border style to try the examples below.</span>}
  </div>
  <div className={`html-tag-grid ${colours?'colour-example-grid':'border-example-grid'}`}>
   {colours?WEB_COLOURS.map(([name,hex])=><article className="html-tag-example colour-example" data-colour={name} key={name}>
    <div className="font-card-heading"><b className="font-example-label">{name}</b><CopyCodeButton iconOnly code={hex} label={`${name} hex`} /></div>
    <div className="colour-swatch" style={{backgroundColor:hex}} aria-label={`${name} colour swatch`} />
    <code className="colour-hex">{hex}</code>
   </article>):BORDER_EXAMPLES.map(item=><article className="html-tag-example" data-border={item.name} key={item.name}>
    <div className="font-card-heading"><b className="font-example-label">{item.name}</b><CopyCodeButton iconOnly code={`p.notice { ${item.css} }`} label={item.name} /></div>
    <div className="border-example-sample" style={item.style}>Border text</div>
   </article>)}
  </div>
  <footer className="html-reference-footer"><button className="html-reference-next" onClick={onNext}>{colours?'Finish CSS path →':'Continue to hex colours →'}</button></footer>
 </section>;
}
