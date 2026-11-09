import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const bundle=await build({stdin:{contents:`import React from 'react';\n`+source+`\nimport {createRoot} from 'react-dom/client';createRoot(document.getElementById('root')!).render(<LanguageComparison language="python" lesson={lessons.python[0]} editorCode="" showComments={false} onClose={()=>{}} pinLimit={5}/>);`,loader:'tsx',resolveDir:process.cwd()+'/app'},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try {
 for(const width of [1400,390]) for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.setContent(`<html data-theme="${theme}"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('dialog[open]').waitFor();
  const book=await page.getByRole('button',{name:'Lesson explanations',exact:true}).boundingBox();
  const menu=await page.locator('.comparison-example-menu>.drawer-toggle').boundingBox();
  assert.ok(book.x<menu.x,'Book sits to the left of the topic menu');
  assert.ok(Math.abs(book.y+book.height/2-menu.y-menu.height/2)<=1,'Book and menu share their vertical centre');

  for(const header of await page.locator('.comparison-filebar').all()){
   const h=await header.boundingBox(),b=await header.locator('.copy-code-button').boundingBox();
   assert.ok(Math.abs(h.y+h.height/2-b.y-b.height/2)<=1,`Copy vertical alignment ${width} ${theme}`);
  }
  if(width<=850) await page.getByRole('button',{name:'Open comparison examples',exact:true}).click();
  else await page.locator('.example-picker-panel').waitFor();
  assert.ok((await page.locator('.comparison-panel-identity').first().innerText()).includes('Python'));
  assert.ok((await page.locator('.comparison-panel-identity').first().innerText()).includes('Your language'));
  const drawer=await page.locator('.example-picker-panel').boundingBox();
  const choice=page.locator('.example-picker-list .lesson-list-row>button').filter({hasText:'Repeat code every second'});
  await choice.scrollIntoViewIfNeeded();
  const box=await choice.boundingBox();
  assert.ok(box.width>150,'Topic row must not shrink to header icon width');
  assert.ok((await choice.innerText()).includes('No matching Python example'));
  if(width>850){
   const code=await page.locator('.comparison-card').first().boundingBox();
   assert.ok(code.x>=drawer.x+drawer.width-1,'Drawer must not cover either code panel');
  }
  await choice.click();
  if(width>850) assert.equal(await page.locator('.example-picker-panel').isVisible(),true,'Desktop topics stay open after selection');
  assert.match(await page.locator('.comparison-card').first().innerText(),/Python does not have JavaScript's setInterval/);
  assert.match(await page.locator('.comparison-unavailable').innerText(),/loop with a delay or a timer library/);
  assert.equal(await page.locator('.comparison-card').first().locator('.copy-code-button').isDisabled(),true);
  await page.getByRole('button',{name:'Compare with C#',exact:true}).click();
  if(width>850) await page.locator('.example-picker-panel').waitFor();
  const identities=await page.locator('.comparison-panel-identity').allInnerTexts();
  assert.match(identities[0],/Python[\s\S]*Your language/);
  assert.match(identities[1],/C#[\s\S]*Comparing with/);
  assert.equal(await page.locator('.comparison-language-name').count(),3);
  await page.getByRole('button',{name:'Lesson explanations',exact:true}).click();
  const notes=page.locator('.comparison-notes');
  await notes.waitFor();
  const columns=await notes.locator('.comparison-notes-language').all();
  assert.equal(columns.length,2);
  if(width>850){
    const left=await columns[0].boundingBox(),right=await columns[1].boundingBox();
    assert.ok(right.x>=left.x+left.width-1 && Math.abs(right.y-left.y)<=1,'Book compares languages side by side');
  }
  for(const card of await notes.locator('.breakdown-part').all()){
    assert.equal(await card.evaluate(el=>{const s=getComputedStyle(el);return s.borderLeftColor===s.borderRightColor&&s.borderLeftWidth===s.borderRightWidth;}),true,'Book cards have neutral even borders');
  }
  assert.equal(await notes.locator('.comparison-notes-close').evaluate(el=>getComputedStyle(el).borderTopWidth),'0px');
  await notes.locator('.comparison-notes-close').click();
  const active=page.locator('.language-choice[data-active="true"]');
  for(const tile of await page.locator('.language-choice').all()){
    const button=await tile.boundingBox(),name=await tile.locator('.comparison-language-name').boundingBox();
    assert.ok(name.x>=button.x-1 && name.x+name.width<=button.x+button.width+1 && name.y+name.height<=button.y+button.height+1,'Language name fits inside highlight');
  }
  const style=await active.evaluate(el=>{const s=getComputedStyle(el),a=getComputedStyle(el,'::after');return {radius:s.borderRadius,background:s.backgroundColor,after:a.display};});
  assert.equal(style.radius,'8px');
  assert.equal(style.after,'none','No underline beneath the selected language');
  const copy=page.locator('.comparison-card').last().locator('.copy-code-button');
  await copy.hover();
  assert.notEqual(await copy.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Copy hover uses a filled highlight');
  assert.equal(await copy.evaluate(el=>getComputedStyle(el).borderRadius),'8px');
  if(width>850) {
    assert.equal(await active.locator('img').evaluate(el=>getComputedStyle(el).width),'30px');
    const header=await page.locator('.comparison-topbar').boundingBox(),group=await page.locator('.comparison-header-languages').boundingBox();
    assert.ok(Math.abs(header.y+header.height/2-group.y-group.height/2)<=1,'Language controls are vertically centred in header '+JSON.stringify({header,group,styles:await page.locator('.comparison-header-languages').evaluate(el=>{const s=getComputedStyle(el);return {position:s.position,top:s.top,left:s.left,transform:s.transform}})}));
    assert.ok(header.x+header.width-group.x-group.width>=12 && header.x+header.width-group.x-group.width<=32,'Language controls align near the right panel edge');
  }
  await page.close();
  console.log(`PASS ${width} ${theme}: drawer geometry, clear unsupported topic and aligned copy buttons`);
 }
} finally {await browser.close();}
