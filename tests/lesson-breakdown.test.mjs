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

test('let is explained in every JavaScript lesson that uses it, including the input loop', () => {
  const loops = lessons.javascript.find(lesson => lesson.title === 'Repeat input until the answer is correct');
  const letCard = syntaxBreakdown(loops, 'javascript').find(part => part.code === 'let');
  assert.ok(letCard);
  assert.match(letCard.meaning, /stores a value/);
  assert.match(letCard.meaning, /different value/);
  for (const lesson of lessons.javascript) if (/\blet\s+\w+/.test(lesson.answer)) {
    assert.ok(syntaxBreakdown(lesson, 'javascript').some(part => /^let\b/.test(part.code)), lesson.title);
  }
});
test('const is explained without promising that object contents cannot change', () => {
  const lesson = { title: 'Save a value', eyebrow: '01 · Variables', answer: 'const values = [];' };
  const card = syntaxBreakdown(lesson, 'javascript').find(part => part.code === 'const');
  assert.match(card.meaning, /cannot be replaced/);
  assert.match(card.meaning, /contents can still change/);
});
test('keywords inside comments and text do not create unrelated cards', () => {
  const lesson = { title: 'Print', eyebrow: '01 · Console output', answer: '// let const function\nconsole.log("let const function");' };
  assert.ok(!syntaxBreakdown(lesson, 'javascript').some(part => ['let', 'const', 'function'].includes(part.code)));
});
test('existing keyword explanations are not duplicated', () => {
  for(const language of ['javascript','python','csharp','cpp']) for(const lesson of lessons[language]) {
    const parts = syntaxBreakdown(lesson, language);
    assert.equal(parts.length, new Set(parts.map(part=>part.code)).size, `${language}: ${lesson.title}`);
  }
});

test('every lesson in all six languages has a nonempty shared code breakdown', () => {
  for(const [language,course] of Object.entries(lessons)) for(const lesson of course) {
    assert.ok(syntaxBreakdown(lesson,language).length>0, `${language}: ${lesson.title}`);
  }
});
test('language basics are present in C#, C++, Python, and JavaScript inside HTML', () => {
  const cases = [
    ['csharp','class Example { public static void Main() { var value = 1; } }',['class','public','static','void','var','=']],
    ['cpp','int main() { auto value = 1; const int limit = 2; }',['int','auto','const','=']],
    ['python','def check(value):\n    if value is None or not value:\n        return False',['def','if','is','None','or','not','return','False']],
    ['html','<script>let value = 1; if (value) { value = 2; }</script>',['let','if','=']],
  ];
  for(const [language,answer,expected] of cases) {
    const parts = syntaxBreakdown({title:'Example',eyebrow:'01 · Basics',answer},language);
    for(const code of expected) assert.ok(parts.some(part=>part.code===code), `${language}: ${code}`);
  }
});
test('HTML tags and attributes and CSS properties get individual explanations', () => {
  const html = syntaxBreakdown({title:'Image',eyebrow:'01 · Media',answer:'<img src="photo.png" alt="A landscape">'},'html');
  for(const code of ['<img>','src','alt']) assert.ok(html.some(part=>part.code===code));
  const css = syntaxBreakdown({title:'Style',eyebrow:'01 · CSS',answer:'p { color: red; font-family: Arial, sans-serif; }'},'css');
  for(const code of ['color','font-family',':',';','{ … }']) assert.ok(css.some(part=>part.code===code));
});
test('HTML page text does not get mistaken for embedded JavaScript keywords', () => {
  const parts = syntaxBreakdown({title:'Words',eyebrow:'01 · HTML',answer:'<p>let const function</p>'},'html');
  assert.ok(!parts.some(part=>['let','const','function'].includes(part.code)));
});
test('JavaScript variable examples use the shared breakdown rather than duplicate panels', () => {
  assert.doesNotMatch(source,/className="variable-examples"/);
  const lesson = lessons.javascript.find(lesson=>lesson.title==='Choose let or const');
  const parts = syntaxBreakdown(lesson,'javascript');
  for(const keyword of ['let','const']) assert.equal(parts.filter(part=>part.code===keyword).length,1);
});

test('terminal-input explanations stay in shared cards without a legacy duplicate panel', () => {
  assert.doesNotMatch(source,/className="runtime-guide"/);
  const lesson = lessons.javascript.find(lesson=>lesson.compareNode);
  const parts = syntaxBreakdown(lesson,'javascript');
  for(const code of ['let','process.stdin','process.stdout','await reader.question("…")','reader.close()']) assert.ok(parts.some(part=>part.code===code),code);
  assert.ok(parts.some(part=>part.code.startsWith('createInterface(')));
  assert.equal(importBreakdown(lesson,'javascript').filter(part=>part.code.includes('createInterface')).length,1);
});
