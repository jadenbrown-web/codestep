import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {inHtmlFile,openHtmlLesson} from './web-file-helpers.mjs';

const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
const sizes=[{width:390,heights:[568,700,850,1000]},{width:320,heights:[568]},{width:430,heights:[788]},{width:1400,heights:[900]}];
const summaries=[];
const cases=sizes.flatMap(({width,heights})=>heights.flatMap(height=>['light','dark'].map(theme=>({width,height,theme}))));

try{
 const pending=[...cases];
 await Promise.all(Array.from({length:4},async()=>{
  while(pending.length){
   const {width,height,theme}=pending.shift();
   const page=await browser.newPage({viewport:{width,height},hasTouch:width<=850,isMobile:width<=850});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.route('https://codestep.test/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
    return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
   });
   await page.goto('https://codestep.test/');await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');},theme);
   await page.addScriptTag({content:bundle.outputFiles[0].text});await page.locator('.course-card.css-card').click();
   const choose=async(kind,language='css')=>{
    if(width<=850)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
    await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lessons[language].find(lesson=>lesson.referenceKind===kind).title}).click();
    if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).click();
   };
   const settle=async()=>page.evaluate(async()=>{
    let previous='',same=0;
    for(let frame=0;frame<30;frame++){
     await new Promise(requestAnimationFrame);
     const reference=document.querySelector('.layout-reference,.padding-reference');if(!reference)continue;
     const code=reference.querySelector('.layout-primary-code,.padding-primary-code'),button=reference.querySelector('.layout-choice,.padding-mode button');
     const current=JSON.stringify([reference.clientHeight,reference.scrollHeight,getComputedStyle(code).fontSize,button?.getBoundingClientRect().height,reference.style.cssText]);
     if(current===previous){if(++same===3)return;}else same=0;
     previous=current;
    }
   });
   const metric=async()=>page.locator('.layout-reference,.padding-reference').evaluate(reference=>{
    reference.scrollTop=0;
    const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,width:r.width};};
    const workspace=reference.closest('.reference-workspace'),style=getComputedStyle(workspace),code=reference.querySelector('.layout-primary-code,.padding-primary-code');
    const controls=reference.querySelector('.layout-controls'),preview=reference.querySelector('.layout-preview,.padding-preview');
    const paddingStart=reference.querySelector('.padding-mode'),paddingEnd=reference.querySelector('.padding-reference-body>.padding-explanation');
    const controlsRect=controls?rect(controls):{...rect(paddingStart),bottom:paddingEnd.getBoundingClientRect().bottom};
    return {root:rect(reference),workspace:rect(workspace),contentBottom:workspace.getBoundingClientRect().bottom-parseFloat(style.paddingBottom),contentTop:workspace.getBoundingClientRect().top+parseFloat(style.paddingTop),scroll:reference.scrollHeight,client:reference.clientHeight,fill:parseFloat(reference.style.getPropertyValue('--reference-fill-height')),room:parseFloat(reference.style.getPropertyValue('--reference-room'))||0,font:parseFloat(getComputedStyle(code).fontSize),controlHeight:reference.querySelector('.layout-choice,.padding-mode button').getBoundingClientRect().height,featured:rect(reference.querySelector('.font-featured-example')),controls:controlsRect,preview:rect(preview),footer:rect(reference.querySelector('footer')),browser:rect(preview.querySelector('.browser-page-preview'))};
   });
   const verifyFlow=async(kind,language='css')=>{
    await settle();const m=await metric();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}×${height}: no horizontal page overflow`);
    assert.ok(m.controls.top-m.featured.bottom<=24,`${kind}: controls remain directly after code`);
    assert.ok(m.preview.top-m.controls.bottom<=24,`${kind}: preview follows controls without a spacer`);
    if(width>850){assert.equal(m.font,13,'Desktop code keeps its existing size');if(kind!=='padding')assert.equal(m.browser.height,{alignment:170,positioning:220,'combined-styles':140}[kind],'Desktop previews retain their standard sizes');}
    else if(Number.isFinite(m.fill)){
     assert.ok(Math.abs(m.root.bottom-m.contentBottom)<=3,`${kind}: fitting phone reference uses the workspace bottom: ${JSON.stringify(m)}`);
     assert.ok(m.scroll<=m.client+2,`${kind}: fitting phone content does not require extra scrolling`);
    }
    const footer=page.locator('.layout-reference footer button,.padding-reference footer button');await footer.scrollIntoViewIfNeeded();
    const reachable=await footer.evaluate(el=>{const r=el.getBoundingClientRect(),pane=el.closest('.layout-reference,.padding-reference').getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {height:r.height,inside:r.top>=pane.top-1&&r.bottom<=pane.bottom+1,hit:hit===el||el.contains(hit)};});
    assert.ok(reachable.height>=44&&reachable.inside&&reachable.hit,`${kind}/${language}: footer remains reachable`);
    await page.locator('.layout-reference,.padding-reference').evaluate(el=>el.scrollTop=0);return m;
   };
   const setRange=async(name,value)=>{const slider=page.getByRole('slider',{name,exact:true});await slider.scrollIntoViewIfNeeded();await slider.evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);};
   const checkFrame=async(selector,expected)=>{
    const target=page.frameLocator('.layout-preview iframe,.padding-preview iframe').locator(selector);await target.first().waitFor();
    const result=await target.evaluateAll(es=>es.map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {top:r.top,left:r.left,bottom:r.bottom,right:r.right,width:innerWidth,height:innerHeight,font:s.fontSize,align:s.textAlign,colour:s.color,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].map(parseFloat)};}));
    for(const item of result){for(const [key,value]of Object.entries(expected))assert.deepEqual(item[key],value,`Preview CSS ${key} remains exact`);assert.ok(item.bottom<=item.height+1&&item.right<=item.width+1,'The preview contains its content without clipping');}
   };

   await choose('combined-styles');const combined=await verifyFlow('combined-styles');summaries.push({width,height,theme,...combined});
   if(width===390&&height>=850)assert.ok(Number.isFinite(combined.fill),`Tall phones must use the spare workspace: ${JSON.stringify(combined)}`);
   if(width<=850)await page.screenshot({path:`/tmp/reference-space-${width}-${height}-${theme}.png`});
   if(width===390&&height===850&&theme==='light'){
    await page.getByRole('button',{name:'Courier New',exact:true}).click();const retained=await page.locator('.layout-primary-code').textContent();
    await page.setViewportSize({width:390,height:568});const compact=await verifyFlow('combined-styles');
    await page.setViewportSize({width:390,height:850});const recovered=await verifyFlow('combined-styles');assert.ok(Number.isFinite(recovered.fill)&&recovered.font>compact.font,'Room recovers after shrinking and growing the same phone page');
    await page.setViewportSize({width:1400,height:900});await settle();const desktop=await metric();assert.equal(desktop.font,13);assert.equal(desktop.browser.height,140);assert.equal(Number.isFinite(desktop.fill),false,'Desktop clears adaptive height');
    await page.setViewportSize({width:390,height:850});await verifyFlow('combined-styles');assert.equal(await page.locator('.layout-primary-code').textContent(),retained,'Resize transitions preserve the selected example');
   }
   for(const name of ['Right','Blue','Georgia'])await page.getByRole('button',{name,exact:true}).click();await settle();
   const combinedCode=await page.locator('.layout-primary-code').textContent();assert.match(combinedCode,/color: blue;/);assert.match(combinedCode,/font-family: Georgia;/);assert.match(combinedCode,/text-align: right;/);await checkFrame('p',{font:'16px',align:'right',colour:'rgb(0, 0, 255)'});
   await openHtmlLesson(page,width);await verifyFlow('combined-styles','html');assert.match(await page.locator('.layout-primary-code').textContent(),/^<p style="color: blue; font-family: Georgia; text-align: right;">/);await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();assert.equal(await page.locator('.layout-primary-code').textContent(),combinedCode,'Responsive changes preserve HTML/CSS choices');
   await inHtmlFile(page,width,async file=>assert.match(await file.locator('.companion-html-code').textContent(),/<link rel="stylesheet" href="styles.css">/));

   await choose('alignment');await verifyFlow('alignment');await checkFrame('h1',{font:'32px',align:'right',colour:'rgb(0, 0, 255)'});
   await choose('positioning');await setRange('Distance from top',100);await setRange('Distance from left',100);await page.getByRole('button',{name:'24px',exact:true}).click();await verifyFlow('positioning');await checkFrame('p',{top:100,left:100,font:'24px'});
   await choose('padding');await setRange('Padding on all sides',48);await verifyFlow('padding');await checkFrame('p',{padding:[48,48,48,48]});
   assert.doesNotMatch(await page.locator('.padding-primary-code').textContent(),/width:|font-size:|background-color:|border-radius:|color:/,'Adaptive presentation never adds CSS to the lesson example');
   await page.getByRole('button',{name:'Each side',exact:true}).click();for(const [side,value]of [['Top',8],['Right',40],['Bottom',24],['Left',4]])await setRange(`${side} padding`,value);await verifyFlow('padding');await checkFrame('p',{padding:[8,40,24,4]});
   await openHtmlLesson(page,width);await verifyFlow('padding','html');await checkFrame('p',{padding:[8,40,24,4]});await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();await settle();assert.match(await page.locator('.padding-primary-code').textContent(),/padding-top: 8px;[\s\S]*padding-right: 40px;[\s\S]*padding-bottom: 24px;[\s\S]*padding-left: 4px;/);
   assert.deepEqual(errors,[]);console.log(`PASS ${width}×${height} ${theme}: available reference space, readable controls, exact examples, reachable footer and unclipped previews`);await page.close();
  }
 }));
 for(const theme of ['light','dark']){
  const short=summaries.find(item=>item.width===390&&item.height===568&&item.theme===theme),tall=summaries.find(item=>item.width===390&&item.height===850&&item.theme===theme),extraTall=summaries.find(item=>item.width===390&&item.height===1000&&item.theme===theme);
  assert.ok(tall.font>short.font,'Spare phone space makes code larger');assert.ok(tall.controlHeight>short.controlHeight,'Spare phone space makes controls larger');assert.ok(extraTall.browser.height>tall.browser.height,'Additional phone height expands the preview instead of leaving a bottom gap');
 }
}finally{await browser.close();}
