import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const compiled=await build({entryPoints:['app/HtmlTextReference.tsx'],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const module={exports:{}};
new Function('require','module','exports',compiled.outputFiles[0].text)(require,module,module.exports);
const {default:Component}=module.exports;
const markup=renderToStaticMarkup(React.createElement(Component,{onNext(){},actions:React.createElement("button",{"aria-label":"Settings"},"⚙")}));
const css=fs.readFileSync('app/globals.css','utf8');
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try {
  const page=await browser.newPage();
  for(const viewport of [{width:1952,height:1000},{width:1440,height:900},{width:1280,height:720},{width:1024,height:600},{width:390,height:844}]) for(const theme of ['light','dark']) {
    await page.setViewportSize(viewport);
    await page.setContent(`<html data-theme="${theme}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body><main class="lesson-shell reference-mode mobile-practice"><header class="app-header lesson-nav"></header><div class="lesson-layout drawer-closed"><aside class="lesson-drawer"></aside><aside class="lesson-copy"></aside><section class="workspace reference-workspace">${markup}</section></div></main></body></html>`);
    assert.equal(await page.locator('[data-html-tag]').count(),18);
    const example=page.getByRole('region',{name:'HTML text examples'}).locator('[aria-label="Text elements code example"]');
    assert.equal(await example.locator('.visual-example-code code').textContent(),'<h1>Main heading</h1>');
    const position=await example.boundingBox();
    assert.ok(position.y>=0&&position.y+position.height<viewport.height,'main example stays visible at the top');
    assert.equal(await page.locator('[data-html-tag] .copy-code-button').count(),18);
    assert.equal(await page.locator('.reference-pane-toolbar').count(),0);
    if(viewport.width>850) {
      assert.equal(await page.locator('.app-header').isVisible(),false,'reference page has no extra desktop navbar');
      assert.equal(await page.getByRole('button',{name:'Settings'}).isVisible(),true,'reference actions stay available');
    }
    const dimensions=await page.locator('.html-tag-grid').evaluate(element=>({width:element.clientWidth,scrollWidth:element.scrollWidth,height:element.clientHeight,scrollHeight:element.scrollHeight}));
    assert.ok(dimensions.scrollWidth<=dimensions.width+1,`${theme} ${viewport.width}: no sideways scrolling`);
    assert.ok(dimensions.scrollHeight<=dimensions.height+1,`${theme} ${viewport.width}x${viewport.height}: all examples fit vertically (${JSON.stringify(dimensions)})`);
    const clipped=await page.locator('.html-tag-example').evaluateAll(elements=>elements.filter(element=>element.scrollHeight>element.clientHeight+1||element.scrollWidth>element.clientWidth+1).map(element=>({tag:element.dataset.htmlTag,width:element.clientWidth,scrollWidth:element.scrollWidth,height:element.clientHeight,scrollHeight:element.scrollHeight})));
    assert.deepEqual(clipped,[],`${theme} ${viewport.width}: examples stay readable without clipping`);
    const last=await page.locator('[data-html-tag="a"]').boundingBox();
    assert.ok(last.y+last.height<=viewport.height,`${theme}: final example stays on screen`);
    if(viewport.width===1440&&theme==='light') await page.locator('.html-text-reference').screenshot({path:'/tmp/codestep-html-tags-preview.png'});
    console.log(`PASS ${theme} ${viewport.width}x${viewport.height}: 18 separate examples fit without clipping or scrolling`);
  }
}finally{await browser.close();}
