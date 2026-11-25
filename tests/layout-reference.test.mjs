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
test('alignment, padding, positioning and combined styles follow their prerequisites in both courses',()=>{
 for(const language of ['html','css']){
  const course=lessons[language];
  const alignment=course.findIndex(l=>l.referenceKind==='alignment');
  assert.equal(language==='html'?course[alignment-1].referenceKind:course[alignment-1].title,language==='html'?'named-colours':'Colour the page background');
  const padding=course.findIndex(l=>l.referenceKind==='padding');
  assert.equal(padding,alignment+1,'Inside spacing follows text alignment');
  const position=course.findIndex(l=>l.referenceKind==='positioning');
  assert.equal(position,padding+1,'Precise positioning follows inside spacing');
  assert.equal(course.at(-1).referenceKind,'combined-styles','Combining styles is the final recap');
  assert.ok(course.every((lesson,index)=>lesson.eyebrow.startsWith(String(index+1).padStart(2,'0'))));
 }
});
test('the final recap combines exactly three properties inside one style attribute',()=>{
 const example=layoutExample('combined-styles',{align:'right',top:75,left:80,fontSize:20,colour:'blue',fontFamily:'Georgia'});
 const paragraph=example.html.match(/<p\b[^>]*>/)[0];
 assert.equal((paragraph.match(/style=/g)??[]).length,1);
 for(const declaration of ['color: blue;','font-family: Georgia;','text-align: right;']){
  assert.ok(example.html.includes(declaration));assert.ok(example.css.includes(declaration));
 }
 for(const value of [example.html,example.css])assert.doesNotMatch(value,/<div|position:|top:|left:|font-size:|height:|margin:|width:/,'Recap contains only colour, font and alignment');
 assert.equal((example.css.match(/;/g)??[]).length,3);
 assert.equal(example.setupCss,'');assert.doesNotMatch(example.companion,/style=/);
});


test('CSS has one combined colour-and-alignment lesson with a matching heading',()=>{
 assert.equal(lessons.css.length,9);
 assert.equal(lessons.css.some(lesson=>lesson.title==='Colour and centre text'),false);
 for(const language of ['html','css']){
  const lesson=lessons[language].find(item=>item.referenceKind==='alignment');
  assert.match(lesson.answer,language==='html'?/<h1\b/:/^h1\s*\{/);
  assert.match(lesson.answer,/color: red;/);
  assert.match(lesson.answer,/text-align: center;/);
  assert.match(lesson.explanation,/h1/);
  assert.match(lesson.explanation,/paragraph|<p>/);
 }
});
