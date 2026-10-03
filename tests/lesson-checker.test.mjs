import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Parser from 'web-tree-sitter';
import { build } from 'esbuild';

const compiled = await build({ entryPoints: ['app/lesson-checker.ts'], bundle: true, platform: 'browser', format: 'esm', write: false });
const { compareLesson } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
await Parser.init();
const source = fs.readFileSync('app/page.tsx', 'utf8');
const start = source.indexOf('{', source.indexOf('const lessons:'));
const end = source.indexOf('\n};', start);
const courses = JSON.parse(source.slice(start, end + 2));
const parsers = {};
for (const language of Object.keys(courses)) {
  const parser = new Parser();
  parser.setLanguage(await Parser.Language.load(`public/checker/tree-sitter-${language === 'csharp' ? 'c_sharp' : language}.wasm`));
  parsers[language] = parser;
}
function check(language, title, code) {
  const lesson = courses[language].find(lesson => lesson.title === title);
  return compareLesson(parsers[language], code, lesson, language);
}

for (const [language, lessons] of Object.entries(courses)) {
  test(`${language}: every exercise guide passes syntax and equivalence checks`, () => {
    for (const lesson of lessons.filter(item => !item.referenceOnly)) assert.equal(compareLesson(parsers[language], lesson.answer, lesson, language).accepted, true, lesson.title);
  });
}
for (const language of ['javascript', 'python', 'csharp', 'cpp']) {
  test(`${language}: arithmetic lesson accepts consistent renaming, rejects changed result and missing calculation`, () => {
    const lesson = courses[language].find(item => item.title === 'Calculate a value');
    const renamed = lesson.answer.replace(/\bspeed\b/g, 'velocity');
    assert.equal(check(language, lesson.title, renamed).accepted, true);
    assert.equal(check(language, lesson.title, renamed.replace('80 + 20', '80 + 21')).accepted, false);
    assert.equal(check(language, lesson.title, renamed.replace('80 + 20', '100')).accepted, false);
  });
  test(`${language}: removing a required function call cannot pass`, () => {
    const lesson = courses[language].find(item => item.title === 'Make something happen');
    assert.equal(check(language, lesson.title, lesson.answer.replace(/\n[ \t]*correct\(\);?/g, '\n')).accepted, false);
  });
}
test('Python preserves significant indentation and whitespace inside strings', () => {
  const lesson = courses.python.find(item => item.title === 'Make something happen');
  assert.equal(check('python', lesson.title, lesson.answer.replace('    print', 'print')).accepted, false);
  assert.equal(check('python', lesson.title, lesson.answer.replace('"correct"', '"cor rect"')).accepted, false);
  assert.equal(check('python', lesson.title, lesson.answer.replaceAll('"correct"', "'correct'")).accepted, true);
});
test('JavaScript accepts concatenation, optional semicolons and let for an unchanged value', () => {
  const lesson = courses.javascript.find(item => item.title === 'Calculate a value');
  assert.equal(check('javascript', lesson.title, 'const total = 80 + 20\nconsole.log("Speed: " + total)').accepted, true);
});
test('Python accepts concatenation with str instead of an f-string', () => {
  assert.equal(check('python', 'Calculate a value', 'total = 80 + 20\nprint("Speed: " + str(total))').accepted, true);
});
test('C# accepts string concatenation and inferred local types', () => {
  assert.equal(check('csharp', 'Calculate a value', 'int total = 80 + 20;\nConsole.WriteLine("Speed: " + total);').accepted, true);
  assert.equal(check('csharp', 'Choose a text colour', 'const string red = "\\u001b[31m";\nconst string green = "\\u001b[32m";\nconst string reset = "\\u001b[0m";\nConsole.WriteLine(red + "Red text" + reset);\nConsole.WriteLine(green + "Green text" + reset);').accepted, true);
});
test('HTML attribute order and void-tag slash are equivalent; missing alt and changed source fail', () => {
  const lesson = courses.html.find(item => item.title === 'Place an image on the page');
  const tree = parsers.html.parse(lesson.answer);
  const tag = tree.rootNode.descendantsOfType('start_tag')[0];
  const attributes = tag.namedChildren.filter(child => child.type === 'attribute');
  const variant = `<img ${attributes.map(item => item.text).reverse().join(' ')} />`;
  tree.delete();
  assert.equal(check('html', lesson.title, variant).accepted, true);
  assert.equal(check('html', lesson.title, variant.replace(/alt="[^"]*"/, '')).accepted, false);
  assert.equal(check('html', 'Tell the browser it is HTML', '<!DOCTYPE potato>').accepted, false);
});
test('CSS accepts reordered unique declarations and equivalent colours; cascade order is preserved', () => {
  assert.equal(check('css', 'Colour and centre text', 'p { text-align: center; color: #f00; }').accepted, true);
  assert.equal(check('css', 'Colour and centre text', 'p { text-align: left; color: red; }').accepted, false);
  assert.equal(check('css', 'Colour and centre text', 'p { color: blue; color: red; text-align: center; }').accepted, false);
});
test('Independent colour declarations can be reordered; use before assignment does not pass', () => {
  const lesson = courses.javascript.find(item => item.title === 'Choose a text colour');
  const lines = lesson.answer.split('\n');
  assert.equal(check('javascript', lesson.title, [lines[1], lines[0], ...lines.slice(2)].join('\n')).accepted, true);
  assert.equal(check('javascript', lesson.title, [...lines.slice(4), ...lines.slice(0, 3)].join('\n')).accepted, false);
});
for (const language of ['javascript', 'python', 'csharp', 'cpp']) {
  test(`${language}: reversing constant addition keeps the calculation`, () => {
    const lesson = courses[language].find(item => item.title === 'Calculate a value');
    assert.equal(check(language, lesson.title, lesson.answer.replace('80 + 20', '20 + 80')).accepted, true);
  });
}
for (const language of ['javascript', 'csharp', 'cpp']) {
  test(`${language}: colour output can be green first`, () => {
    const lesson = courses[language].find(item => item.title === 'Choose a text colour');
    const lines = lesson.answer.split('\n');
    const indices = lines.map((line, index) => /Red text|Green text/.test(line) ? index : -1).filter(index => index >= 0);
    [lines[indices[0]], lines[indices[1]]] = [lines[indices[1]], lines[indices[0]]];
    assert.equal(check(language, lesson.title, lines.join('\n')).accepted, true);
    assert.equal(check(language, lesson.title, lines.join('\n').replace(/Green text/, 'Incorrect text')).accepted, false);
  });
}
test('JavaScript accepts arrow functions while retaining the required call', () => {
  assert.equal(check('javascript', 'Make something happen', 'const correct = () => { console.log("correct"); };\ncorrect();').accepted, true);
  assert.equal(check('javascript', 'Use one function inside another', 'const getMessage = () => "Hello";\nconsole.log(getMessage());').accepted, true);
});
test('Semantic details cannot disappear during comparison', () => {
  const timeLesson = courses.python.find(item => item.title === 'Check for a particular time');
  assert.equal(check('python', timeLesson.title, timeLesson.answer.replace('17', '18')).accepted, false);
  const rangeLesson = courses.javascript.find(item => item.title === 'Check whether a value is in a range');
  assert.equal(check('javascript', rangeLesson.title, rangeLesson.answer.replaceAll('&&', '||')).accepted, false);
  const csharpLesson = courses.csharp.find(item => item.title === 'Choose a text colour');
  assert.equal(check('csharp', csharpLesson.title, csharpLesson.answer.replaceAll('string', 'int')).accepted, false);
});
test('Formatting conversions and scope capture are preserved', () => {
  const lesson = courses.python.find(item => item.title === 'Calculate a value');
  assert.equal(check('python', lesson.title, lesson.answer.replace('{speed}', '{speed!r}')).accepted, false);
  const custom = { title: 'Scope', prompt: 'Print the outer value', answer: 'let x = 1;\nfunction show() { let y = 1; console.log(x); }\nshow();' };
  assert.equal(compareLesson(parsers.javascript, custom.answer.replace('console.log(x)', 'console.log(y)'), custom, 'javascript').accepted, false);
});
for (const language of ['javascript', 'python', 'csharp', 'cpp']) {
  test(`${language}: loop variables and names can be consistently renamed`, () => {
    const lesson = courses[language].find(item => item.title === 'Let names beginning with J enter');
    const tree = parsers[language].parse(lesson.answer);
    const identifiers = tree.rootNode.descendantsOfType('identifier').filter(node => ['name', 'names'].includes(node.text)).sort((a, b) => b.startIndex - a.startIndex);
    let alternate = lesson.answer;
    for (const node of identifiers) alternate = alternate.slice(0, node.startIndex) + (node.text === 'name' ? 'person' : 'people') + alternate.slice(node.endIndex);
    tree.delete();
    assert.notEqual(alternate, lesson.answer);
    assert.equal(check(language, lesson.title, alternate).accepted, true);
  });
}
