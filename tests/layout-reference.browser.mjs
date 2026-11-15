import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const lesson=lessons.html.find(item=>item.referenceKind==='alignment');
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390]) for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');},theme);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('.course-card.py-card').click();
  if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).tap();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
  if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).tap();
  const choose=async kind=>{
   const lesson=lessons.html.find(item=>item.referenceKind===kind);
   if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).tap();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
   if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).tap();
  };
  const code=()=>page.locator('.layout-reference .example-syntax-code').textContent();
  const frame=()=>page.frameLocator('.layout-preview iframe');
  const view=async()=>{const p=frame().locator('p');await p.waitFor();return p.evaluate(el=>{const p=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect(),s=getComputedStyle(el);return {align:s.textAlign,colour:s.color,size:s.fontSize,top:p.top-parent.top,left:p.left-parent.left};});};
  const setRange=async(name,value)=>page.getByRole('slider',{name,exact:true}).evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  const copy=async()=>{
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>window.copied=value}}));
   await page.getByRole('button',{name:'Copy layout example code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied),await code());
  };
  // The harness has opened HTML; choose the new alignment lesson.
  await choose('alignment');
  await page.getByRole('button',{name:'Right',exact:true}).click();
  assert.match(await code(),/text-align: right/);assert.equal((await view()).align,'right');await copy();
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();
  assert.equal((await view()).align,'right');assert.match(await code(),/^p \{/);
  await choose('positioning');
  await setRange('Distance from top',75);await setRange('Distance from left',80);await page.getByLabel('Text size',{exact:true}).selectOption('20');
  let rendered=await view();assert.ok(Math.abs(rendered.top-75)<1);assert.ok(Math.abs(rendered.left-80)<1);assert.equal(rendered.size,'20px');
  assert.match(await code(),/top: 75px/);assert.match(await code(),/left: 80px/);await copy();
  await page.getByRole('button',{name:'See matching HTML →',exact:true}).click();
  rendered=await view();assert.ok(Math.abs(rendered.top-75)<1);assert.ok(Math.abs(rendered.left-80)<1);assert.equal(rendered.size,'20px');
  await page.getByRole('button',{name:'Continue to the next lesson →',exact:true}).click();
  assert.match(await page.locator('.lesson-copy h1').textContent(),/Combine colour/);
  await page.getByRole('button',{name:'Centre',exact:true}).click();
  assert.match(await code(),/color: red/);assert.equal(((await code()).match(/<p[^>]*>/)[0].match(/style=/g)??[]).length,1);await copy();
  assert.equal((await view()).colour,'rgb(255, 0, 0)');assert.equal((await view()).align,'center');
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();
  rendered=await view();assert.equal(rendered.colour,'rgb(255, 0, 0)');assert.equal(rendered.align,'center');assert.equal(rendered.size,'20px');assert.ok(Math.abs(rendered.top-75)<1);assert.ok(Math.abs(rendered.left-80)<1);
  const syntax=await page.locator('.example-syntax-code .syntax-api').allTextContents();
  for(const property of ['position','top','left','font-size'])assert.ok(syntax.includes(property),property+' has property syntax highlighting');
  await page.locator('.layout-preview iframe').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page-wide horizontal overflow');
  if(theme==='dark')await page.screenshot({path:`/tmp/codestep-layout-${width}.png`});
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: alignment, true coordinates, single style attribute, equivalent HTML/CSS, copies and phone layout`);
  await page.close();
 }
}finally{await browser.close();}
