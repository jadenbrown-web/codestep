import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1952,1024,390])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  const render=async()=>{await page.goto('https://codestep.test/');await page.evaluate(({theme,pins})=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');localStorage.setItem('codestep-pinned-lessons',JSON.stringify({csharp:pins}));}, {theme,pins:lessons.csharp.slice(0,2).map(l=>l.title)});await page.addScriptTag({content:bundle.outputFiles[0].text});await page.locator('.course-card').first().waitFor();};
  const settings=async()=>page.locator('button[aria-label="Settings"]:visible').boundingBox();
  const same=(actual,expected,label)=>{for(const key of ['x','y','width','height'])assert.ok(Math.abs(actual[key]-expected[key])<1,`${label}: ${key}: ${JSON.stringify({actual,expected})}`);};
  await render();const home=await settings();
  assert.equal(await page.locator('.terminal-card').evaluate(e=>getComputedStyle(e).boxShadow),'none');
  await page.locator('.course-card.cs-card').click();
  const name=page.locator('.editor-file-name');await name.waitFor();
  const filename=await name.evaluate(e=>({text:e.textContent,w:e.clientWidth,scroll:e.scrollWidth,overflow:getComputedStyle(e).textOverflow}));
  assert.equal(filename.text,'Program.cs');assert.ok(filename.scroll<=filename.w+1,'C# filename is never truncated');assert.notEqual(filename.overflow,'ellipsis');
  same(await settings(),home,'Home and C# Settings share a position');
  const filenameBox=await name.boundingBox(),tabBox=await page.locator('.file-tab').boundingBox();
  assert.ok(filenameBox.x+filenameBox.width<=tabBox.x+tabBox.width+1,'The full filename fits inside its tab');
  for(const property of ['comparisonExample','displayCurrentTime','loopExample']){
   const chosen=lessons.csharp.find(l=>l[property]);
   if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:chosen.title}).click();
   if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
   same(await settings(),home,`${property} selector does not move Settings`);
   if(property==='loopExample')await page.getByRole('button',{name:'For · fixed count',exact:true}).click();
   if(property==='comparisonExample')await page.locator('.editor-panel').getByRole('button',{name:'Less than',exact:true}).click();
   if(property==='displayCurrentTime'){await page.locator('.time-zone-trigger').click();await page.getByRole('button',{name:'Paris, France',exact:true}).click();}
   same(await settings(),home,`${property} changes keep Settings fixed`);
  }

  const mode=width>850?await page.locator('.editor-panel .editor-mode-toggle').boundingBox():null;
  const copy=width>850?await page.locator('.editor-panel .copy-code-button').boundingBox():null;
  for(const kind of ['text','fonts','pages','combined-styles']){
   await render();await page.locator('.course-card.py-card').click();
   const lesson=lessons.html.find(l=>l.referenceKind===kind);
   if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
   if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
   await page.locator('.reference-workspace').waitFor();same(await settings(),home,`${kind} Settings stays fixed`);
   if(width>850){same(await page.locator('.reference-workspace .editor-mode-toggle').boundingBox(),mode,`${kind} mode stays fixed`);if(kind!=='pages')same(await page.locator('.reference-workspace .font-featured-example .copy-code-button').boundingBox(),copy,`${kind} copy stays fixed`);}
   if(kind==='pages'){
    for(const selector of ['.pages-reference-preview','.pages-reference-preview .reference-pane-heading','.file-pair article','.link-journey'])assert.equal(await page.locator(selector).first().evaluate(e=>getComputedStyle(e).borderTopWidth),'0px',selector);
    assert.equal(await page.locator('.file-pair article>header .copy-code-button').count(),2);
   }
   if(width===1952&&theme==='dark'&&kind==='pages')await page.screenshot({path:'/tmp/codestep-pages-clean.png'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${theme}: full C# filename, single demo frame, clean HTML files and stable shared toolbar slots`);await page.close();
 }
}finally{await browser.close();}
