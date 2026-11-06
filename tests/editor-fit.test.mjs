import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const compiled = ts.transpileModule(fs.readFileSync('app/editor-fit.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { fitEditorCode } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
test('short examples keep the normal font size', () => {
  assert.equal(fitEditorCode('print("Hello")', 800, 500).fontSize, 13);
});
test('long examples fit vertically by reducing the font', () => {
  const text = Array(45).fill('  std::cout << "Hello";').join('\n');
  const fit = fitEditorCode(text, 800, 660);
  assert.ok(fit.fontSize >= 9 && fit.fontSize < 13);
  assert.ok(45 * fit.lineHeight + 12 <= 660);
});
test('wrapped comments contribute to the required height', () => {
  const text = Array(18).fill('// ' + 'long comment '.repeat(12)).join('\n');
  const narrow = fitEditorCode(text, 400, 650);
  const wide = fitEditorCode(text, 1000, 650);
  assert.ok(narrow.fontSize < wide.fontSize);
});
test('expanding gives long examples a larger readable font', () => {
  const text = Array(50).fill('  std::cout << "Hello";').join('\n');
  assert.ok(fitEditorCode(text, 1200, 850).fontSize > fitEditorCode(text, 500, 500).fontSize);
});
