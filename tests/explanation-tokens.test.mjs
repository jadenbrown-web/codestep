import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const compiled = ts.transpileModule(fs.readFileSync('app/explanation-tokens.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { explanationTokens } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
test('highlights console output code and operators inside a sentence', () => {
  const text = 'std::cout is the console output. The separate << card explains how to send a value to it.';
  const tokens = explanationTokens(text);
  assert.deepEqual(tokens.filter(token => token.kind === 'code').map(token => token.text), ['std::cout', '<<']);
  assert.equal(tokens.map(token => token.text).join(''), text);
});
test('keeps the entire compile command together and marks the filename and run command', () => {
  const text = 'Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.';
  const tokens = explanationTokens(text);
  assert.deepEqual(tokens.filter(token => token.kind === 'file').map(token => token.text), ['main.cpp']);
  assert.ok(tokens.some(token => token.kind === 'command' && token.text === 'g++ -std=c++17 main.cpp -o main'));
  assert.ok(tokens.some(token => token.kind === 'command' && token.text === './main'));
  assert.equal(tokens.map(token => token.text).join(''), text);
});
test('recognises filenames and commands for the other languages', () => {
  for (const text of ['Save Program.cs, then use dotnet run.', 'Save main.py, then run python main.py.', 'Save name.mjs, then run node name.mjs.']) {
    const tokens = explanationTokens(text);
    assert.ok(tokens.some(token => token.kind === 'file'));
    assert.ok(tokens.some(token => token.kind === 'command'));
    assert.equal(tokens.map(token => token.text).join(''), text);
  }
});
test('leaves ordinary prose untouched', () => {
  assert.deepEqual(explanationTokens('Shows the text in the console.'), [{ text: 'Shows the text in the console.', kind: 'text' }]);
});

test('does not mistake everyday verbs and prepositions for code', () => {
  for (const text of ['Makes tools from a library available.', 'Use it again to print a value.', 'You can return a value using this tool.']) {
    assert.deepEqual(explanationTokens(text), [{ text, kind: 'text' }]);
  }
});
