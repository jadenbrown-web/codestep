import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const a=source.indexOf('<div className="terminal-card"'),b=source.indexOf('</section>',a);
const homeMarkup=source.slice(a,b);
const entry=`import React from 'react';${source}
import {createRoot} from 'react-dom/client';const root=createRoot(document.getElementById('root'));
function Demo({language}){const homeDemoLanguage=language,homeDemoCode=homeDemos[language].code,homeCodeLength=homeDemoCode.length,homeDemoOutput='Hello, coder!',homeOutputLength=homeDemoOutput.length;return <main className="home-shell"><section className="hero">${homeMarkup}</section></main>;}
window.auditHome=(language)=>root.render(<Demo language={language}/>);
window.auditCompare=()=>root.render(<LanguageComparison language="javascript" lesson={lessons.javascript[0]} editorCode="" showComments={false} onClose={()=>{}} pinLimit={5} pinnedTopics={lessons.javascript.slice(0,5).map(l=>l.title)}/>);
window.auditApp=()=>root.render(<Home/>);`;
const bundle=await build({stdin:{contents:entry,loader:'tsx',resolveDir:process.cwd()+'/app'},bundle:true,write:false,format:'iife',platform:'browser',define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
const luminance=colour=>{const c=colour.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
async function readable(locator,label){
 const styles=await locator.evaluateAll(es=>es.filter(e=>e.textContent.trim()).map(e=>{let p=e,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;p=p.parentElement;}return {text:e.textContent.slice(0,30),fg:getComputedStyle(e).color,bg,opacity:getComputedStyle(e).opacity};}));
 for(const s of styles)assert.ok(contrast(s.fg,s.bg)>=4.5,`${label} ${JSON.stringify(s)} ratio=${contrast(s.fg,s.bg)}`);
}
try{
 for(const palette of ['ide','ocean','plum','forest','ember','slate'])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width:1400,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:`<html data-theme="${theme}" data-palette="${palette}"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});});
  await page.goto('https://codestep.test/');await page.addScriptTag({content:bundle.outputFiles[0].text});
  for(const language of ['javascript','csharp','cpp','python','html','css']){
   await page.evaluate(lang=>window.auditHome(lang),language);await page.locator('.terminal-code').waitFor();
   await readable(page.locator('.terminal-code [class*="syntax-"],.terminal-lines small,.terminal-output,.terminal-top>span'),`${palette}/${theme} home ${language}`);
   assert.equal(await page.locator('.terminal-card').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
   if(palette==='ide'&&language==='html')await page.screenshot({path:`/tmp/audit-home-${theme}.png`});
  }
  await page.evaluate(({theme,palette})=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-palette',palette);localStorage.setItem('codestep-code-blocks','true');window.auditApp();},{theme,palette});
  await page.locator('.course-card').filter({hasText:'Python'}).click();
  const choice=page.locator('.code-block-choice').first(),drop=page.locator('.block-drop-end');await choice.waitFor();
  const from=await choice.boundingBox(),to=await drop.boundingBox();
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:8});
  await page.locator('.block-drag-preview').waitFor();
  await readable(page.locator('.block-drag-preview [class*="syntax-"],.block-program .drop-active'),`${palette}/${theme} drag`);
  const ghost=await page.locator('.block-drag-preview').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,expected:getComputedStyle(document.documentElement).getPropertyValue('--app-raised').trim(),border:getComputedStyle(e).borderTopWidth}));
  assert.equal(ghost.border,'0px');
  if(palette==='ide')await page.screenshot({path:`/tmp/audit-drag-${theme}.png`});
  await page.mouse.up();await page.locator('.placed-block').waitFor();
  await page.getByRole('button',{name:'Go home',exact:true}).click();
  await page.locator('.course-card.css-card').click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:'Position text precisely'}).click();
  await page.locator('.layout-reference').waitFor();
  await readable(page.locator('.font-example-heading>b,.stylesheet-file>header>b'),`${palette}/${theme} reference heading`);
  assert.equal(await page.locator('.stylesheet-file-pair .stylesheet-file').count(),2,'Desktop CSS setup remains shown as two files');
  for(const file of await page.locator('.stylesheet-file-pair .stylesheet-file').all())assert.equal(await file.evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
  if(palette==='plum'&&theme==='dark')await page.screenshot({path:'/tmp/audit-reference-plum.png'});
  assert.deepEqual(errors,[]);console.log(`PASS ${palette}/${theme}: all six home demos readable, themed drag ghost and drop, successful block placement`);await page.close();
 }
 for(const width of [1952,1024,390])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('https://codestep.test/**',route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:`<html data-theme="${theme}" data-palette="ide"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:'image/svg+xml'}):route.fulfill({status:404,body:''});});
  await page.goto('https://codestep.test/');await page.addScriptTag({content:bundle.outputFiles[0].text});await page.evaluate(()=>window.auditCompare());await page.locator('dialog[open]').waitFor();
  const header=await page.locator('.comparison-topbar').boundingBox(),languages=await page.locator('.comparison-header-languages').boundingBox();
  if(width>850){const brand=await page.locator('.comparison-topbar>.lesson-brand-group').boundingBox();assert.ok(brand.x+brand.width<=languages.x,'Header groups never overlap');assert.ok(languages.x+languages.width<=header.x+header.width+1,'Language group stays inside its header');}
  const pins=page.locator('.comparison-pinned-topics');assert.equal(await pins.locator('button').count(),5);const pinBox=await pins.boundingBox();assert.ok(pinBox.y>=header.y+header.height,'Pinned topics stay below navigation');
  for(const button of await pins.locator('button').all()){const box=await button.boundingBox();assert.ok(box.x>=pinBox.x-1&&box.x+box.width<=pinBox.x+pinBox.width+1,'Pin buttons fit their row');assert.equal(await button.evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');}
  for(const language of ['C#','Python','C++'])await page.getByRole('button',{name:'Compare with '+language,exact:true}).click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.comparison-code-reveal')].every(e=>e.textContent.includes('3. Exit')));
  await readable(page.locator('.comparison-code-reveal [class*="syntax-"]'),`${width}/${theme} comparison code`);
  const expected=await page.evaluate(()=>{const e=document.createElement('i');e.style.background='var(--editor-bg)';document.body.appendChild(e);const c=getComputedStyle(e).backgroundColor;e.remove();return c;});
  assert.equal(await page.locator('.numbered-comparison-code').first().evaluate(e=>getComputedStyle(e).backgroundColor),expected,'Comparison uses the selected editor appearance');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:`/tmp/audit-compare-${width}-${theme}.png`});
  console.log(`PASS ${width} ${theme}: five pinned topics fit below comparison controls, all language switches work`);await page.close();
 }
}finally{await browser.close();}
