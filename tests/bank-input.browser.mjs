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
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:width===390,isMobile:width===390});
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
  const lesson=lessons[language].find(item=>item.interactiveInput==='bank-deposit');
  if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
  if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});
  await editor.fill(lesson.answer);await page.getByRole('button',{name:'Check code',exact:true}).click();
  const input=page.getByRole('textbox',{name:'Deposit amount',exact:true});await input.waitFor();
  assert.equal(await page.locator('.bank-starting-balance').textContent(),'Starting balance: £100');
  assert.equal(await page.locator('.typed-output').count(),0);
  for(const [amount,result] of [['50','150'],['25','125'],['0','100'],['-10','90']]){
   await input.fill(amount);
   if(amount==='25')await input.press('Enter');else await page.getByRole('button',{name:'Deposit',exact:true}).click();
   assert.equal(await page.locator('.club-terminal-result').textContent(),`New balance: £${result}`);
  }
  for(const value of ['','abc','2.5']){
   await input.fill(value);await input.press('Enter');assert.equal(await page.locator('.club-terminal-result').textContent(),'Enter a whole number, such as 50.');
  }
  await input.fill('50');await input.press('Enter');assert.equal(await page.locator('.club-terminal-result').textContent(),'New balance: £150');
  const fit=await page.locator('.club-terminal-form').evaluate(el=>el.scrollWidth<=el.clientWidth);assert.ok(fit);
  if(width===390&&language==='python')await page.screenshot({path:'/tmp/codestep-bank-phone.png'});
  await page.locator('.console-bar').getByRole('button',{name:'Clear',exact:true}).click();assert.equal(await input.count(),0);
  await page.getByRole('button',{name:'Check code',exact:true}).click();await input.waitFor();assert.equal(await input.inputValue(),'');
  await editor.fill('invalid');assert.equal(await input.count(),0);
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${language}: starting balance, live deposit, whole-number validation, repeat runs and clear/edit lifecycle`);
  await page.close();
 }
}finally{await browser.close();}
