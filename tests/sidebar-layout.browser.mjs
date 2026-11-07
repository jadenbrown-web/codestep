import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium') ? {executablePath:'/usr/bin/chromium'} : {})});
try {
  const page = await browser.newPage({viewport:{width:1400,height:800}});
  const css = fs.readFileSync('app/globals.css','utf8');
  for(const theme of ['light','dark']) {
    await page.setContent(`<html data-theme="${theme}"><style>${css}</style><body><main class="lesson-shell"><div class="lesson-layout drawer-open" style="height:600px;flex:none"><aside class="lesson-drawer"><div class="drawer-head"><div class="desktop-home-controls"><div class="lesson-brand-group"><button class="home-button" aria-label="Go home">⌂</button></div></div><div class="drawer-title-group"><div class="drawer-language-identity"><span class="drawer-language-logo"><img width="32" height="32" alt=""/></span><b>C++</b></div></div></div><nav class="drawer-lessons"><div style="height:2000px">Lessons</div></nav></aside><aside class="lesson-copy"><div class="lesson-study-content"><div style="height:2000px">Explanations</div></div></aside></div></main></body></html>`);
    const logo = await page.locator('.drawer-language-logo').boundingBox();
    const name = await page.locator('.drawer-language-identity>b').boundingBox();
    assert.ok(name.x > logo.x+logo.width);
    const home = await page.locator('.home-button').boundingBox();
    assert.ok(Math.abs((home.y+home.height/2)-(logo.y+logo.height/2))<1,'Home and language logo must share a centre line');
    assert.ok(Math.abs((name.y+name.height/2)-(logo.y+logo.height/2))<1,'language and logo must share a centre line');
    const styles = await page.locator('.drawer-lessons,.lesson-study-content').evaluateAll(elements=>elements.map(element=>{const style=getComputedStyle(element);const thumb=getComputedStyle(element,'::-webkit-scrollbar-thumb');return {width:style.scrollbarWidth,colour:style.scrollbarColor,gutter:style.scrollbarGutter,thumb:thumb.backgroundColor};}));
    assert.deepEqual(styles[0],styles[1],`${theme}: scrollbar styles must match`);
    console.log(`PASS ${theme}: language sits beside logo and both pane scrollbars match`);
  }
  const source = fs.readFileSync('app/page.tsx','utf8');
  const desktopControls = source.match(/const desktopHomeControls = ([^\n]+)/)[1];
  assert.ok(desktopControls.includes('<HomeButton'));
  assert.ok(!desktopControls.includes('drawer-toggle'),'desktop controls should not contain a hamburger');
  console.log('PASS desktop controls retain Home without a hamburger button');
} finally {await browser.close();}
