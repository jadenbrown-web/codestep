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

test('highlights assignment and named code references from the lesson context',()=>{
 const text='getMessage runs first; console.log receives Hello. Give a variable a starting value with =.';
 const tokens=explanationTokens(text,{code:'function getMessage() { return "Hello"; } console.log(getMessage()); let name = "Sam";',language:'javascript'});
 assert.deepEqual(tokens.filter(t=>t.kind==='code').map(t=>t.text),['getMessage','console.log','=']);
 assert.equal(tokens.map(t=>t.text).join(''),text);
});
test('recognises code terms consistently across all six languages',()=>{
 const samples=[
  ['javascript','let value = await work();','let creates a value; await waits.', ['let','await']],
  ['python','def get_message(): return None','def names the function. get_message gives back None.', ['def','get_message','None']],
  ['csharp','public string Name; var value = File.ReadAllText("a");','public allows access. var works out the type. File reads text.', ['public','var','File']],
  ['cpp','const auto& item = values;','const keeps it fixed. auto works out the type. `&` uses the existing item.', ['const','auto','&']],
  ['html','<a href="page.html">Link</a>','<a> makes a link; href chooses its destination.', ['<a>','href']],
  ['css','p { font-family: Arial; color: #FF0000; }','font-family chooses the typeface. #FF0000 is red.', ['font-family','#FF0000']],
 ];
 for(const [language,code,text,expected] of samples) assert.deepEqual(explanationTokens(text,{code,language}).filter(t=>t.kind==='code').map(t=>t.text),expected,language);
});
test('explicit spans identify ambiguous keywords without colouring ordinary prose',()=>{
 const text='Use `return` to finish. You can return a value using this tool. Use `from … import …` to choose a tool.';
 const tokens=explanationTokens(text,{code:'from datetime import datetime\ndef show(): return print("hi")'});
 assert.deepEqual(tokens.filter(t=>t.kind==='code').map(t=>t.text),['return','from … import …']);
 assert.equal(tokens.map(t=>t.text).join(''),'Use return to finish. You can return a value using this tool. Use from … import … to choose a tool.');
});
test('does not turn generic example names or normal verbs into code even when they occur in the source',()=>{
 const text='Choose your own name for the value. Use it again to print a value. You can return a value using this tool.';
 assert.deepEqual(explanationTokens(text,{code:'function run(name) { let value = name; return print(value); }'}),[{text,kind:'text'}]);
});

test('preserves explanation text throughout every lesson in all six languages',async()=>{
 const source=fs.readFileSync('app/page.tsx','utf8');
 const start=source.indexOf('{',source.indexOf('const lessons:'));
 const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
 const code=ts.transpileModule(fs.readFileSync('app/lesson-breakdown.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const helpers=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 for(const [language,course] of Object.entries(lessons)) for(const lesson of course){
  const parts=[...helpers.syntaxBreakdown(lesson,language),...helpers.importBreakdown(lesson,language),...helpers.setupBreakdown(lesson,language)];
  for(const part of parts){
   const tokens=explanationTokens(part.meaning,{code:lesson.answer+'\n'+part.code,language});
   assert.equal(tokens.map(t=>t.text).join(''),part.meaning.replace(/`([^`\n]+)`/g,'$1'),`${language}: ${lesson.title}: ${part.code}`);
   assert.ok(tokens.every(t=>t.text.length>0));
  }
 }
});
