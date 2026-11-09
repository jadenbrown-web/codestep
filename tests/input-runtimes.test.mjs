import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {build} from 'esbuild';
import Parser from 'web-tree-sitter';
const bundle=await build({entryPoints:['app/input-runtimes.ts'],bundle:true,format:'esm',write:false});
const {BROWSER_INPUT_CODE,BROWSER_INPUT_HTML,browserInputPatch,runCommands}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const checker=await build({entryPoints:['app/lesson-checker.ts'],bundle:true,format:'esm',write:false});
const {compareLesson}=await import('data:text/javascript;base64,'+Buffer.from(checker.outputFiles[0].text).toString('base64'));
await Parser.init();const parser=new Parser();parser.setLanguage(await Parser.Language.load('public/checker/tree-sitter-javascript.wasm'));

test('browser input asks through prompt and prints the entered name',()=>{
 const output=[];vm.runInNewContext(BROWSER_INPUT_CODE,{prompt:q=>{assert.equal(q,'What is your name?');return 'Alex';},console:{log:value=>output.push(value)}});
 assert.deepEqual(output,['Hello Alex']);
 assert.match(BROWSER_INPUT_HTML,/<script src="name.js"><\/script>/);
 assert.throws(()=>vm.runInNewContext(BROWSER_INPUT_CODE,{console}),/prompt is not defined/);
});
test('browser practice is accepted and a missing greeting is rejected',()=>{
 const lesson={title:'Ask for a name in VS Code',...browserInputPatch()};
 assert.equal(compareLesson(parser,BROWSER_INPUT_CODE,lesson,'javascript').accepted,true);
 assert.equal(compareLesson(parser,'let name = prompt("What is your name?");',lesson,'javascript').accepted,false);
 assert.deepEqual(runCommands('javascript','name.js',BROWSER_INPUT_CODE),[]);
});
test('the complete Node example runs with terminal input, including spaces',()=>{
 const result=spawnSync(process.execPath,['public/examples/name.mjs'],{input:'Alex Brown\n',encoding:'utf8',timeout:5000});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Hello Alex Brown/);
 const nodeCode=fs.readFileSync('public/examples/name.mjs','utf8');
 assert.equal(runCommands('javascript','name.mjs',nodeCode)[0].code,'node name.mjs');
});
test('C++ commands use the actual input filename and distinguish shell platforms',()=>{
 const commands=runCommands('cpp','name.cpp','');
 assert.equal(commands[0].code,'clang++ -std=c++17 name.cpp -o main && ./main');
 assert.equal(commands[2].code,'./main');
 assert.equal(commands[3].code,'g++ -std=c++17 name.cpp -o main.exe\n.\\main.exe');
 assert.match(commands[3].note,/only after compilation succeeds/);
});
test('C# file-based commands clearly require .NET 10+',()=>{
 const commands=runCommands('csharp','name.cs','');
 assert.equal(commands[0].code,'dotnet run');
 assert.equal(commands[1].code,'dotnet run --file name.cs');
 assert.match(commands[1].note,/10 or newer/);
});

test('C++ input example compiles and reads a full name',t=>{
 if(spawnSync('g++',['--version']).status!==0){t.skip('GCC is unavailable');return;}
 const source=fs.readFileSync('app/page.tsx','utf8');const start=source.indexOf('{',source.indexOf('const lessons:'));
 const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
 const example=lessons.cpp.find(lesson=>lesson.title==='Ask for a name in VS Code');
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'codestep-input-'));
 try{
  fs.writeFileSync(path.join(directory,'name.cpp'),example.answer);
  const compile=spawnSync('g++',['-std=c++17','name.cpp','-o','main'],{cwd:directory,encoding:'utf8',timeout:15000});
  assert.equal(compile.status,0,compile.stderr);
  const run=spawnSync(path.join(directory,'main'),[],{input:'Alex Brown\n',encoding:'utf8',timeout:5000});
  assert.equal(run.status,0,run.stderr);assert.match(run.stdout,/Hello Alex Brown/);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
