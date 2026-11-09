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
  const active=page.locator('.language-choice[data-active="true"]');
  const style=await active.evaluate(el=>{const s=getComputedStyle(el),a=getComputedStyle(el,'::after');return {radius:s.borderRadius,background:s.backgroundColor,after:a.display};});
  assert.equal(style.radius,'8px');
  assert.equal(style.after,'none','No underline beneath the selected language');
  const copy=page.locator('.comparison-card').last().locator('.copy-code-button');
  await copy.hover();
  assert.notEqual(await copy.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Copy hover uses a filled highlight');
  assert.equal(await copy.evaluate(el=>getComputedStyle(el).borderRadius),'8px');
  if(width>850) {
    assert.equal(await active.locator('img').evaluate(el=>getComputedStyle(el).width),'32px');
    const header=await page.locator('.comparison-topbar').boundingBox(),group=await page.locator('.comparison-header-languages').boundingBox();
    assert.ok(Math.abs(header.y+header.height/2-group.y-group.height/2)<=1,'Language controls are vertically centred in header '+JSON.stringify({header,group,styles:await page.locator('.comparison-header-languages').evaluate(el=>{const s=getComputedStyle(el);return {position:s.position,top:s.top,left:s.left,transform:s.transform}})}));
    assert.ok(Math.abs(header.x+header.width/2-group.x-group.width/2)<=1,'Language controls are horizontally centred in header');
  }
  await page.close();
  console.log(`PASS ${width} ${theme}: drawer geometry, clear unsupported topic and aligned copy buttons`);
 }
} finally {await browser.close();}
