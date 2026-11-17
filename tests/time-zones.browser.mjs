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
  await page.clock.setFixedTime(new Date('2026-11-17T09:05:30Z'));
  const lesson=lessons[language].find(item=>item.displayCurrentTime);
  if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
  if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});
  const picker=page.locator('.editor-panel .time-zone-picker');
  const trigger=picker.locator('.time-zone-trigger');
  assert.equal(await picker.locator('select').count(),0);
  await trigger.click();await picker.getByRole('button',{name:'Paris, France',exact:true}).waitFor();
  await trigger.press('Escape');assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  const zones=[['Europe/Paris','Paris, France','10:05'],['America/New_York','New York, USA','04:05'],['America/Los_Angeles','Los Angeles, USA','01:05'],['Europe/London','London, United Kingdom','09:05']];
  let previous=lesson.answer;
  for(const [id,label,value] of zones){
   await trigger.click();
   assert.equal(await picker.locator('.time-zone-options button').count(),5);
   if(width===390&&language==='python'&&id==='Europe/Paris')await page.screenshot({path:'/tmp/codestep-zone-menu-phone.png'});
   await picker.getByRole('button',{name:label,exact:true}).click();
   assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   await page.waitForFunction(()=>document.querySelector('textarea[aria-label="Code editor"]')?.value==='');
   assert.equal(await editor.inputValue(),'');
   assert.equal(await page.locator('.typed-output').count(),0);
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async code=>window.copied=code}}));
   await page.getByRole('button',{name:'Copy full lesson example for VS Code code',exact:true}).first().click();
   const answer=await page.evaluate(()=>window.copied);assert.ok(answer.includes(id));
   await editor.fill(previous);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.wrong').waitFor();
   await editor.fill(answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
   await page.waitForFunction(value=>document.querySelector('.typed-output>div')?.textContent.includes(value),value);
   assert.ok((await page.locator('.run-line').textContent()).includes(label));
   await page.clock.setFixedTime(new Date('2026-11-17T09:06:30Z'));
   assert.ok((await page.locator('.typed-output>div').textContent()).includes(value));
   await page.clock.setFixedTime(new Date('2026-11-17T09:05:30Z'));previous=answer;
  }
  await page.getByRole('button',{name:'Compare with another language',exact:true}).click();await page.locator('.comparison-card').first().waitFor();
  const comparisonPicker=page.locator('.language-comparison .time-zone-picker');await comparisonPicker.locator('.time-zone-trigger').click();await comparisonPicker.getByRole('button',{name:'Paris, France',exact:true}).click();
  for(const code of await page.locator('.comparison-code-space').allTextContents())assert.ok(code.includes('Europe/Paris'));
  await page.getByRole('button',{name:'Back to lesson',exact:true}).click();assert.equal(await editor.inputValue(),previous);
  assert.ok((await trigger.textContent()).includes('London'));
  await trigger.click();await picker.getByRole('button',{name:'Your local time',exact:true}).click();
  await editor.fill(lesson.answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${language}: app-styled zone menu, selection/reset, location-specific quiz/output, stable clock and comparison isolation`);
  await page.close();
 }
}finally{await browser.close();}
