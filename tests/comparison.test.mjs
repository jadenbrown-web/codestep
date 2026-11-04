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

function setup(language = 'python') {
  const states = [];
  let cursor = 0;
  const Picker = () => null;
  const Code = ({ code }) => React.createElement(React.Fragment, null, code);
  const names = ['React', 'useState', 'useRef', 'useEffect', 'lessons', 'lessonComment', 'lessonExample', 'languageName', 'lessonTone', 'challengeFile', 'MenuHeader', 'ComparisonExamplePicker', 'CopyCodeButton', 'HighlightedCode', 'LessonExplanation', 'CppSetupGuide'];
  const values = [React, initial => { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], next => { states[index] = next; }]; }, () => ({ current: null }), () => {}, lessons, () => '', lesson => lesson.answer, value => value, () => 'blue', () => 'code', () => null, Picker, () => null, Code, ({ lesson }) => lesson.explanation, () => null];
  const Component = new Function(...names, compiled + '\nreturn LanguageComparison;')(...values);
  const props = { language, lesson: lessons[language][0], editorCode: 'original editor code', showComments: false, onClose() {} };
  function render() { cursor = 0; return Component(props); }
  function find(element, predicate) {
    if (!React.isValidElement(element)) return undefined;
    if (predicate(element)) return element;
    for (const child of React.Children.toArray(element.props.children)) { const found = find(child, predicate); if (found) return found; }
  }
  return {
    select(title) { find(render(), node => node.type === Picker).props.onSelect(title); },
    switchTo(target) { find(render(), node => node.type === 'button' && node.props.className?.includes(`language-${target}`)).props.onClick(); },
    code() { const tree = render(); const sections = []; function visit(node) { if (!React.isValidElement(node)) return; if (node.type === 'section') sections.push(node); React.Children.forEach(node.props.children, visit); } visit(tree); return sections.map(section => find(section, node => node.type === Code).props.code); },
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
