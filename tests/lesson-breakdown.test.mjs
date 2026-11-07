import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const compiled = ts.transpileModule(fs.readFileSync('app/lesson-breakdown.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { importBreakdown, syntaxBreakdown, setupBreakdown, lessonOverview } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const source = fs.readFileSync('app/page.tsx', 'utf8');
const start = source.indexOf('{', source.indexOf('const lessons:'));
const lessons = JSON.parse(source.slice(start, source.indexOf('\n};', start) + 2));
test('every import in the lessons has its own specific explanation', () => {
  for (const [language, course] of Object.entries(lessons)) for (const lesson of course) {
    const imports = lesson.answer.split('\n').map(line => line.trim()).filter(line => /^(#include |import |from |using )/.test(line));
    const cards = importBreakdown(lesson, language);
    for (const code of imports) assert.ok(cards.some(card => card.code === code), `${language}: ${code}`);
    assert.equal(new Set(cards.map(card => card.code)).size, cards.length);
    assert.ok(cards.every(card => card.meaning.length > 40));
    assert.ok(syntaxBreakdown(lesson, language).every(card => !/^(#include |import |from |using )/.test(card.code)));
  }
});
test('C++ console symbols each have one explanation, separate from setup', () => {
  const lesson = lessons.cpp[0];
  const syntax = syntaxBreakdown(lesson, 'cpp');
  for (const code of ['<<', '::']) assert.equal(syntax.filter(part => part.code === code).length, 1);
  assert.ok(setupBreakdown(lesson, 'cpp').every(part => !/cout|<<|::/.test(part.code)));
});
test('imports explain the actual tool being used', () => {
  const delay = lessons.python.find(lesson => lesson.title === 'Run code after a delay');
  assert.match(importBreakdown(delay, 'python')[0].meaning, /time\.sleep\(2\)/);
  const paths = lessons.csharp.find(lesson => lesson.title === 'Get a filename from a path');
  assert.match(importBreakdown(paths, 'csharp').find(part => part.code === 'using System.IO;').meaning, /Path, File, and Directory/);
});
test('Python formatted text explains a replaceable value rather than a special name', () => {
  const lesson = lessons.python.find(lesson => lesson.title === 'Ask for a name in VS Code');
  const cards = syntaxBreakdown(lesson, 'python');
  const formatted = cards.filter(part => /^f"/.test(part.code));
  assert.equal(formatted.length, 1);
  assert.equal(formatted[0].code, 'f"Hello {value}"');
  assert.match(formatted[0].meaning, /choose the variable name/);
  assert.ok(!cards.some(card => card.code === 'name'));
});
test('C# implicit imports are identified as automatic rather than required code to type', () => {
  const card = importBreakdown(lessons.csharp[0], 'csharp').find(part => part.code === 'using System;');
  assert.match(card.meaning, /automatically/);
});
test('chosen function names are examples, not language keywords', () => {
  const syntax = syntaxBreakdown(lessons.python[1], 'python');
  assert.ok(syntax.every(part => !/correct/.test(part.code)));
  assert.ok(syntax.some(part => part.code === 'def functionName():'));
});
test('lesson introductions state a goal without repeating symbol definitions', () => {
  assert.doesNotMatch(lessonOverview(lessons.cpp[0]), /<<|::|#include/);
});
