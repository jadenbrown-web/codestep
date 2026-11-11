import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390]) for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedCode=text;}}});},theme);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('.course-card.py-card').click();
  if(width<=850)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:'Colour paragraph text'}).click();
  if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const code=()=>page.locator('.font-featured-example .example-syntax-code').textContent();
  assert.equal(await code(),'<p style="color: red;">This color is red</p>');
  await page.getByRole('button',{name:'Show Blue paragraph code',exact:true}).click();
  await page.getByRole('button',{name:'Copy text colour example code',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.copiedCode),'<p style="color: blue;">This color is blue</p>');
  await page.getByRole('button',{name:'See Blue as a hex value in CSS →',exact:true}).click();
  assert.equal(await code(),'<p style="color: #0000FF;">Blue text</p>');
  await page.getByRole('button',{name:'Use Green hex colour',exact:true}).click();
  await page.getByRole('button',{name:'Copy green HTML tag code',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.copiedCode),'<p style="color: #008000;">Green text</p>');
  await page.getByRole('button',{name:'See Green as a named colour in HTML →',exact:true}).click();
  assert.equal(await code(),'<p style="color: green;">This color is green</p>');
  assert.match(await page.locator('.drawer-summary').textContent(),/0 of/,'Lesson links do not mark exercises complete');
  await page.getByRole('button',{name:'See Green as a hex value in CSS →',exact:true}).click();
  await page.getByRole('button',{name:'Use White hex colour',exact:true}).click();
  await page.getByRole('button',{name:'See White as a named colour in HTML →',exact:true}).click();
  assert.equal(await code(),'<p style="color: white;">This color is white</p>');
  assert.equal(await page.getByRole('button',{name:'Heading <h1>',exact:true}).count(),0);
  assert.equal(await page.locator('.named-text-colour-reference .font-example-label').count(),0);
  const cards=await page.locator('.named-text-colour-grid .html-tag-example').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));
  assert.ok(cards.every(height=>height<=76),'Colour cards stay compact');
  if(width<=850){await page.getByRole('button',{name:'Lesson',exact:true}).click();assert.ok(await page.locator('.colour-lesson-explanation').isVisible());assert.ok(await page.locator('.colour-lesson-explanation .syn-keyword,.colour-lesson-explanation .syn-tag,.colour-lesson-explanation [class*="token"]').count() || await page.locator('.colour-lesson-explanation code span').count());await page.getByRole('button',{name:'Practice',exact:true}).click();}
  if(theme==='dark')await page.screenshot({path:`/tmp/colour-compact-html-${width}.png`});
  const preview=page.locator('[data-text-colour="White"] .named-text-colour-preview');
  assert.notEqual(await preview.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)','White preview has a contrasting background');
  assert.equal(await page.locator('.named-text-colour-grid').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
  await page.getByRole('button',{name:'See White as a hex value in CSS →',exact:true}).click();
  const featured=page.locator('.featured-red-text');
  const box=await featured.evaluate(el=>{const s=getComputedStyle(el);return {radius:parseFloat(s.borderRadius),fits:el.scrollHeight<=el.clientHeight+1};});
  assert.ok(box.radius>=6 && box.fits,'Preview is rounded and fully contained');
  assert.equal(await page.locator('.font-featured-example>span').count(),0,'Long explanation lives in book view');
  assert.equal(await page.locator('.colour-example-grid').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
  if(theme==='dark')await page.screenshot({path:`/tmp/colour-compact-css-${width}.png`});
  assert.deepEqual(errors,[]);
  await page.close();console.log(`PASS ${width} ${theme}: paragraph wording, compact previews, exact copies, bidirectional colour mapping and course links`);
 }
}finally{await browser.close();}
