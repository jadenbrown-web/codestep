import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {inHtmlFile,openHtmlFile,closeHtmlFile,openHtmlLesson,phoneFileView} from './web-file-helpers.mjs';

const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './app/page';createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,format:'iife',platform:'browser',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
const colourChannels=value=>(value.match(/[\d.]+/g)??[]).slice(0,3).map(Number);
const luminance=value=>colourChannels(value).map(channel=>{const s=channel/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;}).reduce((sum,channel,index)=>sum+channel*[.2126,.7152,.0722][index],0);
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);};

try{
 await Promise.all([1400,390,320].map(async width=>{
 for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:width>=1400?900:width===320?568:700},hasTouch:width<=850,isMobile:width<=850});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://codestep.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/')return route.fulfill({contentType:'text/html',body:`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${fs.readFileSync('app/globals.css','utf8')}</style><body><div id="root"></div></body></html>`});
   return fs.existsSync('public'+path)?route.fulfill({body:fs.readFileSync('public'+path),contentType:path.endsWith('.wasm')?'application/wasm':path.endsWith('.js')?'text/javascript':'image/svg+xml'}):route.fulfill({status:404,body:''});
  });
  await page.goto('https://codestep.test/');
  await page.evaluate(theme=>{localStorage.setItem('codestep-theme',theme);localStorage.setItem('codestep-code-blocks','false');Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>window.copied=value}});},theme);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('.course-card.css-card').click();
  const choose=async lesson=>{
   if(width<=850)await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:lesson.title}).click();
   if(width<=850)await page.getByRole('button',{name:'Practice',exact:true}).click();
  };
  const byKind=kind=>lessons.css.find(lesson=>lesson.referenceKind===kind);
  const cssCode=()=>page.locator('.stylesheet-primary-code').textContent();
  const copy=async locator=>{await locator.click();return page.evaluate(()=>window.copied);};
  const copyFiles=async()=>({css:await copy(page.locator('.stylesheet-file-pair>.stylesheet-file').first().locator('.copy-code-button')),html:await inHtmlFile(page,width,file=>copy(file.getByRole('button',{name:'Copy matching HTML file code',exact:true}))) });
  const setRange=async(name,value)=>{const slider=page.getByRole('slider',{name,exact:true});await slider.scrollIntoViewIfNeeded();await slider.evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);};
  const loadFiles=async({html,css},selector,expected)=>{
   assert.match(html,/<link rel="stylesheet" href="styles\.css">/);assert.doesNotMatch(html,/style=/,'Matching HTML relies on the copied stylesheet');
   const saved=await browser.newPage({viewport:{width,height:700}});
   await saved.route('https://saved-example.test/**',route=>route.fulfill({contentType:route.request().url().endsWith('.css')?'text/css':'text/html',body:route.request().url().endsWith('.css')?css:html}));
   await saved.goto('https://saved-example.test/index.html');
   const actual=await saved.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return {colour:s.color,background:s.backgroundColor,borderStyle:s.borderTopStyle,borderWidth:s.borderTopWidth,borderColour:s.borderTopColor,font:s.fontFamily,align:s.textAlign};});
   for(const [key,value]of Object.entries(expected))assert.equal(actual[key],value,'Copied files must produce the displayed style');
   await saved.close();
  };
  const flatCopy=async button=>{
   await button.scrollIntoViewIfNeeded();
   for(const hover of [false,true]){
    if(hover)await button.hover();
    const style=await button.evaluate(el=>{const s=getComputedStyle(el);return {border:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth],background:s.backgroundColor,shadow:s.boxShadow};});
    assert.deepEqual(style.border,['0px','0px','0px','0px'],'Copy icons have no box border');assert.equal(style.background,'rgba(0, 0, 0, 0)','Copy icons stay flat, including hover');assert.equal(style.shadow,'none');
   }
   const placement=await button.evaluate(el=>{const h=el.closest('header').getBoundingClientRect(),b=el.getBoundingClientRect(),i=el.querySelector('svg').getBoundingClientRect();return {inside:b.left>=h.left-1&&b.right<=h.right+1&&b.top>=h.top-1&&b.bottom<=h.bottom+1,dx:Math.abs((i.left+i.right-b.left-b.right)/2),dy:Math.abs((i.top+i.bottom-b.top-b.bottom)/2)};});
   assert.equal(placement.inside,true,'File copy controls stay inside their header');assert.ok(placement.dx<=1&&placement.dy<=1,'Copy glyphs remain centred');
  };
  if(width===390&&theme==='light'){
   const id=lessons.css.find(lesson=>lesson.idLesson==='css');await page.getByRole('button',{name:'Open lesson list',exact:true}).click();
   for(const lesson of [id,lessons.css[0]])await page.getByRole('button',{name:`Pin ${lesson.title}`,exact:true}).click();
   await page.locator('.drawer-lessons .topic-lesson-button').filter({hasText:id.title}).click();await page.getByRole('button',{name:'Practice',exact:true}).click();
   assert.equal(await page.locator('.editor-pinned-topics .pinned-topic-chip').count(),2);
  }
  for(const lesson of lessons.css){
   await choose(lesson);
   assert.equal(await page.locator('.lesson-copy .copy-code-button').count(),0,'Breakdown explanations contain no copy controls');
   const left=lesson.referenceOnly?page.locator('.stylesheet-file-pair>.stylesheet-file').first():page.locator('.css-practice-files>.editor-panel');
   const right=page.locator(lesson.referenceOnly?'.stylesheet-file-pair>.stylesheet-companion':'.css-practice-files>.css-editor-companion');
   await left.waitFor();const a=await left.boundingBox();
   if(width>850){await right.waitFor();const b=await right.boundingBox();assert.ok(a.x+a.width<=b.x+1,'Every desktop stylesheet remains left of its matching HTML file');}
   else{assert.equal(await page.locator('.companion-html-code').count(),0,'Phone CSS pane no longer includes stacked HTML');assert.equal(await page.locator('.stylesheet-companion').count(),0);assert.equal(await page.getByRole('button',{name:'View HTML file',exact:true}).count(),1);}
   if(width<=850&&lesson.referenceKind==='padding')await page.screenshot({path:`/tmp/mobile-css-main-${width}-${theme}.png`});
   await inHtmlFile(page,width,async file=>{
    assert.match(await file.locator('.companion-html-code').textContent(),/<link rel="stylesheet" href="styles\.css">/);
    for(const button of await file.locator('.copy-code-button').all())await flatCopy(button);
    if(width<=850){
     assert.equal(await file.locator('header').count(),1,'HTML file view has one header');assert.equal(await file.locator('header h1').textContent(),'index.html');
     const box=await file.boundingBox();assert.ok(box.width>=width-1&&box.height>=(width===320?568:700)-1,'The file gets its own full phone screen');assert.equal(await file.evaluate(el=>el.scrollTop),0,'HTML opens at the beginning of the file');
     if(lesson.referenceKind==='padding')await page.screenshot({path:`/tmp/mobile-html-file-${width}-${theme}.png`});
    }
   });
   if(width<=850)assert.equal(await page.getByRole('button',{name:'View HTML file',exact:true}).evaluate(el=>el===document.activeElement),true,'Closing returns keyboard focus to the launcher');
   if(lesson.referenceOnly){
    assert.equal((await left.locator('header>b').textContent()).trim(),'styles.css');
    for(const button of await left.locator('.copy-code-button').all())await flatCopy(button);
   }else{
    assert.equal((await left.locator('.editor-file-name').textContent()).trim(),'styles.css');
    const editorHeight=(await left.locator('.editor-body').boundingBox()).height;if(editorHeight<80){await page.screenshot({path:`/tmp/linked-files-quiz-${width}-${theme}.png`});console.error(await left.evaluate(el=>({width:innerWidth,panel:el.getBoundingClientRect().height,bar:el.querySelector('.panel-bar').getBoundingClientRect().height,body:el.querySelector('.editor-body').getBoundingClientRect().height,files:el.parentElement.getBoundingClientRect().height,helper:el.parentElement.querySelector('.css-editor-companion').getBoundingClientRect().height})));}assert.ok(editorHeight>=80,`${width} ${theme} ${lesson.title}: the HTML file must not squeeze the CSS editor below 80px (got ${editorHeight})`);
    const live=await page.locator('.live-web-panel').boundingBox(),helper=await right.boundingBox();assert.ok(helper.y+helper.height<=live.y+1,'The matching HTML control never overlaps the live preview');if(width<=850)assert.ok(helper.height<=52,'HTML launcher uses one control row rather than a stacked file');
    const editor=page.getByRole('textbox',{name:'Code editor',exact:true});await editor.fill(lesson.answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();
    const target=page.frameLocator('.live-web-panel iframe').locator(lesson.idLesson?'#p1':'body');await target.waitFor({state:'attached'});
    assert.equal(await target.evaluate((el,isId)=>isId?getComputedStyle(el).color:getComputedStyle(el).backgroundColor,!!lesson.idLesson),lesson.idLesson?'rgb(0, 0, 255)':'rgb(173, 216, 230)','The quiz still renders its matching HTML');
    if(width===1400&&theme==='light'&&!lesson.idLesson){const value=await editor.inputValue(),html=await right.locator('.companion-html-code').textContent();await page.getByRole('button',{name:'Expand editor',exact:true}).click();assert.equal(await editor.inputValue(),value);assert.equal(await right.locator('.companion-html-code').textContent(),html);assert.ok(await right.isVisible(),'Expanding CSS keeps its matching HTML file visible');await page.getByRole('button',{name:'Restore editor',exact:true}).click();assert.equal(await editor.inputValue(),value);assert.ok(await right.isVisible());}
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Linked files never widen the screen');
  }
  await choose(byKind('combined-styles'));
  for(const name of ['Right','Blue','Georgia'])await page.getByRole('button',{name,exact:true}).click();
  const combined=await cssCode();await openHtmlLesson(page,width);
  assert.equal(await page.locator('.lesson-copy h1').textContent(),lessons.html.find(lesson=>lesson.referenceKind==='combined-styles').title);
  assert.match(await page.locator('.layout-primary-code').textContent(),/^<p style="color: blue; font-family: Georgia; text-align: right;">/);
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();assert.equal(await cssCode(),combined,'Returning from HTML preserves all three style choices');
  await loadFiles(await copyFiles(),'p',{colour:'rgb(0, 0, 255)',font:'Georgia',align:'right'});
  await choose(byKind('padding'));await page.getByRole('button',{name:'Each side',exact:true}).click();
  for(const [side,value]of [['Top',8],['Right',32],['Bottom',4],['Left',16]])await setRange(`${side} padding`,value);
  const padded=await cssCode();await openHtmlLesson(page,width);
  assert.match(await page.locator('.padding-primary-code').textContent(),/padding-top: 8px; padding-right: 32px; padding-bottom: 4px; padding-left: 16px;/);
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();assert.equal(await cssCode(),padded,'Padding values survive both navigation directions');
  await choose(byKind('fonts'));await page.getByRole('button',{name:'Show Lucida Console code',exact:true}).click();
  const font=await cssCode();await openHtmlLesson(page,width);
  assert.match(await page.locator('.font-featured-example .example-syntax-code').textContent(),/font-family: 'Lucida Console'/);
  await page.getByRole('button',{name:'See matching CSS →',exact:true}).click();assert.equal(await cssCode(),font,'Selected font survives the HTML/CSS round trip');
  await choose(byKind('css'));await page.getByRole('button',{name:'Show Solid border code',exact:true}).click();
  await inHtmlFile(page,width,async file=>{
   const tokens=await file.locator('.companion-html-code [class^="syntax-"]').evaluateAll(es=>es.filter(el=>el.textContent.trim()).map(el=>{let parent=el,bg='';while(parent){bg=getComputedStyle(parent).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;parent=parent.parentElement;}return {text:el.textContent,foreground:getComputedStyle(el).color,background:bg};}));
   assert.ok(tokens.length>0);for(const token of tokens)assert.ok(contrast(token.foreground,token.background)>=4.5,`Readable border HTML token: ${token.text}`);
   const button=file.getByRole('button',{name:'Copy matching HTML file code',exact:true});await button.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   const focus=await button.evaluate(el=>({visible:el.matches(':focus-visible'),style:getComputedStyle(el).outlineStyle,width:parseFloat(getComputedStyle(el).outlineWidth)}));assert.ok(focus.visible&&focus.style!=='none'&&focus.width>0,'Keyboard focus remains visible on the flat copy icon');
  });
  await loadFiles(await copyFiles(),'p.notice',{borderStyle:'solid',borderWidth:'5px',borderColour:'rgb(255, 0, 0)'});
  await choose(byKind('colours'));await page.getByRole('button',{name:'Use Orange hex colour',exact:true}).click();
  assert.match(await cssCode(),/color: #FFA500;/);assert.match(await page.locator('.lesson-copy').textContent(),/#FFA500/,'The explanation follows the selected hex colour');await loadFiles(await copyFiles(),'p',{colour:'rgb(255, 165, 0)'});
  await openHtmlLesson(page,width);assert.match(await page.locator('.font-featured-example .example-syntax-code').textContent(),/color: orange;/);
  if(width<=850){
   await page.getByRole('button',{name:'See Orange as a hex value in CSS →',exact:true}).click();
   await choose(byKind('padding'));const before=await cssCode();
   await openHtmlFile(page,width);await page.keyboard.press('Escape');await phoneFileView(page).waitFor({state:'detached'});await page.waitForFunction(()=>!window.history.state?.codestepHtmlFile);assert.equal(await cssCode(),before,'Escape returns to the same CSS example');assert.equal(await page.getByRole('button',{name:'View HTML file',exact:true}).evaluate(el=>el===document.activeElement),true);
   await openHtmlFile(page,width);const fileText=await phoneFileView(page).locator('.companion-html-code').textContent();await page.goBack();await phoneFileView(page).waitFor({state:'detached'});assert.equal(await cssCode(),before,'Browser Back returns to the same CSS example');await page.goForward();await phoneFileView(page).waitFor();assert.equal(await phoneFileView(page).locator('.companion-html-code').textContent(),fileText,'Browser Forward reopens the same HTML file');await closeHtmlFile(page,width);assert.equal(await cssCode(),before);
   await openHtmlFile(page,width);assert.equal(await phoneFileView(page).evaluate(el=>el.scrollTop),0,'Reopening starts at the top');await page.setViewportSize({width:1400,height:900});await phoneFileView(page).waitFor({state:'detached'});await page.waitForFunction(()=>!window.history.state?.codestepHtmlFile);assert.equal(await page.locator('.stylesheet-file-pair .stylesheet-file').count(),2,'Resizing restores the unchanged desktop pair');assert.equal(await page.evaluate(()=>document.body.style.overflow),'','Resize releases the page scroll lock');assert.equal(await cssCode(),before);
   await page.setViewportSize({width,height:width===320?568:700});await page.getByRole('button',{name:'View HTML file',exact:true}).waitFor();
   if(width===390&&theme==='light'){const id=lessons.css.find(lesson=>lesson.idLesson==='css');await choose(id);const editor=page.getByRole('textbox',{name:'Code editor',exact:true});await editor.fill(id.answer);await page.getByRole('button',{name:'Check code',exact:true}).click();await page.locator('.feedback.correct').waitFor();const draft=await editor.inputValue();await openHtmlLesson(page,width);assert.equal(await page.locator('.lesson-copy h1').textContent(),lessons.html.find(lesson=>lesson.idLesson==='html').title);await page.getByRole('button',{name:'Style this paragraph in CSS →',exact:true}).click();assert.equal(await editor.inputValue(),draft,'ID lesson navigation retains the CSS draft');await page.locator('.feedback.correct').waitFor();await page.getByRole('button',{name:'Expand editor',exact:true}).click();await openHtmlFile(page,width);await page.keyboard.press('Escape');await phoneFileView(page).waitFor({state:'detached'});await page.waitForFunction(()=>!window.history.state?.codestepHtmlFile);assert.equal(await page.locator('.workspace.editor-expanded').count(),1,'Escape closes the file screen without restoring the editor behind it');await page.getByRole('button',{name:'Restore editor',exact:true}).click();}
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS ${width} ${theme}: every linked CSS file, responsive pair order, flat copy controls, HTML navigation, preserved choices and runnable copied files`);
  await page.close();
 }
 }));
}finally{await browser.close();}
