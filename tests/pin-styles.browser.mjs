import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium') ? {executablePath:'/usr/bin/chromium'} : {})});
try {
  const page = await browser.newPage();
  const css = fs.readFileSync('app/globals.css','utf8');
  for(const theme of ['light','dark']) {
    for(const comparison of [false,true]) {
      const rows = ['rose','gold','blue','green','cyan','violet','orange'].map(tone => `<div class="lesson-list-row">${[true,false].map(pinned=>`<button class="topic-pin-button tone-${tone}" aria-label="Toggle pin" data-pinned="${pinned}" aria-pressed="${pinned}"><svg class="status-icon"><path d="M9 3h6v12H9Z"/></svg></button>`).join('')}</div>`).join('');
      await page.setContent(`<html data-theme="${theme}"><style>${css}</style><body>${comparison?'<div class="app-header lesson-nav comparison-topbar"><div class="comparison-example-menu"><div class="example-picker-list">':'<div class="lesson-drawer"><div class="drawer-lessons">'}${rows}${comparison?'</div></div></div>':'</div></div>'}<div class="desktop-header-pins"><div class="pinned-topic-shortcuts"><button>Functions</button></div></div></body></html>`);
      for(const row of await page.locator('.lesson-list-row').all()) {
        const colours = await row.locator('button').evaluateAll(buttons=>buttons.map(button=>getComputedStyle(button).color));
        assert.notEqual(colours[0],colours[1],`${theme}: pinned icon must be distinct`);
        const fill = await row.locator('button[data-pinned="true"] svg').evaluate(svg=>getComputedStyle(svg).fill);
        assert.notEqual(fill,'none');
        const unfilled = await row.locator('button[data-pinned="false"] svg').evaluate(svg=>getComputedStyle(svg).fill);
        assert.equal(unfilled,'none');
      }
      const panel = await page.locator('.pinned-topic-shortcuts').evaluate(element=>({background:getComputedStyle(element).backgroundColor,border:getComputedStyle(element).borderBottomWidth}));
      assert.equal(panel.background,'rgba(0, 0, 0, 0)');
      assert.equal(panel.border,'0px');
      console.log(`PASS ${theme} ${comparison?'comparison':'learning path'}: seven coloured pin states and transparent shortcut container`);
    }
  }
} finally {await browser.close();}
