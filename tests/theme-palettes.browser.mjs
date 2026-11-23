import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
const luminance=colour=>{const c=colour.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.emulateMedia({colorScheme:'light'});await page.goto('https://codestep.test/');
  await page.evaluate(()=>{localStorage.setItem('codestep-theme','system');localStorage.setItem('codestep-code-blocks','false');});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('.course-card').filter({hasText:'C++'}).click();
  if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lessons.cpp.find(l=>l.loopExample).title}).click();
  if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
  const editor=page.getByRole('textbox',{name:'Code editor',exact:true});await editor.fill('// keep this draft');
  for(const [palette,name] of [['ide','Studio'],['ocean','Ocean'],['plum','Plum']]){
   await page.getByRole('button',{name:'Settings',exact:true}).click();
   await page.getByRole('group',{name:'Colour palette',exact:true}).getByRole('button').filter({hasText:name}).click();
   await page.getByRole('button',{name:'Close settings',exact:true}).click();
   await page.waitForFunction(p=>document.documentElement.dataset.palette===p,palette);
   for(const theme of ['light','dark']){
    await page.emulateMedia({colorScheme:theme});await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
    const styles=await page.locator('.loop-example-picker button,.loop-example-picker p,.loop-example-picker p span,.breakdown-part b,.editor-body .code-guide .syntax-api,.editor-body .code-guide .syntax-string').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height&&e.textContent.trim()).map(e=>{let p=e;let background;while(p){background=getComputedStyle(p).backgroundColor;if(background!=='rgba(0, 0, 0, 0)'&&background!=='transparent')break;p=p.parentElement;}return {text:e.textContent.slice(0,35),fg:getComputedStyle(e).color,bg:background};}));
    for(const style of styles)assert.ok(contrast(style.fg,style.bg)>=4.5,`${palette} ${theme} ${style.text}: ${JSON.stringify(style)} ratio=${contrast(style.fg,style.bg)}`);
    assert.ok(await page.locator('.breakdown-part').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderTopWidth==='0px')),'Lesson cards use surfaces without outline borders');
    const inlineKeywords=await page.locator('.lesson-breakdown-sections .prose-code .syntax-keyword').evaluateAll(es=>es.map(e=>getComputedStyle(e).color));
    const editorKeyword=await page.locator('.editor-body .syntax-keyword').first().evaluate(e=>getComputedStyle(e).color);
    assert.ok(inlineKeywords.length>0&&inlineKeywords.every(c=>c===editorKeyword),'Explanation keywords match editor syntax colours');
    assert.equal(await editor.inputValue(),'// keep this draft','Appearance never changes code');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    if(palette==='ide')await page.screenshot({path:`/tmp/studio-${width}-${theme}.png`});
    console.log(`PASS ${width} ${palette}/${theme}: automatic device appearance, readable controls and syntax, intact draft`);
   }
  }
  await page.reload();await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.waitForFunction(()=>document.documentElement.dataset.palette==='plum'&&document.documentElement.dataset.theme==='dark');
  assert.equal(await page.evaluate(()=>localStorage.getItem('codestep-theme')),'system');
  assert.equal(await page.evaluate(()=>localStorage.getItem('codestep-palette')),'plum');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Light light appearance',exact:true}).click();
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
  await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  await page.getByRole('switch',{name:'Code blocks',exact:true}).click();
  await page.getByRole('button',{name:'Close settings',exact:true}).click();
  await page.locator('.course-card').filter({hasText:'C++'}).click();
  if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
  await page.locator('.code-block-choice').first().click();
  const rows=await page.locator('.placed-block').count();assert.ok(rows>0);
  for(const explicit of ['Light','Dark']){
   await page.getByRole('button',{name:'Settings',exact:true}).click();
   await page.getByRole('button',{name:explicit+' '+explicit.toLowerCase()+' appearance',exact:true}).click();
   await page.getByRole('button',{name:'Close settings',exact:true}).click();
   if(width===390)await page.locator('.block-options-toggle').first().click();
   const remove=page.locator('.block-action-buttons button[aria-label^="Remove line"]').first();assert.ok(await remove.isVisible());
   const style=await remove.evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(document.querySelector('.block-program')).backgroundColor}));
   assert.ok(contrast(style.fg,style.bg)>=4.5,JSON.stringify(style));
   assert.equal(await page.locator('.code-block-choice').first().evaluate(e=>getComputedStyle(e).boxShadow),'none');
   await page.screenshot({path:`/tmp/blocks-refreshed-${width}-${explicit}.png`});
  }
  await page.locator('.block-action-buttons button[aria-label^="Remove line"]').first().click();
  assert.equal(await page.locator('.placed-block').count(),rows-1,'Blocks can still be removed after switching appearance');
  console.log(`PASS ${width}: readable block actions, flat choices and unchanged add/remove behaviour`);
  assert.deepEqual(errors,[]);await page.close();
 }
}finally{await browser.close();}
