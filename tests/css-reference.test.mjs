import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const built=await build({entryPoints:['app/CssVisualReference.tsx'],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const module={exports:{}};
new Function('require','module','exports',built.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {default:Component,WEB_COLOURS,BORDER_EXAMPLES}=module.exports;
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
test('CSS border quiz is replaced by a separate hex reference immediately after borders',()=>{
 const index=lessons.css.findIndex(l=>l.title==='Explore CSS borders');
 assert.equal(lessons.css[index+1].referenceKind,'colours');
 assert.equal(lessons.css[index+1].referenceOnly,true);
 assert.ok(!lessons.css.some(l=>/Border practice/i.test(l.eyebrow)));
});
test('border reference has one featured example and six named visual styles',()=>{
 const html=renderToStaticMarkup(React.createElement(Component,{kind:'borders',onNext(){}}));
 assert.equal((html.match(/data-border=/g)??[]).length,6);
 assert.equal(BORDER_EXAMPLES.length,6);
 assert.match(html,/Example · Rounded dotted border/);
 assert.doesNotMatch(html,/hex-note|rgb\(|Try the border quiz/);
});
test('hex reference shows accurate named swatches, hex values and an HTML insertion example',()=>{
 const html=renderToStaticMarkup(React.createElement(Component,{kind:'colours',onNext(){}}));
 assert.equal(WEB_COLOURS.length,20);
 assert.equal((html.match(/data-colour=/g)??[]).length,20);
 for(const [name,hex] of WEB_COLOURS){assert.match(hex,/^#[0-9A-F]{6}$/);assert.ok(html.includes(name));assert.ok(html.includes(hex));}
 assert.ok(html.includes('&lt;p style=&quot;color: #FF0000;&quot;&gt;Red text&lt;/p&gt;'));
 assert.ok(html.includes('Copy red HTML tag code'));
});
