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
  await editor.fill(lesson.answer);
  const check=async value=>{
   await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
   await page.waitForFunction(value=>document.querySelector('.typed-output>div')?.textContent.includes(value),value);
   assert.match(await page.locator('.run-line').textContent(),/current local time/);
   assert.doesNotMatch(await page.locator('.typed-output').textContent(),/Time reached!/);
  };
  const clear=()=>page.locator('.console-bar').getByRole('button',{name:'Clear',exact:true}).click();
  await check('09:05');
  await page.clock.setFixedTime(new Date('2026-11-17T09:06:45Z'));
  assert.match(await page.locator('.typed-output>div').textContent(),/09:05/,'A single clock reading does not keep ticking');
  await clear();await check('09:06');
  await page.clock.setFixedTime(new Date('2026-11-18T00:00:01Z'));
  await clear();await check('00:00');
  assert.equal(await editor.inputValue(),lesson.answer);
  if(width===390 && language==='python')await page.screenshot({path:'/tmp/codestep-current-clock-phone.png'});
  await page.getByRole('button',{name:'Compare with another language',exact:true}).click();await page.locator('.comparison-card').first().waitFor();
  for(const example of await page.locator('.comparison-code-space').allTextContents())assert.doesNotMatch(example,/setInterval|while|hour ===|hour ==|Time reached!/);
  await page.getByRole('button',{name:'Back to lesson',exact:true}).click();
  await editor.fill('invalid');assert.equal(await page.locator('.typed-output').count(),0);
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${language}: actual current time, fixed single reading, fresh check, midnight and matching comparison`);
  await page.close();
 }
}finally{await browser.close();}
