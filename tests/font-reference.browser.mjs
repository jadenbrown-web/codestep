import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {inHtmlFile} from './web-file-helpers.mjs';
const compiled=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import FontReference from './app/FontReference';createRoot(document.getElementById('fixture-root')).render(<main className="lesson-shell reference-mode mobile-practice"><header className="app-header lesson-nav"/><div className="lesson-layout drawer-closed"><aside className="lesson-drawer"/><aside className="lesson-copy"/><section className="workspace reference-workspace"><FontReference language={window.fixtureLanguage} onNext={()=>{}} onAlternate={()=>{}} actions={<button aria-label="Settings">⚙</button>}/></section></div></main>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser',define:{'process.env.NODE_ENV':'"production"'}});
const css=fs.readFileSync('app/globals.css','utf8');
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try {
  const page=await browser.newPage();
  for(const viewport of [{width:1952,height:1000},{width:1440,height:900},{width:1280,height:720},{width:1024,height:600},{width:390,height:844}]) for(const theme of ['light','dark']) for(const language of ['html','css']) {
    await page.setViewportSize(viewport);
    await page.goto('about:blank');
    await page.setContent(`<html data-theme="${theme}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body><div id="fixture-root"></div></body></html>`);
    await page.evaluate(language=>window.fixtureLanguage=language,language);await page.addScriptTag({content:compiled.outputFiles[0].text});
    await page.locator('[data-font]').first().waitFor();
    if(language==='css'&&viewport.width<=850)await page.getByRole('button',{name:'View HTML file',exact:true}).waitFor();
    assert.equal(await page.locator('[data-font]').count(),20);
    assert.equal(await page.locator('.reference-pane-toolbar').count(),0,'no detached Fonts header');
    assert.equal(await page.locator('.font-example-heading .desktop-pane-actions').count(),1,'controls are inside the example pane');
    assert.equal(await page.locator('.font-featured-example .example-syntax-code').count(),1);
    if(language==='css'){
      assert.equal(await page.locator('.stylesheet-file-pair .stylesheet-file').count(),viewport.width<=850?1:2);
      assert.deepEqual(await page.locator('.stylesheet-file header>b').allTextContents(),viewport.width<=850?['styles.css']:['styles.css','index.html']);
      await inHtmlFile(page,viewport.width,async file=>{assert.match(await file.locator('.companion-html-code').textContent(),/<link rel="stylesheet" href="styles.css">\n<p>Courier New<\/p>/);if(viewport.width<=850){assert.equal(await file.locator('header h1').textContent(),'index.html');assert.equal(await file.getByRole('button',{name:'Open HTML lesson',exact:true}).count(),1);}else assert.equal(await file.getByRole('button',{name:'See matching HTML →',exact:true}).count(),1);});
    }else assert.equal(await page.getByRole('button',{name:'See matching CSS →',exact:true}).count(),1);
    assert.equal(await page.locator('[data-font] code').count(),0);
    assert.equal(await page.locator('.font-example-label').count(),20);
    const labelFont=await page.locator('[data-font="Lucida Console"] .font-example-label').evaluate(el=>getComputedStyle(el).fontFamily);
    assert.ok(!labelFont.includes('Lucida'),'font name stays in the readable interface font');
    const example=await page.locator('.font-featured-example').boundingBox();
    assert.ok(example.y>=0&&example.y+example.height<viewport.height,'featured code example is easy to find');
    if(viewport.width>850) {
      assert.equal(await page.locator('.app-header').isVisible(),false,'reference page has no extra desktop navbar');
      assert.equal(await page.getByRole('button',{name:'Settings'}).isVisible(),true,'reference actions stay available');
    }
    const dimensions=await page.locator('.html-tag-grid').evaluate(element=>({width:element.clientWidth,scrollWidth:element.scrollWidth,height:element.clientHeight,scrollHeight:element.scrollHeight}));
    assert.ok(dimensions.scrollWidth<=dimensions.width+1,`${theme} ${viewport.width}: no sideways scrolling`);
    if(viewport.height>=900) assert.ok(dimensions.scrollHeight<=dimensions.height+1,`${theme} ${viewport.width}x${viewport.height}: all examples fit vertically (${JSON.stringify(dimensions)})`);
    const clipped=await page.locator('.html-tag-example').evaluateAll(elements=>elements.filter(element=>element.scrollHeight>element.clientHeight+1||element.scrollWidth>element.clientWidth+1).map(element=>({font:element.dataset.font,width:element.clientWidth,scrollWidth:element.scrollWidth,height:element.clientHeight,scrollHeight:element.scrollHeight})));
    assert.deepEqual(clipped,[],`${theme} ${viewport.width}: examples stay readable without clipping`);
    const last=await page.locator('[data-font="system-ui"]').boundingBox();
    if(viewport.height>=900) assert.ok(last.y+last.height<=viewport.height,`${theme}: final example stays on screen`);
    if(viewport.width===1440&&theme==='light'&&language==='html') await page.locator('.html-text-reference').screenshot({path:'/tmp/codestep-fonts-preview.png'});
    console.log(`PASS ${language} ${theme} ${viewport.width}x${viewport.height}: 20 font examples remain readable without clipping`);
  }
}finally{await browser.close();}
