import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});});
  await page.goto('https://codestep.test/');await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');},theme);await page.addScriptTag({content:bundle.outputFiles[0].text});
  const choose=async title=>{if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:title}).click();if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();};
  await page.locator('.course-card.py-card').click();await choose(lessons.html.find(l=>l.browserPreview==='headings').title);
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});const frame=page.frameLocator('iframe.browser-result-preview');
  await editor.pressSequentially('<h1>Typing live</h1>',{delay:8});await frame.getByRole('heading',{name:'Typing live',exact:true}).waitFor();
  assert.equal(await page.locator('.browser-page-preview .browser-preview-navigation').count(),1,'Every live page has browser chrome');
  assert.equal(await page.locator('.feedback.correct').count(),0,'Rendering never accepts a quiz automatically');
  assert.ok(await editor.evaluate(e=>e===document.activeElement&&e.selectionStart===e.value.length),'Live rendering preserves editor focus and caret');
  await editor.fill('<h1>Changed live</h1><p>New paragraph</p>');await frame.getByText('New paragraph',{exact:true}).waitFor();
  assert.equal(await page.locator('.live-web-panel .typed-output,.live-web-panel .prompt-mark').count(),0,'The live view is a web page rather than a console');
  const expected=lessons.html.find(l=>l.browserPreview==='headings').answer;await editor.fill(expected);await frame.getByRole('heading',{name:'Main section',exact:true}).waitFor();
  await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
  await page.getByRole('button',{name:'Clear check',exact:true}).click();await frame.getByRole('heading',{name:'Main section',exact:true}).waitFor();
  assert.equal(await editor.inputValue(),expected);
  await page.screenshot({path:`/tmp/live-web-${width}-${theme}.png`});
  await choose('Send a value back with return');await editor.fill(lessons.html.find(l=>l.title==='Send a value back with return').answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
  await page.locator('.live-script-result').getByText('Hello',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Go home',exact:true}).click();await page.locator('.course-card.css-card').click();
  await editor.fill('body { background-color: papayawhip; } p { color: blue; text-align: center; }');
  await page.waitForFunction(()=>document.querySelector('iframe.browser-result-preview')!==null);
  await frame.locator('p').waitFor();
  const styles=await frame.locator('p').evaluate(e=>({colour:getComputedStyle(e).color,align:getComputedStyle(e).textAlign,bg:getComputedStyle(e.ownerDocument.body).backgroundColor}));
  assert.deepEqual(styles,{colour:'rgb(0, 0, 255)',align:'center',bg:'rgb(255, 239, 213)'});
  assert.equal(await page.locator('.feedback.correct').count(),0);
  await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.wrong').waitFor();
  assert.equal(await frame.locator('p').evaluate(e=>getComputedStyle(e).color),'rgb(0, 0, 255)','Quiz feedback does not remove the current live page');
  assert.equal(await page.locator('iframe.browser-result-preview').getAttribute('sandbox'),'');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: real typing, preserved focus, live HTML/CSS, separate quiz validation and checked script results`);await page.close();
 }
}finally{await browser.close();}
