import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const source = fs.readFileSync('app/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const start = source.indexOf('{', source.indexOf('const lessons:'));
const lessons = JSON.parse(source.slice(start, source.indexOf('\n};', start) + 2));
const functions = ast.statements.filter(node => ts.isFunctionDeclaration(node) && ['matchingLesson', 'LanguageComparison'].includes(node.name?.text)).map(node => node.getText(ast)).join('\n');
const compiled = ts.transpileModule(functions, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
const pinModule = ts.transpileModule(fs.readFileSync("app/topic-pins.ts", "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { firstTopicLessonIndex, lessonTopic } = await import("data:text/javascript;base64," + Buffer.from(pinModule).toString("base64"));

function setup(language = 'python', reveal = code => code) {
  const states = [];
  let cursor = 0;
  const Picker = () => null;
  const Copy = () => null;
  const Pins = () => null;
  const Code = ({ code }) => React.createElement(React.Fragment, null, code);
  const names = ['React', 'useState', 'useRef', 'useEffect', 'lessons', 'lessonComment', 'lessonExample', 'languageName', 'lessonTone', 'challengeFile', 'MenuHeader', 'ComparisonExamplePicker', 'CopyCodeButton', 'HighlightedCode', 'LessonExplanation', 'CppSetupGuide', 'BackButton', 'CodeLineNumbers', 'useQuickCodeReveal', 'PinnedTopicShortcuts', 'firstTopicLessonIndex', 'lessonTopic'];
  const values = [React, initial => { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], next => { states[index] = next; }]; }, () => ({ current: null }), () => {}, lessons, () => '', lesson => lesson.answer, value => value, () => 'blue', () => 'code', () => null, Picker, Copy, Code, ({ lesson }) => lesson.explanation, () => null, () => null, () => null, (code, key, enabled = true) => enabled ? reveal(code, key) : "", Pins, firstTopicLessonIndex, lessonTopic];
  const Component = new Function(...names, compiled + '\nreturn LanguageComparison;')(...values);
  const props = { language, lesson: lessons[language][0], editorCode: 'original editor code', showComments: false, pinnedTopics: ['Functions', 'Time'], onClose() {} };
  function render() { cursor = 0; return Component(props); }
  function find(element, predicate) {
    if (!React.isValidElement(element)) return undefined;
    if (predicate(element)) return element;
    for (const child of React.Children.toArray(element.props.children)) { const found = find(child, predicate); if (found) return found; }
  }
  return {
    selectPin(topic) { find(render(), node => node.type === Pins).props.onSelect(topic); },
    pinSelectorCount() { let count = 0; function visit(node) { if (!React.isValidElement(node)) return; if (node.type === Pins) count += 1; React.Children.forEach(node.props.children, visit); } visit(render()); return count; },
    activePin() { return find(render(), node => node.type === Pins).props.activeTopic; },
    select(title) { find(render(), node => node.type === Picker).props.onSelect(title); },
    switchTo(target) { find(render(), node => node.type === 'button' && node.props.className?.includes(`language-${target}`)).props.onClick(); },
    code() { const tree = render(); const sections = []; function visit(node) { if (!React.isValidElement(node)) return; if (node.type === 'section') sections.push(node); React.Children.forEach(node.props.children, visit); } visit(tree); return sections.map(section => find(section, node => node.type === Code).props.code); },
    toggleNotes() { find(render(), node => node.type === "button" && node.props["aria-label"] === "Lesson explanations").props.onClick(); },
    reservedCode() { const result = []; function visit(node) { if (!React.isValidElement(node)) return; if (node.type === "code" && node.props.className === "comparison-code-space") result.push(node.props.children); React.Children.forEach(node.props.children, visit); } visit(render()); return result; },
    copies() { const result = []; function visit(node) { if (!React.isValidElement(node)) return; if (node.type === Copy) result.push(node.props.code); React.Children.forEach(node.props.children, visit); } visit(render()); return result; },
    html() { return renderToStaticMarkup(render()); },
  };
}

test('choosing a function replaces both examples and stops using unrelated editor code', () => {
  const comparison = setup();
  comparison.select('Make something happen');
  assert.deepEqual(comparison.code(), ['python', 'javascript'].map(language => lessons[language].find(lesson => lesson.title === 'Make something happen').answer));
  assert.doesNotMatch(comparison.html(), /original editor code/);
});

test('switching comparison language preserves the selected function topic', () => {
  const comparison = setup();
  comparison.select('Make something happen');
  comparison.switchTo('cpp');
  assert.deepEqual(comparison.code(), ['python', 'cpp'].map(language => lessons[language].find(lesson => lesson.title === 'Make something happen').answer));
});

test('opening comparison preserves current editor code until a topic is chosen', () => {
  const comparison = setup();
  assert.equal(comparison.code()[0], 'original editor code');
});

test('delay comparison preserves original JavaScript and C++ source lines', () => {
  const comparison = setup('javascript');
  comparison.select('Run code after a delay');
  const expected = ['javascript', 'cpp'].map(language => lessons[language].find(lesson => lesson.title === 'Run code after a delay').answer);
  assert.deepEqual(comparison.code(), expected);
  assert.match(comparison.code()[1], /std::this_thread::sleep_for\(std::chrono::seconds\(2\)\);/);
  assert.match(comparison.html(), /<aside[^>]*id="comparison-notes-panel"[^>]*hidden=""[^>]*aria-label="Explanations and setup"/);
});


test('toolbar notes toggle opens and closes the explanations panel', () => {
  const comparison = setup();
  assert.match(comparison.html(), /<aside[^>]*id="comparison-notes-panel"[^>]*hidden=""/);
  comparison.toggleNotes();
  assert.doesNotMatch(comparison.html(), /<aside[^>]*id="comparison-notes-panel"[^>]*hidden=""/);
  comparison.toggleNotes();
  assert.match(comparison.html(), /<aside[^>]*id="comparison-notes-panel"[^>]*hidden=""/);
});

test('only the selected comparison language has a visible name in the toolbar', () => {
  const comparison = setup();
  assert.equal((comparison.html().match(/class="comparison-language-name"/g) ?? []).length, 1);
  assert.match(comparison.html(), /class="comparison-language-name">javascript<\/span>/);
  comparison.switchTo('cpp');
  assert.equal((comparison.html().match(/class="comparison-language-name"/g) ?? []).length, 1);
  assert.match(comparison.html(), /class="comparison-language-name">cpp<\/span>/);
});


test('copy keeps the full source while comparison typing is still in progress', () => {
  const comparison = setup('python', code => code.slice(0, 3));
  comparison.select('Make something happen');
  assert.deepEqual(comparison.code(), ['python', 'javascript'].map(language => lessons[language].find(lesson => lesson.title === 'Make something happen').answer).map((code, index) => index === 0 ? code.slice(0, 3) : ''));
  assert.deepEqual(comparison.copies(), ['python', 'javascript'].map(language => lessons[language].find(lesson => lesson.title === 'Make something happen').answer));
});


test('complete code reserves panel geometry while only a few characters are visible', () => {
  const comparison = setup('python', code => code.slice(0, 2));
  comparison.select('Run code after a delay');
  const complete = ['python', 'javascript'].map(language => lessons[language].find(lesson => lesson.title === 'Run code after a delay').answer);
  assert.deepEqual(comparison.reservedCode(), complete);
  assert.deepEqual(comparison.code(), [complete[0].slice(0, 2), ""]);
});


test('comparison pins switch both examples directly between complete topics', () => {
  const comparison = setup();
  for (const topic of ['Functions', 'Time']) {
    comparison.selectPin(topic);
    const chosen = lessons.python[firstTopicLessonIndex(lessons.python, topic)];
    assert.equal(comparison.activePin(), topic);
    assert.deepEqual(comparison.code(), [chosen.answer, lessons.javascript.find(lesson => lesson.title === chosen.title).answer]);
  }
});


test('comparison reveals the second file only after the first file completes', () => {
  let finished = false;
  const comparison = setup('python', code => finished ? code : code.slice(0, 2));
  comparison.selectPin('Functions');
  assert.equal(comparison.code()[1], '');
  finished = true;
  const code = comparison.code();
  assert.deepEqual(code, comparison.reservedCode());
  assert.ok(code[1].length > 2);
});


test('comparison has one shared pinned-topic selector', () => {
  const comparison = setup();
  assert.equal(comparison.pinSelectorCount(), 1);
  comparison.selectPin('Functions');
  assert.equal(comparison.activePin(), 'Functions');
  comparison.selectPin('Time');
  assert.equal(comparison.activePin(), 'Time');
  assert.equal(comparison.pinSelectorCount(), 1);
});
