import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const bundle=await build({entryPoints:['app/LayoutReference.tsx'],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {layoutExample}=module.exports;
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
test('alignment, positioning and combined styles follow their prerequisites in both courses',()=>{
 for(const language of ['html','css']){
  const course=lessons[language];
  const alignment=course.findIndex(l=>l.referenceKind==='alignment');
  assert.equal(language==='html'?course[alignment-1].referenceKind:course[alignment-1].title,language==='html'?'named-colours':'Colour and centre text');
  const position=course.findIndex(l=>l.referenceKind==='positioning');
  assert.equal(course[position-1].referenceKind,language==='html'?'fonts':'colours');
  assert.equal(course[position+1].referenceKind,'combined-styles');
  assert.ok(course.every((lesson,index)=>lesson.eyebrow.startsWith(String(index+1).padStart(2,'0'))));
 }
});
test('combined HTML has one style attribute per element and a complete, equivalent CSS example',()=>{
 const example=layoutExample('combined-styles',{align:'right',top:75,left:80,fontSize:20});
 const paragraph=example.html.match(/<p\b[^>]*>/)[0];
 assert.equal((paragraph.match(/style=/g)??[]).length,1);
 for(const declaration of ['color: red;','position: absolute;','top: 75px;','left: 80px;','font-size: 20px;','text-align: right;','font-family: sans-serif;','width: 160px;']){
  assert.ok(example.html.includes(declaration));assert.ok(example.css.includes(declaration));
 }
 assert.match(example.html,/position: relative; height: 180px/);
 assert.doesNotMatch(example.companion,/style=/);
});
