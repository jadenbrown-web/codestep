import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8');
const bundle=await build({stdin:{contents:`import React from 'react';\n`+source+`\nimport {createRoot} from 'react-dom/client';createRoot(document.getElementById('root')!).render(<LanguageComparison language="python" lesson={lessons.python[0]} editorCode="" showComments={false} onClose={()=>{}} pinLimit={5}/>);`,loader:'tsx',resolveDir:process.cwd()+'/app'},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390,320])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('https://codestep.test/**',route=>{const path=new URL(route.request().url()).pathname;return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:'image/svg+xml'}):route.fulfill({status:404,body:''});});
  await page.setContent(`<base href="https://codestep.test/"><html data-theme="${theme}" data-palette="plum"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`);await page.addScriptTag({content:bundle.outputFiles[0].text});await page.locator('dialog[open]').waitFor();
  const nav=await page.locator('.comparison-topbar').boundingBox();
  const choices=page.locator('.language-choice');
  for(const choice of await choices.all()){
   const box=await choice.boundingBox(),label=await choice.locator('.comparison-language-name').boundingBox();
   assert.ok(Math.abs(box.y+box.height/2-nav.y-nav.height/2)<1,'Language buttons sit at the vertical centre of their toolbar');
   assert.ok(label.x>=box.x-1&&label.x+label.width<=box.x+box.width+1,'Every full language label fits its touch target');
   assert.equal(await choice.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','Selection does not use a large filled square');
   assert.ok(box.x>=nav.x&&box.x+box.width<=nav.x+nav.width+1);
  }
  const background=await page.evaluate(()=>{const e=document.createElement('i');e.style.background='var(--app-surface)';document.body.appendChild(e);const c=getComputedStyle(e).backgroundColor;e.remove();return c;});
  for(const header of await page.locator('.comparison-filebar').all()){
   assert.equal(await header.evaluate(e=>getComputedStyle(e).backgroundColor),background,'No retained green file header');
   assert.equal(await header.locator('.comparison-file-tab').evaluate(e=>getComputedStyle(e).backgroundColor),background);
  }
  await page.screenshot({path:`/tmp/comparison-centred-${width}-${theme}.png`});
  console.log(`PASS ${width} ${theme}: centred controls, complete labels, quiet selection and matching file headers`);await page.close();
 }
}finally{await browser.close();}
