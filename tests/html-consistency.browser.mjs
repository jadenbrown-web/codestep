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
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import FontReference from './app/FontReference';import HtmlTextReference from './app/HtmlTextReference';import CopyCodeButton from './app/CopyCodeButton';import CssVisualReference from './app/CssVisualReference';
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
 for(const width of [1400,390]) for(const theme of ['light','dark']) for(const [language,kind] of [['html','text'],['html','fonts'],['html','pages'],['css','css'],['css','colours']]){
  await page.setViewportSize({width,height:900});
  await page.setContent(`<html data-theme="${theme}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body><div id="root"></div></body></html>`);
  await page.evaluate(({language,kind})=>{window.fixtureLanguage=language;window.fixtureKind=kind;window.copied=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copied.push(text)}});},{language,kind});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.waitForSelector('.reference-workspace');
  assert.equal(await page.locator('.reference-pane-toolbar').count(),0,'no detached reference heading');
  assert.equal(await page.locator('.browser-run-guide details,.browser-run-guide summary').count(),0,'browser instructions are direct text');
  if(width>850) assert.ok(await page.locator('.browser-run-guide').isVisible());
  if(language==='html'||language==='css') assert.equal(await page.getByRole('button',{name:'Compare with another language',includeHidden:true}).count(),0,'HTML and CSS never offer language comparison');
  {
   const selector=width>850?'.reference-workspace .desktop-pane-actions':'.app-header';
   const centers=await page.locator(selector+' button').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>{const r=e.getBoundingClientRect();return r.y+r.height/2;}));
   assert.ok(Math.max(...centers)-Math.min(...centers)<1,'toolbar controls share a center line');
  }
  const root=page.locator('.reference-workspace');
  assert.equal(await root.locator('.lesson-actions .copy-code-button').count(),0,'no example copy control among navigation icons');
  const misplaced=await root.locator('.copy-code-button').evaluateAll(es=>es.filter(e=>!e.closest('.visual-example-code,.tag-card-heading,.file-example-code')).map(e=>e.getAttribute('aria-label')));
  assert.deepEqual(misplaced,[],'each copy button is beside the code it copies');
  const alignment=await root.locator('.visual-example-code,.tag-card-heading,.file-example-code').evaluateAll(es=>es.map(e=>{
   const code=e.querySelector('code'),icon=e.querySelector('.copy-code-button svg');
   if(!code||!icon)return null;const c=code.getBoundingClientRect(),i=icon.getBoundingClientRect();
   return {text:code.textContent.slice(0,30),icon:i.y+i.height/2,first:c.y+parseFloat(getComputedStyle(code).lineHeight)/2,difference:Math.abs((i.y+i.height/2)-(c.y+parseFloat(getComputedStyle(code).lineHeight)/2))};
  }).filter(Boolean));
  for(const item of alignment)assert.ok(item.difference<1,`${kind}: copy icon aligns with the first code line (${JSON.stringify(item)})`);
  if(width>850){
   const offsets=await root.evaluate(el=>{
    const pane=el.firstElementChild;const rect=pane.getBoundingClientRect();
    const shell=document.createElement('main');shell.className='lesson-shell';shell.style.cssText=`position:fixed;left:-10000px;top:0;width:${rect.width}px;height:100px`;
    const editor=document.createElement('div');editor.className='editor-panel';
    editor.innerHTML='<div class="panel-bar"><div class="file-tab">main.js</div><div class="panel-actions"><button class="copy-code-button" aria-label="Copy code"></button><button class="editor-expand-button" aria-label="Expand"></button><button class="editor-reset-button" aria-label="Reset"></button><div class="desktop-pane-actions"><div class="lesson-actions"><button class="drawer-toggle editor-mode-toggle" aria-label="Use blocks"></button><button class="compare-language-button" aria-label="Compare"></button><button class="settings-button" aria-label="Settings"></button></div></div></div></div>';
    shell.append(editor);document.body.append(shell);
    const baseline=editor.getBoundingClientRect();
    const result=['.editor-mode-toggle','.settings-button'].map(selector=>{const actual=pane.querySelector(selector).getBoundingClientRect();const expected=editor.querySelector(selector).getBoundingClientRect();return {x:(rect.right-actual.x-actual.width/2)-(baseline.right-expected.x-expected.width/2),y:(actual.y+actual.height/2-rect.y)-(expected.y+expected.height/2-baseline.y)};});
    shell.remove();return result;
   });
   for(const offset of offsets){assert.ok(Math.abs(offset.x)<1,'navigation matches the editor right-hand positions');assert.ok(Math.abs(offset.y)<1,'navigation matches the editor top positions');}
  }
  if(kind==='css'||kind==='colours'){
   const clipped=await root.locator('.html-tag-example').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1).map(e=>e.outerHTML));
   assert.deepEqual(clipped,[],'visual cards do not clip their labels or previews');
   const heading=await root.locator('.font-example-heading').boundingBox();
   const pane=await root.locator('.css-visual-reference').boundingBox();
   assert.ok(heading.y>=pane.y&&heading.x>=pane.x,'featured heading stays inside the pane');
   if(width===1400&&theme==='light') await root.screenshot({path:`/tmp/codestep-${kind}-reference.png`});
  }
  if(kind==='fonts'){
   await root.getByRole('button',{name:'Show Lucida Console code',exact:true}).click();
   await root.getByRole('button',{name:'Copy font example code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),`<p style="font-family: 'Lucida Console';">Lucida Console</p>`);
   assert.equal(await root.locator('[data-font] button[aria-pressed="true"]').count(),1,'one font drives the displayed example');
   await root.getByRole('button',{name:'Show Courier New code',exact:true}).click();
   await root.getByRole('button',{name:'Copy font example code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),`<p style="font-family: 'Courier New';">Courier New</p>`);
  }else if(kind==='text'){
   await root.getByRole('button',{name:'Copy text elements example code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),'<h1>Main heading</h1>\n<h2>Main sections</h2>');
   await root.getByRole('button',{name:'Copy mark code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),'<mark>Marked text</mark>');
  }else if(kind==='css'){
   await root.getByRole('button',{name:'Show Solid border code',exact:true}).click();
   await root.getByRole('button',{name:'Copy border example code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),'p.notice {\n  border: 5px solid red;\n}');
  }else if(kind==='colours'){
   await root.getByRole('button',{name:'Copy Blue hex code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),'#0000FF');
   await root.getByRole('button',{name:'Copy red HTML tag code',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.copied.at(-1)),'<p style="color: #FF0000;">Red text</p>');
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
