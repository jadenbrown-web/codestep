import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = fs.readFileSync('app/topic-pins.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { lessonTopic, toggleTopicPin, restoreTopicPins, filterTopicLessons, firstTopicLessonIndex } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('a third pin never replaces either existing shortcut', () => {
  assert.deepEqual(toggleTopicPin(['Functions', 'Time'], 'Variables'), ['Functions', 'Time']);
});
test('unpinning creates room for a different topic', () => {
  const remaining = toggleTopicPin(['Functions', 'Time'], 'Functions');
  assert.deepEqual(remaining, ['Time']);
  assert.deepEqual(toggleTopicPin(remaining, 'Variables'), ['Time', 'Variables']);
});
test('saved pins are validated, deduplicated and limited per language', () => {
  const saved = JSON.stringify({ python: ['Functions', 'Functions', 'Missing', 'Time', 'Variables'], javascript: ['Variables'] });
  assert.deepEqual(restoreTopicPins(saved, { python: ['Functions', 'Time', 'Variables'], javascript: ['Variables'] }), { python: ['Functions', 'Time'], javascript: ['Variables'] });
});
test('corrupt browser storage does not prevent the app loading', () => {
  for (const saved of ['{', 'null', '[]', '42']) assert.deepEqual(restoreTopicPins(saved, { python: ['Functions'] }), {});
});
test('topic filters preserve original lesson indexes for navigation', () => {
  const lessons = [{ eyebrow: '01 · Console output' }, { eyebrow: '02 · Functions' }, { eyebrow: '03 · Time' }, { eyebrow: '04 · Functions' }];
  assert.equal(lessonTopic(lessons[1]), 'Functions');
  assert.deepEqual(filterTopicLessons(lessons, 'Functions').map(item => item.index), [1, 3]);
  assert.deepEqual(filterTopicLessons(lessons, null).map(item => item.index), [0, 1, 2, 3]);
});


test('a pinned topic resolves directly to its first original lesson index', () => {
  const lessons = [{ eyebrow: '01 · Console output' }, { eyebrow: '02 · Functions' }, { eyebrow: '03 · Time' }, { eyebrow: '04 · Functions' }];
  assert.equal(firstTopicLessonIndex(lessons, 'Functions'), 1);
  assert.equal(firstTopicLessonIndex(lessons, 'Time'), 2);
  assert.equal(firstTopicLessonIndex(lessons, 'Unknown'), -1);
});
