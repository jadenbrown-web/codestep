import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390,320])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});});
  await page.goto('https://codestep.test/');await page.evaluate(({theme,pins})=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-palette','plum');localStorage.setItem('codestep-code-blocks','false');localStorage.setItem('codestep-pinned-lessons',JSON.stringify({csharp:pins}));},{theme,pins:lessons.csharp.slice(0,2).map(l=>l.title)});await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  for(const button of await page.locator('.settings-panel .theme-options button,.settings-panel .palette-options button').all()){
   assert.equal(await button.evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
   assert.equal(await button.evaluate(e=>getComputedStyle(e).boxShadow),'none');
  }
  await page.getByRole('button',{name:/Ember Soft coral/}).click();
  assert.equal(await page.locator('html').getAttribute('data-palette'),'ember');
  assert.equal(await page.locator('.settings-choice-check').count(),0,'Settings selection uses background alone without ticks');
  for(const toggle of await page.locator('.settings-panel .switch.on').all())assert.equal(await toggle.evaluate(e=>getComputedStyle(e,'::before').content),'none','Switches have no extra tick');
  for(const group of await page.locator('.theme-options,.palette-options').all()){
   const selected=group.locator('button[aria-pressed="true"]'),other=group.locator('button[aria-pressed="false"]').first();
   assert.notEqual(await selected.evaluate(e=>getComputedStyle(e).backgroundColor),await other.evaluate(e=>getComputedStyle(e).backgroundColor),'Selection remains clear without ticks');
  }
  await page.screenshot({path:`/tmp/flat-settings-${width}-${theme}.png`});
  await page.getByRole('button',{name:'Close settings',exact:true}).click();await page.locator('.course-card.cs-card').click();
  if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const filename=page.locator('.editor-file-name'),filebox=await filename.boundingBox(),bar=await page.locator('.editor-panel .panel-bar').boundingBox();
  assert.equal(await filename.textContent(),'Program.cs');assert.ok(filebox.x+filebox.width<=bar.x+bar.width);
  assert.equal(await filename.evaluate(e=>e.scrollWidth>e.clientWidth),false,'Full C# filename fits with two pins');
  assert.equal(await page.locator(width<=850?'.editor-pinned-topics .pinned-topic-chip':'.desktop-header-pins .pinned-topic-chip:visible').count(),2);
  await page.getByRole('button',{name:'Compare with another language',exact:true}).click();
  assert.equal(await page.locator('.comparison-pinned-topics .pinned-topic-chip').count(),2);
  assert.equal(await page.locator('.comparison-filebar .pinned-topic-chip').count(),0,'Pins never compete with file identity');
  const open=async()=>{if(!await page.locator('.example-picker-panel').isVisible())await page.getByRole('button',{name:'Open comparison examples',exact:true}).click();};
  await open();
  assert.equal(await page.locator('input[aria-label="Search comparison examples"]').count(),0);
  const titles=await page.locator('.example-picker-list .example-label strong').allTextContents();assert.deepEqual(titles,lessons.csharp.map(l=>l.title));
  for(const target of ['Python','C++','JavaScript']){
   if(width<=850)await page.getByRole('button',{name:'Close comparison topics',exact:true}).click();
   await page.getByRole('button',{name:'Compare with '+target,exact:true}).click();await open();
   assert.deepEqual(await page.locator('.example-picker-list .example-label strong').allTextContents(),titles,'Switching the target preserves the course menu');
   assert.equal(await page.locator('.comparison-topic-head b').textContent(),'C#');
  }
  const colours=await page.locator('.example-picker-panel .drawer-pins .pinned-topic-label').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));assert.deepEqual(colours,['rgb(0, 214, 194)','rgb(255, 79, 146)'],'Every pin uses its topic colour, including the current one');
  for(const chip of await page.locator('.example-picker-panel .drawer-pins .pinned-topic-chip').all())assert.equal(await chip.evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
  await page.screenshot({path:`/tmp/flat-topics-${width}-${theme}.png`});
  if(width<=850)await page.getByRole('button',{name:'Close comparison topics',exact:true}).click();
  for(const file of await page.locator('.comparison-file-name').all())assert.equal(await file.evaluate(e=>e.scrollWidth>e.clientWidth),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: flat settings, refreshed Ember, full filenames, coloured pins and stable course menu`);await page.close();
 }
}finally{await browser.close();}
