import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const actions=source.slice(source.indexOf('  const lessonActions ='),source.indexOf('\n  const desktopHomeControls ='));
const refStart=source.indexOf('{current!.referenceOnly ? <>');
const reference=source.slice(refStart+1,source.indexOf(' : <>\n          <div className="editor-panel">',refStart))+' : null';
const guideStart=source.indexOf('{(language === "html" || language === "css") && <section className="browser-run-guide"');
const guide=source.slice(guideStart,source.indexOf('          {current!.runHint',guideStart));
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import FontReference from './app/FontReference';import HtmlTextReference from './app/HtmlTextReference';import CopyCodeButton from './app/CopyCodeButton';
const language=window.fixtureLanguage||'html',blockMode=false,settingsOpen=false,showComments=false;
const current={referenceOnly:true,referenceKind:window.fixtureKind,answer:'<p>Full reference</p>'};
const lessonExample=(lesson)=>lesson.answer;const EditorModeSymbol=()=> <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18"/></svg>;
const HighlightedCode=({code})=><>{code}</>;const InlineCode=({code})=><code>{code}</code>;const nextLesson=()=>{};
${actions}
createRoot(document.getElementById('root')).render(<main className="lesson-shell reference-mode mobile-practice"><header className="app-header lesson-nav">{lessonActions}</header><div className={window.innerWidth>850?"lesson-layout drawer-open":"lesson-layout drawer-closed"}><aside className="lesson-drawer"/><aside className="lesson-copy">${guide}</aside><section className="workspace reference-workspace">{${reference}}</section></div></main>);`;
const bundle=await build({stdin:{contents:entry,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'iife',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const css=fs.readFileSync('app/globals.css','utf8');
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 const page=await browser.newPage();
 for(const width of [1400,390]) for(const theme of ['light','dark']) for(const [language,kind] of [['html','text'],['html','fonts'],['html','pages'],['css','css']]){
  await page.setViewportSize({width,height:900});
  await page.setContent(`<html data-theme="${theme}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body><div id="root"></div></body></html>`);
  await page.evaluate(({language,kind})=>{window.fixtureLanguage=language;window.fixtureKind=kind;window.copied=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copied.push(text)}});},{language,kind});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.waitForSelector('.reference-workspace');
  assert.equal(await page.locator('.reference-pane-toolbar').count(),0,'no detached reference heading');
  assert.equal(await page.locator('.browser-run-guide details,.browser-run-guide summary').count(),0,'browser instructions are direct text');
  if(width>850) assert.ok(await page.locator('.browser-run-guide').isVisible());
  if(language==='html') assert.equal(await page.getByRole('button',{name:'Compare with another language',includeHidden:true}).count(),0,'HTML never offers language comparison');
  else {
   const selector=width>850?'.reference-workspace .desktop-pane-actions':'.app-header';
   const centers=await page.locator(selector+' button').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>{const r=e.getBoundingClientRect();return r.y+r.height/2;}));
   assert.ok(Math.max(...centers)-Math.min(...centers)<1,'toolbar controls share a center line');
  }
  const root=page.locator('.reference-workspace');
  if(kind==='fonts'){
   await root.getByRole('button',{name:'Copy Courier New code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),`<p style="font-family: 'Courier New';">Courier New</p>`);
  }else if(kind==='text'){
   await root.getByRole('button',{name:'Copy mark code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),'<mark>Marked text</mark>');
  }else if(kind==='pages'){
   for(const file of ['index.html','page2.html']){
    const article=root.locator('.file-pair article').filter({has:page.locator('header>b',{hasText:file})});
    const code=await article.locator('pre').textContent();
    await article.getByRole('button',{name:`Copy ${file} code`,exact:true}).click();
    assert.equal(await page.evaluate(()=>window.copied.at(-1)),code,'copies the complete displayed file');
   }
  }
  console.log(`PASS ${theme} ${width} ${language}/${kind}: integrated heading, direct instructions, aligned actions and exact copied examples`);
 }
}finally{await browser.close();}
