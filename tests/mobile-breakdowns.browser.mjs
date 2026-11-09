import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const { chromium } = createRequire(import.meta.url)('playwright');
async function loadTs(path) {
  const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
  return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}
const breakdown=await loadTs('app/lesson-breakdown.ts');
const {explanationTokens}=await loadTs('app/explanation-tokens.ts');
const source=fs.readFileSync('app/page.tsx','utf8');
const ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const functions=ast.statements.filter(node=>ts.isFunctionDeclaration(node)&&['HighlightedCode','CodeProse','LessonBreakdown'].includes(node.name?.text)).map(node=>node.getText(ast)).join('\n');
const compiled=ts.transpileModule(functions,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
const Component=new Function('React','syntaxBreakdown','importBreakdown','setupBreakdown','explanationTokens',compiled+'\nreturn LessonBreakdown;')(React,breakdown.syntaxBreakdown,breakdown.importBreakdown,breakdown.setupBreakdown,explanationTokens);
const start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const css=fs.readFileSync('app/globals.css','utf8');
  for(const width of [390,1440]) for(const theme of ['light','dark']) for(const [language,course] of Object.entries(lessons)) {
    const lesson=language==='javascript'?course.find(item=>item.compareNode):course.reduce((longest,item)=>item.answer.length>longest.answer.length?item:longest,course[0]);
    await page.setViewportSize({width,height:844});
    const markup=renderToStaticMarkup(React.createElement(Component,{lesson,language}));
    await page.setContent(`<html data-theme="${theme}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body><main class="lesson-shell mobile-lesson"><div class="lesson-layout drawer-closed"><aside class="lesson-copy"><div class="lesson-study-content">${markup}</div></aside></div></main></body></html>`);
    assert.ok(await page.locator('.code-breakdown').count()>0);
    assert.equal(await page.locator('.runtime-guide,.variable-examples').count(),0);
    const columns=await page.locator('.breakdown-grid').first().evaluate(element=>getComputedStyle(element).gridTemplateColumns);
    if(width===390) assert.equal(columns.split(' ').length,1,`${theme} ${language}: one-column mobile cards`);
    const overflow=await page.locator('.breakdown-part').evaluateAll(elements=>elements.filter(element=>element.scrollWidth>element.clientWidth+1).length);
    assert.equal(overflow,0,`${theme} ${language}: no overflowing cards`);
    if(['javascript','python','csharp','cpp'].includes(language)) assert.ok(await page.locator('.prose-code').count()>0,`${theme} ${language}: code in explanations is highlighted`);
    const backgrounds=await page.locator('.prose-code').evaluateAll(elements=>elements.map(element=>getComputedStyle(element).backgroundColor));
    assert.ok(backgrounds.every(value=>value==='rgba(0, 0, 0, 0)'),`${theme} ${language}: text-only code highlights`);
    if(await page.locator('.import-breakdown').count()) {
      const tools=page.locator('.import-breakdown');
      assert.equal(await tools.locator('.breakdown-label').innerText(),'Imports');
      assert.ok((await tools.innerText()).includes('The program steps are explained above.'));
      const toolsColour=await tools.locator('.breakdown-label').evaluate(el=>getComputedStyle(el).color);
      const programColour=await page.locator('[aria-label="Code breakdown"]>.breakdown-label').evaluate(el=>getComputedStyle(el).color);
      assert.notEqual(toolsColour,programColour,'Imports and program headings must be visually distinct');
      const edges=await tools.evaluate(el=>{const s=getComputedStyle(el);return [s.borderLeftWidth,s.borderRightWidth,s.paddingLeft];});
      assert.deepEqual(edges,['1px','1px','8px'],'Supporting sections use even borders and compact padding');
    }
    if(language==='javascript') {
      const text=await page.locator('.lesson-copy').innerText();
      for(const label of ['Read keyboard input','Write terminal output','Ask and wait for a reply','Finish taking input','Connect to the terminal']) assert.ok(text.includes(label),label);
      assert.equal(await page.locator('[aria-label="Import breakdown"]').count(),1);
    }
    console.log(`PASS ${width} ${theme} ${language}: shared cards, readable single-column layout, no overflow or boxed prose`);
  }
} finally {await browser.close();}
