import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const lesson=lessons.html.find(item=>item.referenceKind==='alignment');
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1952,1400,390,430,320]) for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:width>=1400?900:width===320?568:width===430?788:700},hasTouch:width<=850,isMobile:width<=850});
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
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
  if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).tap();
  const choose=async(kind,language='html')=>{
   const selected=lessons[language].find(item=>item.referenceKind===kind);
   if(width<=850)await page.getByRole('button',{name:'Open lesson list',exact:true}).tap();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:selected.title}).click();
   if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).tap();
  };
  const course=async language=>{await page.getByRole('button',{name:'Go home',exact:true}).click();await page.locator(language==='css'?'.course-card.css-card':'.course-card.py-card').click();};
  const code=()=>page.locator('.layout-primary-code').textContent();
  const frame=()=>page.frameLocator('.layout-preview iframe');
  const view=async()=>{const element=frame().locator('h1,p').first();await element.waitFor();return element.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {tag:el.tagName,align:s.textAlign,colour:s.color,size:s.fontSize,font:s.fontFamily,top:r.top,left:r.left};});};
  const setRange=async(name,value)=>page.getByRole('slider',{name,exact:true}).evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  const compact=async kind=>{const boxes=await page.locator('.font-featured-example,.layout-controls,.layout-preview,.html-reference-footer').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));assert.ok(boxes[1].top-boxes[0].bottom<=16,'Controls follow the example');assert.ok(boxes[2].top-boxes[1].bottom<=13,'Preview follows the controls');assert.ok(boxes[3].top-boxes[2].bottom<=12,'No reserved blank space below the preview');const box=await page.locator('.layout-preview .browser-page-preview').boundingBox();assert.equal(box.height,{alignment:170,positioning:220,'combined-styles':140}[kind]);};
  const copy=async label=>{await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>window.copied=value}}));await page.getByRole('button',{name:label,exact:true}).click();return page.evaluate(()=>window.copied);};
  const verifyFiles=async(html,css,selector,expected)=>{const saved=await browser.newPage({viewport:{width,height:700}});await saved.route('https://saved-example.test/**',route=>route.fulfill({contentType:route.request().url().endsWith('.css')?'text/css':'text/html',body:route.request().url().endsWith('.css')?css:html}));await saved.goto('https://saved-example.test/index.html');const result=await saved.locator(selector).evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {align:s.textAlign,colour:s.color,background:s.backgroundColor,top:r.top,left:r.left};});for(const [key,value]of Object.entries(expected))assert.equal(result[key],value,'Copied HTML loads its real external stylesheet');await saved.close();};
  await page.getByRole('button',{name:'Right',exact:true}).click();await page.getByRole('button',{name:'Blue',exact:true}).click();
  assert.equal((await view()).tag,'H1');assert.equal((await view()).align,'right');assert.equal((await view()).colour,'rgb(0, 0, 255)');
  assert.match(await code(),/^<h1 style=/);assert.equal(await copy('Copy layout example code'),await code());await compact('alignment');
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();
  assert.match(await code(),/^h1 \{/);assert.equal(await page.locator('.stylesheet-file-pair .stylesheet-file').count(),2);
  const html=await copy('Copy matching HTML file code');assert.match(html,/<link rel="stylesheet" href="styles.css">/);assert.match(html,/<h1>This text is aligned right\.<\/h1>/);assert.doesNotMatch(html,/style=/);
  const css=await copy('Copy layout example code');await verifyFiles(html,css,'h1',{align:'right',colour:'rgb(0, 0, 255)'});await compact('alignment');
  assert.equal(await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:'Colour and centre text'}).count(),0,'Styling is merged into alignment');
  assert.equal(await page.locator('.drawer-lessons .topic-lesson-button').count(),8);
  if(theme==='dark')await page.screenshot({path:`/tmp/linked-css-alignment-${width}.png`});
  await choose('positioning','css');await setRange('Distance from top',75);await setRange('Distance from left',80);await page.getByRole('button',{name:'20px',exact:true}).click();
  const positioned=await view();assert.equal(positioned.top,75);assert.equal(positioned.left,80);assert.equal(positioned.size,'20px');assert.match(await code(),/margin: 0/);await compact('positioning');
  await verifyFiles(await copy('Copy matching HTML file code'),await copy('Copy layout example code'),'p',{top:75,left:80});
  await course('html');await choose('combined-styles');await page.getByRole('button',{name:'Centre',exact:true}).click();await page.getByRole('button',{name:'Blue',exact:true}).click();await page.getByRole('button',{name:'Georgia',exact:true}).click();
  assert.equal(((await code()).match(/<p[^>]*>/)[0].match(/style=/g)||[]).length,1);assert.doesNotMatch(await code(),/position:|top:|left:|font-size:|height:|margin:/);await compact('combined-styles');
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();assert.equal((await view()).colour,'rgb(0, 0, 255)');assert.equal((await view()).align,'center');assert.match((await view()).font,/Georgia/);await compact('combined-styles');
  assert.equal(await page.getByRole('button',{name:'Finish CSS path →',exact:true}).count(),1);
  if(theme==='dark')await page.screenshot({path:`/tmp/linked-css-recap-${width}.png`});
  await course('css');if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const htmlCopy=page.getByRole('button',{name:'Copy matching HTML file code',exact:true}),header=page.locator('.css-editor-companion .stylesheet-file>header');
  const copyBox=await htmlCopy.boundingBox(),headBox=await header.boundingBox();assert.ok(copyBox.x>=headBox.x&&copyBox.x+copyBox.width<=headBox.x+headBox.width+1,'The copy target fits inside its file header');
  const backgroundHtml=await copy('Copy matching HTML file code');assert.equal(backgroundHtml,'<link rel="stylesheet" href="styles.css">');
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});assert.ok((await page.locator('.editor-body').boundingBox()).height>=80,'The HTML helper never squeezes out the CSS editor');await editor.fill(lessons.css[0].answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
  const body=page.frameLocator('.live-web-panel iframe').locator('body');assert.equal(await body.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(173, 216, 230)');assert.equal(await body.innerText(),'');
  await verifyFiles(backgroundHtml,lessons.css[0].answer,'body',{background:'rgb(173, 216, 230)'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: linked HTML/CSS files, real external stylesheet loading, merged heading controls, exact positioning and compact canvases`);await page.close();
 }
}finally{await browser.close();}
