import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';

const bundle=await build({entryPoints:['app/PaddingReference.tsx'],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const module={exports:{}};
new Function('require','module','exports',bundle.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {default:PaddingReference,defaultPadding,paddingExample}=module.exports;
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const messages=['Welcome to my website','Thank you for visiting'];
const supporting={'width':'fit-content','background-color':'#73AD21','border-radius':'5px','color':'#111'};

function declarations(source){
 const entries=source.split(';').map(value=>value.trim()).filter(Boolean).map(value=>{
  const colon=value.indexOf(':');
  assert.ok(colon>0,`Expected a CSS declaration: ${value}`);
  return [value.slice(0,colon).trim(),value.slice(colon+1).trim()];
 });
 assert.equal(new Set(entries.map(([property])=>property)).size,entries.length,'Declarations must not override one another');
 return Object.fromEntries(entries);
}
function checkExamples(example,expected){
 assert.match(example.css,/^p \{[\s\S]*\n\}$/);
 assert.deepEqual(declarations(example.css.slice(example.css.indexOf('{')+1,-1)),expected);
 const paragraphs=[...example.html.matchAll(/<p style="([^"]+)">([^<]+)<\/p>/g)];
 assert.equal(paragraphs.length,2,'Both paragraphs demonstrate the same settings');
 assert.deepEqual(paragraphs.map(([,styles,text])=>text),messages);
 for(const [,styles] of paragraphs)assert.deepEqual(declarations(styles),expected);
}

test('default padding gives both paragraphs 20 pixels inside every edge',()=>{
 assert.deepEqual(defaultPadding,{mode:'all',top:20,right:20,bottom:20,left:20});
 checkExamples(paddingExample(defaultPadding),{...supporting,padding:'20px'});
});

test('all-sides mode produces one shorthand without stale individual side overrides',()=>{
 const options=Object.freeze({mode:'all',top:0,right:48,bottom:7,left:23});
 const example=paddingExample(options);
 checkExamples(example,{...supporting,padding:'0px'});
 assert.doesNotMatch(example.css,/padding-(top|right|bottom|left):/);
 assert.deepEqual(options,{mode:'all',top:0,right:48,bottom:7,left:23});
});

test('individual sides preserve zero, upper-bound and unequal spacing in CSS and HTML',()=>{
 const options=Object.freeze({mode:'sides',top:0,right:48,bottom:7,left:23});
 const example=paddingExample(options);
 checkExamples(example,{...supporting,'padding-top':'0px','padding-right':'48px','padding-bottom':'7px','padding-left':'23px'});
 assert.doesNotMatch(example.css,/(?:^|\s)padding:/,'Individual properties must not be overridden by a shorthand');
 assert.deepEqual(options,{mode:'sides',top:0,right:48,bottom:7,left:23});
});

test('the stylesheet version links the same file and keeps styling out of matching HTML',()=>{
 for(const options of [defaultPadding,{mode:'sides',top:1,right:2,bottom:3,left:4}]){
  const example=paddingExample(options);
  const paragraphs=messages.map(text=>`<p>${text}</p>`).join('\n');
  assert.equal(example.companion,paragraphs);
  assert.equal(example.linkedHtml,`<link rel="stylesheet" href="styles.css">\n${paragraphs}`);
  assert.doesNotMatch(example.companion,/style=|<style\b/);
 }
});

test('both courses teach padding between alignment and positioning with matching default examples',()=>{
 const defaults=paddingExample(defaultPadding);
 for(const language of ['html','css']){
  const course=lessons[language],paddingLessons=course.filter(lesson=>lesson.referenceKind==='padding');
  assert.equal(paddingLessons.length,1);
  const lesson=paddingLessons[0],index=course.indexOf(lesson);
  assert.equal(course[index-1].referenceKind,'alignment');
  assert.equal(course[index+1].referenceKind,'positioning');
  assert.equal(lesson.referenceOnly,true);
  assert.equal(lesson.answer,defaults[language],'Static starter and interactive example must agree');
  assert.match(lesson.explanation,/inside/i);
  assert.match(lesson.explanation,/margin.*outside/i);
  for(const property of ['padding','padding-top','padding-right','padding-bottom','padding-left']){
   assert.ok(lesson.parts.some(part=>part.code===property),`Missing ${property} explanation`);
  }
  assert.ok(lesson.parts.some(part=>part.code==='width: fit-content'&&/padding also works/i.test(part.meaning)),'Fit-content is demonstration support, not a requirement for padding');
 }
});

test('all and individual sliders expose names, units and their supported range',()=>{
 for(const mode of ['all','sides']){
  const markup=renderToStaticMarkup(React.createElement(PaddingReference,{language:'html',options:{...defaultPadding,mode},onChange(){},onAlternate(){},onNext(){},renderCode:value=>value}));
  const ranges=[...markup.matchAll(/<input\b[^>]*type="range"[^>]*>/g)].map(([input])=>input);
  assert.equal(ranges.length,mode==='all'?1:4);
  const names=mode==='all'?['Padding on all sides']:['Top padding','Right padding','Bottom padding','Left padding'];
  names.forEach((name,index)=>{
   assert.ok(ranges[index].includes(`aria-label="${name}"`));
   assert.match(ranges[index],/aria-valuetext="20 pixels"/);
   assert.match(ranges[index],/min="0"/);
   assert.match(ranges[index],/max="48"/);
   assert.match(ranges[index],/step="1"/);
  });
  assert.match(markup,mode==='all'?/<button aria-pressed="true">All sides<\/button>/:/<button aria-pressed="true">Each side<\/button>/);
 }
});
