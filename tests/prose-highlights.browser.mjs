import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({ headless: true, ...(fs.existsSync('/usr/bin/chromium') ? { executablePath: '/usr/bin/chromium' } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const css = fs.readFileSync('app/globals.css', 'utf8');
  for (const theme of ['light', 'dark']) {
    await page.setContent(`<html data-theme="${theme}"><head><style>${css}</style></head><body><div class="lesson-copy"><div class="lesson-breakdown-sections"><div class="breakdown-grid">${Array.from({length:4}, () => '<div class="breakdown-part"><code>std::cout</code><div><b>Print text</b><span>Use <code class="explanation-code prose-code prose-code">std::cout</code> with <code class="explanation-code prose-code">&lt;&lt;</code> to send a value.</span></div></div>').join('')}</div></div><details class="symbol-guide" open><summary>Run this on your computer</summary><p>Save as <code class="explanation-code prose-code prose-file">main.cpp</code>.</p></details></div></body></html>`);
    const styles = await page.locator('.prose-code').evaluateAll(elements => elements.map(element => { const css = getComputedStyle(element); return { background: css.backgroundColor, border: css.borderTopWidth, padding: css.paddingLeft, color: css.color }; }));
    for (const style of styles) {
      assert.equal(style.background, 'rgba(0, 0, 0, 0)', `${theme}: inline background`);
      assert.equal(style.border, '0px', `${theme}: inline border`);
      assert.equal(style.padding, '0px', `${theme}: inline padding`);
      assert.equal(style.color, theme === 'dark' ? 'rgb(130, 220, 195)' : 'rgb(21, 98, 117)', `${theme}: text colour`);
    }
    const titleBackgrounds = await page.locator('.breakdown-part>code').evaluateAll(elements => elements.map(element => getComputedStyle(element).backgroundColor));
    assert.ok(titleBackgrounds.every(color => color !== 'rgba(0, 0, 0, 0)'), `${theme}: card titles stay filled`);
    console.log(`PASS ${theme}: all four card colours use text-only inline highlights; card titles remain filled`);
  }
} finally { await browser.close(); }
