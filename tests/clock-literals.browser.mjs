import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390])for(const [language,card] of [['python','python'],['javascript','js'],['csharp','cs'],['cpp','cpp']]){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:width===390,isMobile:width===390,timezoneId:'Europe/London'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(width=>{localStorage.setItem('codestep-code-blocks','false');localStorage.setItem('codestep-theme',width===390?'dark':'light');},width);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator(`.course-card.${card}-card`).click();
  const choose=async lesson=>{
   if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
   if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
  };
  for(const lesson of lessons[language].filter(item=>item.clockExample)){
   await page.clock.setFixedTime(new Date('2026-11-17T18:28:20Z'));
   await choose(lesson);
   await page.waitForFunction(()=>/minute ===? 29/.test(document.querySelector('.code-guide code')?.textContent??''));
   const guide=await page.locator('.code-guide code').textContent();
   assert.match(guide,/hour ===? 18/);assert.match(guide,/minute ===? 29/);
   assert.doesNotMatch(guide,/timedelta|AddMinutes|Date.now|sleep\(60\)/);
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>window.copied=value}}));
   await page.getByRole('button',{name:'Copy full lesson example for VS Code code',exact:true}).first().click();
   const copied=await page.evaluate(()=>window.copied);
   assert.match(copied,/hour ===? 18/);assert.match(copied,/minute ===? 29/);
   const editor=page.getByRole('textbox',{name:'Code editor',exact:true});
   await editor.fill(copied.slice(0,20));
   await page.clock.setFixedTime(new Date('2026-11-17T19:59:40Z'));
   assert.equal(await editor.inputValue(),copied.slice(0,20),'A changing clock never overwrites the draft');
   assert.match(await page.locator('.code-guide code').textContent(),/minute ===? 29/);
   await editor.fill(copied);
   await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
   await page.getByRole('button',{name:'Compare with another language',exact:true}).click();
   await page.locator('.comparison-card').first().waitFor();
   const examples=await page.locator('.comparison-code-space').allTextContents();
   for(const example of examples){assert.match(example,/hour ===? 18/);assert.match(example,/minute ===? 29/);}
   await page.getByRole('button',{name:'Back to lesson',exact:true}).click();
  }
  await choose(lessons[language][0]);
  await page.clock.setFixedTime(new Date('2026-11-17T23:59:40Z'));
  await choose(lessons[language].find(item=>item.clockExample));
  await page.waitForFunction(()=>/minute ===? 0/.test(document.querySelector('.code-guide code')?.textContent??''));
  const midnight=await page.locator('.code-guide code').textContent();assert.match(midnight,/hour ===? 0/);assert.match(midnight,/minute ===? 0/);
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${language}: next-minute hour/minute literals, stable drafts, exact copies, shared comparison and midnight rollover`);
  await page.close();
 }
}finally{await browser.close();}
