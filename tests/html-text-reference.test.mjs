import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import test from 'node:test';
import ts from 'typescript';
const compiled=await build({entryPoints:['app/HtmlTextReference.tsx'],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const module={exports:{}};
new Function('require','module','exports',compiled.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {default:Component,HTML_TEXT_EXAMPLES}=module.exports;
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const reference=lessons.html.find(lesson=>lesson.title==='Explore HTML text elements');
test('every tag in the HTML text lesson has its own example card',()=>{
  const actual=[...new Set([...reference.answer.matchAll(/<([a-z][a-z0-9]*)\b/g)].map(match=>match[1]))].sort();
  assert.deepEqual(HTML_TEXT_EXAMPLES.map(example=>example.tag).sort(),actual);
  assert.equal(HTML_TEXT_EXAMPLES.length,18);
});
test('each preview card names one tag and uses it for the rendered example',()=>{
  const html=renderToStaticMarkup(React.createElement(Component,{onNext(){}}));
  for(const example of HTML_TEXT_EXAMPLES) assert.equal((html.match(new RegExp(`data-html-tag="${example.tag}"`,'g'))??[]).length,1);
  assert.doesNotMatch(html,/&lt;mark&gt; and &lt;small&gt;|&lt;i&gt; and &lt;em&gt;|&lt;sub&gt; and &lt;sup&gt;/);
  assert.match(html,/<sub>2<\/sub>/);
  assert.match(html,/<sup>3<\/sup>/);
});
test('headings also have individual breakdown cards',async()=>{
  const code=ts.transpileModule(fs.readFileSync('app/lesson-breakdown.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
  const {syntaxBreakdown}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const cards=syntaxBreakdown(reference,'html');
  for(let level=1;level<=6;level++) assert.equal(cards.filter(card=>card.code===`<h${level}>`).length,1);
  assert.ok(!cards.some(card=>card.code==='<h1> … <h6>'));
});

test('text elements keeps a separate copyable code example above the previews',()=>{
 const html=renderToStaticMarkup(React.createElement(Component,{onNext(){}}));
 assert.match(html,/Text elements code example/);
 assert.ok(html.includes('&lt;h1&gt;Main heading&lt;/h1&gt;'));
 assert.ok(html.includes('&lt;h2&gt;Main sections&lt;/h2&gt;'));
 assert.ok(html.includes('Copy text elements example code'));
 assert.ok(html.indexOf('Text elements code example')<html.indexOf('data-html-tag='));
});
