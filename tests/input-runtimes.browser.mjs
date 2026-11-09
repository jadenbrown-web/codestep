import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'iife',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('https://codestep.test/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html data-theme="dark"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   const file='public'+path;
   if(fs.existsSync(file))return route.fulfill({body:fs.readFileSync(file),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'});
   return route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedCode=text;}}}));
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('.course-card.js-card').click();
  if(width<=850) await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
  await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:'Ask for a name in VS Code'}).click();
  if(width<=850) await page.getByRole('button',{name:'Lesson',exact:true}).click();
  await page.locator('.input-runtime-examples').waitFor();
  assert.equal(await page.locator('.input-runtime-editor').count(),2);
  await page.getByRole('button',{name:'Copy Node.js run command code',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.copiedCode),'node name.mjs');
  await page.getByRole('button',{name:'Copy Node.js · terminal input code',exact:true}).click();
  assert.match(await page.evaluate(()=>window.copiedCode),/const input = createInterface/);
  if(width<=850) await page.getByRole('button',{name:'Practice',exact:true}).click();
  if(width<=850) await page.getByRole('button',{name:'Use keyboard',exact:true}).click();
  await page.getByRole('textbox',{name:'Code editor',exact:true}).fill('old attempt');
  if(width<=850) await page.getByRole('button',{name:'Lesson',exact:true}).click();
  await page.getByRole('button',{name:'Browser prompt()',exact:true}).click();
  if(width<=850) await page.getByRole('button',{name:'Practice',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('textarea[aria-label="Code editor"]').value==='');
  assert.match(await page.locator('.editor-panel .file-tab').innerText(),/name.js/);
  await page.getByRole('textbox',{name:'Code editor',exact:true}).fill('let name = prompt("What is your name?");\nconsole.log(`Hello ${name}`);');
  await page.getByRole('button',{name:'Check code',exact:true}).click();
  await page.getByRole('button',{name:/Next lesson/}).waitFor();
  if(width<=850) await page.getByRole('button',{name:'Lesson',exact:true}).click();
  await page.getByRole('button',{name:'Copy browser HTML launcher code',exact:true}).click();
  assert.match(await page.evaluate(()=>window.copiedCode),/<script src="name.js"><\/script>/);
  assert.equal(await page.locator('.input-runtime-editor').evaluateAll(elements=>elements.some(el=>el.scrollWidth>el.clientWidth+1)),false,'Both code cards fit');
  await page.close();
  console.log(`PASS ${width}: stacked examples, exact copies, runtime switching clears attempt and browser practice validates`);
 }
}finally{await browser.close();}
