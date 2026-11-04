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
const selected = ast.statements.filter(node => (ts.isFunctionDeclaration(node) && ['PinnedTopicShortcuts', 'TopicPinButton'].includes(node.name?.text)) || (ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(ast) === 'lessonTone'))).map(node => node.getText(ast)).join('\n');
const compiled = ts.transpileModule(selected, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
const lessonTopic = lesson => lesson.eyebrow.split('·').slice(1).join('·').trim();
const { PinnedTopicShortcuts, TopicPinButton } = new Function('React', 'lessons', 'lessonTopic', compiled + '\nreturn { PinnedTopicShortcuts, TopicPinButton };')(React, lessons, lessonTopic);
const props = { topics: ['Make something happen', 'Run code after a delay'], activeTopic: 'Make something happen', language: 'python', onSelect() {} };

test('switching between two shortcuts leaves exactly one pin selected', () => {
  for (const activeTopic of props.topics) {
    const html = renderToStaticMarkup(React.createElement(PinnedTopicShortcuts, { ...props, activeTopic }));
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);
    assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 1);
  }
});
test('one shortcut click calls only that topic selection', () => {
  const selected = [];
  const tree = PinnedTopicShortcuts({ ...props, onSelect: topic => selected.push(topic) });
  tree.props.children[1].props.onClick();
  assert.deepEqual(selected, ['Run code after a delay']);
});
test('saved pins are distinguished from the currently selected shortcut', () => {
  const html = props.topics.map(topic => renderToStaticMarkup(React.createElement(TopicPinButton, { topic, pins: props.topics, onToggle() {} }))).join('');
  assert.equal((html.match(/data-pinned="true"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /data-active="true"|aria-pressed="true"/);
});


test('pinning one Time lesson does not pin another Time lesson', () => {
  const titles = ['Run code after a delay', 'Repeat code every second'];
  const html = titles.map(topic => renderToStaticMarkup(React.createElement(TopicPinButton, { topic, pins: [titles[1]], onToggle() {} }))).join('');
  assert.equal((html.match(/data-pinned="true"/g) ?? []).length, 1);
  assert.equal((html.match(/data-pinned="false"/g) ?? []).length, 1);
});

test('desktop pin controls allow a fifth shortcut and disable a sixth', () => {
  const four = ['A', 'B', 'C', 'D'];
  const fifth = TopicPinButton({ topic: 'E', pins: four, limit: 5, onToggle() {} });
  assert.equal(fifth.props.disabled, false);
  const sixth = TopicPinButton({ topic: 'F', pins: [...four, 'E'], limit: 5, onToggle() {} });
  assert.equal(sixth.props.disabled, true);
});
