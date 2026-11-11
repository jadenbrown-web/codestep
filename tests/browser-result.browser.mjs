import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const lesson=lessons.html.find(item=>item.browserPreview);
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
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});
  await editor.fill(lesson.answer);
  await page.getByRole('button',{name:'Check code',exact:true}).click();
  const iframe=page.getByTitle('Web page result', {exact:true});
  await iframe.waitFor();
  const frame=page.frameLocator('iframe.browser-result-preview');
  await frame.locator('body>div').first().waitFor();
  const blocks=await frame.locator('body>div').evaluateAll(es=>es.map(el=>({text:el.textContent.trim(),background:getComputedStyle(el).backgroundColor,display:getComputedStyle(el).display,box:el.getBoundingClientRect().toJSON()})));
  assert.equal(blocks.length,2);
  assert.deepEqual(blocks.map(({text,background,display})=>({text,background,display})),[
   {text:'This text is inside the first div.',background:'rgb(255, 0, 0)',display:'block'},
   {text:'This text is inside the second div.',background:'rgb(0, 0, 255)',display:'block'},
  ]);
  assert.ok(blocks[1].box.y>=blocks[0].box.bottom,'The browser stacks the two div blocks');
  assert.equal(await iframe.getAttribute('sandbox'),'','Preview is isolated from the app');
  assert.equal(await page.locator('.console-body .typed-output').count(),0,'No console-style substitute for the page');
  const visible=await iframe.evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('.console-body').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom+1&&r.right<=p.right+1;});
  assert.ok(visible,'Both coloured sections fit the visible result area');
  if(theme==='dark')await page.screenshot({path:`/tmp/codestep-div-preview-${width}.png`});
  await page.locator('.console-bar').getByRole('button',{name:'Clear',exact:true}).click();
  assert.equal(await iframe.count(),0,'Clear removes the preview');
  await page.getByRole('button',{name:'Check code',exact:true}).click();
  await iframe.waitFor();
  await editor.fill('<div>Incomplete attempt</div>');
  assert.equal(await iframe.count(),0,'Editing removes the stale accepted result');
  await page.getByRole('button',{name:'Check code',exact:true}).click();
  await page.locator('.feedback.wrong').waitFor();
  assert.equal(await iframe.count(),0,'An unverified attempt does not show an accepted page');
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: actual red/blue HTML, isolated preview, clear/edit/check lifecycle and visible phone layout`);
  await page.close();
 }
}finally{await browser.close();}
