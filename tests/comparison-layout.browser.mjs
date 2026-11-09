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
  await page.getByRole('button',{name:'Open comparison examples',exact:true}).click();
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
  assert.match(await page.locator('.comparison-card').first().innerText(),/Python does not have JavaScript's setInterval/);
  assert.match(await page.locator('.comparison-unavailable').innerText(),/loop with a delay or a timer library/);
  assert.equal(await page.locator('.comparison-card').first().locator('.copy-code-button').isDisabled(),true);
  await page.close();
  console.log(`PASS ${width} ${theme}: drawer geometry, clear unsupported topic and aligned copy buttons`);
 }
} finally {await browser.close();}
