import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const html=lessons.html.find(item=>item.idLesson==='html'),css=lessons.css.find(item=>item.idLesson==='css');
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');},theme);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  const activate=locator=>width===390?locator.tap():locator.click();
  const choose=async title=>{
   if(width===390)await activate(page.getByRole('button',{name:'Open lesson list',exact:true}));
   await activate(page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:title}));
   if(width===390)await activate(page.getByRole('button',{name:'Practice',exact:true}));
  };
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});
  const style=()=>activate(page.getByRole('button',{name:'Style this paragraph in CSS →',exact:true}));
  const back=()=>activate(page.getByRole('button',{name:'← HTML ID lesson',exact:true}));
  const check=()=>activate(page.getByRole('button',{name:'Check code',exact:true}));
  const paragraph=page.frameLocator('iframe.browser-result-preview').locator('p');
  const colour=async()=>{await paragraph.waitFor();return paragraph.evaluate(el=>getComputedStyle(el).color);};
  const startWithCss=width===1400&&theme==='light';
  if(startWithCss){
   await activate(page.locator('.course-card.css-card'));await choose(css.title);
   await editor.fill(css.answer);await check();await page.locator('.feedback.correct').waitFor();
   assert.equal(await colour(),'rgb(0, 0, 255)','Starting from CSS uses the matching example paragraph');
   await back();assert.match(await page.locator('.drawer-summary').textContent(),/0 of 18/);
  }else{await activate(page.locator('.course-card.py-card'));await choose(html.title);}

  assert.equal(await page.getByRole('button',{name:'Style this paragraph in CSS →',exact:true}).count(),0,'Complete HTML before linking to CSS');
  const htmlAttempt=html.answer.replaceAll('"',"'");
  await editor.fill(htmlAttempt);await check();await page.locator('.feedback.correct').waitFor();
  assert.equal(await paragraph.textContent(),'CSS turns this paragraph blue.');
  assert.equal(await colour(),'rgb(0, 0, 0)','The HTML ID alone does not change the text colour');
  assert.ok(await page.getByRole('button',{name:'Next lesson →',exact:true}).isVisible());
  await style();
  assert.equal(await page.locator('.lesson-copy h1').textContent(),css.title);
  assert.match(await page.locator('.drawer-summary').textContent(),startWithCss?/3 of 6/:/0 of 6/,'The link does not complete CSS lessons');
  const cssAttempt=css.answer.replace('blue','#0000FF');
  await editor.fill(cssAttempt);await back();
  assert.equal(await editor.inputValue(),htmlAttempt,'The actual HTML draft survives the round trip');
  assert.ok(await page.locator('.feedback.correct').isVisible());
  await style();
  assert.equal(await editor.inputValue(),cssAttempt,'An unfinished CSS draft is preserved');
  assert.ok(await page.getByRole('button',{name:'Check code',exact:true}).isVisible());
  await check();await page.locator('.feedback.correct').waitFor();
  assert.equal(await colour(),'rgb(0, 0, 255)','Submitted CSS is applied to the preserved HTML');
  assert.equal(await paragraph.getAttribute('id'),'p1');
  assert.ok(await page.getByRole('button',{name:'Next lesson →',exact:true}).isVisible());
  const actions=await page.locator('.lesson-feedback-actions button').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom};}));
  assert.ok(actions.every(box=>box.left>=0&&box.right<=width&&box.bottom<=844),'Both lesson actions fit the phone/desktop viewport');
  if(theme==='dark')await page.screenshot({path:`/tmp/codestep-linked-ids-${width}.png`});
  await back();assert.equal(await editor.inputValue(),htmlAttempt);assert.equal(await colour(),'rgb(0, 0, 0)');
  await style();assert.equal(await editor.inputValue(),cssAttempt);assert.equal(await colour(),'rgb(0, 0, 255)','The checked CSS result is restored');
  await activate(page.locator('.console-bar').getByRole('button',{name:'Clear',exact:true}));
  assert.equal(await page.locator('iframe.browser-result-preview').count(),0);
  await back();await style();
  assert.ok(await page.getByRole('button',{name:'Check code',exact:true}).isVisible(),'Clear is not undone by linked navigation');
  await check();await page.locator('.feedback.correct').waitFor();
  await activate(page.getByRole('button',{name:'Next lesson →',exact:true}));
  assert.equal(await page.locator('.lesson-copy h1').textContent(),'Compare website fonts','CSS Next lesson still follows the original path');
  await activate(page.locator('.home-button:visible').first());
  await activate(page.locator('.course-card.py-card'));await choose(html.title);
  await page.locator('.feedback.correct').waitFor();
  assert.equal(await editor.inputValue(),htmlAttempt);
  await activate(page.getByRole('button',{name:'Next lesson →',exact:true}));
  assert.equal(await page.locator('.lesson-copy h1').textContent(),'Use a button instead of while (true)','HTML Next lesson still follows the original path');
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: linked IDs, exact drafts, actual CSS rendering, both Next actions, progress and clear lifecycle`);
  await page.close();
 }
}finally{await browser.close();}
