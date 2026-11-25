import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const title=lessons.html.find(item=>item.referenceKind==='padding').title;
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
const measure=elements=>elements.map(el=>{
 const s=getComputedStyle(el),r=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const text=range.getBoundingClientRect();
 return {padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].map(parseFloat),width:r.width,height:r.height,bottom:r.bottom,background:s.backgroundColor,radius:s.borderRadius,colour:s.color,textInset:text.left-r.left};
});
try{
 for(const width of [1400,390,320]) for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:width>=1400?900:width===320?568:700},hasTouch:width<=850,isMobile:width<=850});
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
  if(width<=850)await page.getByRole('button',{name:'Open lesson list',exact:true}).tap();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:title}).click();
  if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).tap();
  const code=()=>page.locator('.padding-primary-code').textContent();
  const view=async()=>{const paragraphs=page.frameLocator('.padding-preview iframe').locator('p');await paragraphs.first().waitFor();return paragraphs.evaluateAll(measure);};
  const padding=async expected=>{const boxes=await view();assert.equal(boxes.length,2);for(const box of boxes){assert.deepEqual(box.padding,expected);assert.equal(box.background,'rgb(115, 173, 33)');assert.equal(box.radius,'5px');assert.equal(box.colour,'rgb(17, 17, 17)');}return boxes;};
  const setRange=async(name,value)=>{const slider=page.getByRole('slider',{name,exact:true});await slider.scrollIntoViewIfNeeded();await slider.evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);};
  const copy=async label=>{await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>window.copied=value}}));await page.getByRole('button',{name:label,exact:true}).click();return page.evaluate(()=>window.copied);};
  const fitted=async()=>{
   const geometry=await page.frameLocator('.padding-preview iframe').locator('html').evaluate(el=>({height:innerHeight,width:innerWidth,scrollWidth:el.scrollWidth,scrollHeight:el.scrollHeight}));
   const boxes=await view();assert.ok(boxes[1].bottom<=geometry.height,'Both paragraphs fit the preview');assert.ok(geometry.scrollWidth<=geometry.width,'Preview never clips horizontal padding');
   assert.equal(await page.locator('.padding-preview .browser-preview-tab').count(),1,'Single browser header');
   const gaps=await page.locator('.padding-reference').evaluate(el=>{const preview=el.querySelector('.padding-preview').getBoundingClientRect(),note=el.querySelector('.padding-reference-body>p:last-child').getBoundingClientRect(),body=el.querySelector('.padding-reference-body').getBoundingClientRect(),footer=el.querySelector('footer').getBoundingClientRect();return [note.top-preview.bottom,footer.top-body.bottom];});assert.ok(gaps.every(gap=>gap<=12),'Preview explanation and footer follow content without reserved blank space');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  };
  await padding([20,20,20,20]);assert.match(await code(),/padding: 20px;/);
  await setRange('Padding on all sides',12);await padding([12,12,12,12]);assert.match(await code(),/padding: 12px;/);
  await page.getByRole('button',{name:'Each side',exact:true}).click();assert.equal(await page.getByRole('slider').count(),4);
  const expected=[12,12,12,12];
  for(const [index,name,value]of [[0,'Top padding',8],[1,'Right padding',40],[2,'Bottom padding',24],[3,'Left padding',4]]){
   const before=await view();await setRange(name,value);expected[index]=value;const after=await padding(expected);
   if(index===1){assert.equal(after[0].width-before[0].width,28,'Right padding grows the box');assert.equal(after[0].textInset,before[0].textInset,'Right padding does not move or right-align the text');}
  }
  assert.match(await code(),/padding-top: 8px; padding-right: 40px; padding-bottom: 24px; padding-left: 4px;/);
  assert.equal(await copy('Copy padding example code'),await code());
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();await padding(expected);
  assert.equal(await page.locator('.stylesheet-file-pair .stylesheet-file').count(),2);assert.match(await code(),/^p \{/);
  const html=await copy('Copy matching HTML file code'),css=await copy('Copy padding example code');
  assert.equal(html,'<link rel="stylesheet" href="styles.css">\n<p>Welcome to my website</p>\n<p>Thank you for visiting</p>');assert.doesNotMatch(html,/style=/);
  const saved=await browser.newPage({viewport:{width,height:700}});
  await saved.route('https://saved-example.test/**',route=>route.fulfill({contentType:route.request().url().endsWith('.css')?'text/css':'text/html',body:route.request().url().endsWith('.css')?css:html}));
  await saved.goto('https://saved-example.test/index.html');const loaded=await saved.locator('p').evaluateAll(measure);assert.deepEqual(loaded.map(x=>x.padding),[expected,expected]);assert.equal(loaded[0].background,'rgb(115, 173, 33)');await saved.close();
  await fitted();await page.getByRole('button',{name:'All sides',exact:true}).click();await padding([8,8,8,8]);assert.match(await code(),/padding: 8px;/);assert.doesNotMatch(await code(),/padding-(top|right|bottom|left)/);
  for(const value of [0,48]){await setRange('Padding on all sides',value);await padding([value,value,value,value]);await fitted();}
  const slider=page.getByRole('slider',{name:'Padding on all sides',exact:true});await slider.focus();await slider.press('Home');await padding([0,0,0,0]);await slider.press('ArrowRight');await padding([1,1,1,1]);
  await page.getByRole('button',{name:'Each side',exact:true}).click();await page.locator('.padding-reference').evaluate(el=>el.scrollTop=0);
  if(theme==='dark')await page.screenshot({path:`/tmp/padding-css-${width}.png`});
  await page.getByRole('button',{name:'Continue to positioning →',exact:true}).click();await page.locator('.layout-reference[data-layout-kind="positioning"]').waitFor();
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${theme}: all-side and individual padding, linked files, live geometry, keyboard controls and compact preview`);await page.close();
 }
}finally{await browser.close();}
