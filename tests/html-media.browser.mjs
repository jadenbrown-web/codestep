import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try{
 for(const width of [1400,390])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   if(process.env.TEST_WEBM_FALLBACK && path.endsWith('my-video.mp4'))return route.fulfill({status:404,body:''});
   const mime={'.png':'image/png','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.js':'text/javascript','.wasm':'application/wasm'};
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:mime[path.slice(path.lastIndexOf('.'))]||'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');},theme);
  await page.addScriptTag({content:bundle.outputFiles[0].text});await page.locator('.course-card.py-card').click();
  for(const lesson of lessons.html.filter(l=>l.mediaPreview)){
   if(width===390)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
   if(width===390)await page.getByRole('button',{name:'Practice',exact:true}).click();
   await page.locator('.html-media-preview').waitFor();
   const editor=page.getByRole('textbox',{name:'Code editor',exact:true});await editor.fill(lesson.answer);
   await page.getByRole('button',{name:'Check code',exact:true}).click();
   await page.getByText('That’s correct!',{exact:true}).waitFor();
   const preview=page.locator('.html-media-preview');
   if(lesson.mediaPreview==='link'){
    const url=page.url();await preview.getByRole('link',{name:'Open page',exact:true}).click();
    await preview.getByRole('heading',{name:'Page',exact:true}).waitFor();
    assert.equal(await preview.locator('.linked-pages-address>span').textContent(),'page.html');
    await preview.getByRole('link',{name:'Go back',exact:true}).click();
    assert.equal(page.url(),url);
   }else if(lesson.mediaPreview==='image'){
    await page.waitForFunction(()=>{const i=document.querySelector('.html-media-preview img');return i?.complete&&i.naturalWidth>0;});
    assert.equal(await preview.locator('img').getAttribute('alt'),'A car');
   }else{
    const media=preview.locator(lesson.mediaPreview);
    await page.waitForFunction(kind=>document.querySelector('.html-media-preview '+kind).readyState>=2,lesson.mediaPreview);
    await media.evaluate(async e=>{await e.play();});
    await page.waitForFunction(kind=>document.querySelector('.html-media-preview '+kind).currentTime>0.05,lesson.mediaPreview);
    assert.ok(await media.evaluate(e=>e.duration>0&&!e.error&&e.controls));await media.evaluate(e=>e.pause());
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${width} ${theme}: image loads, audio/video play, links return locally, and all four quizzes accept code`);await page.close();
 }
}finally{await browser.close();}
