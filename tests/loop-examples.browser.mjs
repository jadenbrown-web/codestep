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
  const lesson=lessons[language].find(item=>item.loopExample);
  if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
  if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});
  const picker=page.locator('.editor-panel .loop-example-picker');
  await editor.fill(lesson.answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
  await picker.getByRole('button',{name:'For · fixed count',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('textarea[aria-label="Code editor"]')?.value==='');
  await editor.fill(lesson.answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.wrong').waitFor();
  let previous=lesson.answer;
  for(const count of (width===390?[3,5]:[1,3,5]))for(const variable of ['attempt','bar','number']){
   await picker.getByRole('slider',{name:'Number of repeats',exact:true}).evaluate((el,count)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(count));el.dispatchEvent(new Event('input',{bubbles:true}));},count);
   await picker.getByRole('button',{name:variable,exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('textarea[aria-label="Code editor"]')?.value==='');
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async code=>window.copied=code}}));
   await page.getByRole('button',{name:'Copy full lesson example for VS Code code',exact:true}).first().click();
   const answer=await page.evaluate(()=>window.copied);assert.ok(answer.includes(variable));
   if(language==='python')assert.ok(answer.includes(`range(1, ${count+1})`));
   await editor.fill(previous);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.wrong').waitFor();
   await editor.fill(answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
   const label=variable[0].toUpperCase()+variable.slice(1);
   await page.waitForFunction(value=>document.querySelector('.typed-output')?.textContent.includes(value),`${label} ${count}`);
   assert.equal(await page.locator('.typed-output>div').count(),count);previous=answer;
  }
  await page.getByRole('button',{name:'Compare with another language',exact:true}).click();await page.locator('.comparison-card').first().waitFor();
  const otherPicker=page.locator('.language-comparison .loop-example-picker');
  await otherPicker.getByRole('button',{name:'bar',exact:true}).click();
  for(const code of await page.locator('.comparison-code-space').allTextContents())assert.ok(code.includes('bar'));
  await page.getByRole('button',{name:'Back to lesson',exact:true}).click();assert.equal(await editor.inputValue(),previous);
  assert.equal(await picker.getByRole('button',{name:'number',exact:true}).getAttribute('aria-pressed'),'true');
  if(width===390&&language==='python')await page.screenshot({path:'/tmp/codestep-loop-picker-phone.png'});
  await picker.getByRole('button',{name:'While · until correct',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('textarea[aria-label="Code editor"]')?.value==='');
  await page.getByRole('button',{name:'Copy full lesson example for VS Code code',exact:true}).first().click();assert.equal(await page.evaluate(()=>window.copied),lesson.answer);
  assert.equal(await page.locator('.editor-panel select').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${language}: preserved while, counted for, variable names, range bounds, scenario-specific quizzes and comparison isolation`);
  await page.close();
 }
}finally{await browser.close();}
