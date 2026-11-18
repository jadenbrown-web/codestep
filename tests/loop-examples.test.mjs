import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
import Parser from 'web-tree-sitter';
const compiled=await build({entryPoints:['app/loop-examples.ts'],bundle:true,format:'esm',write:false});
const {applyLoopExample,defaultLoopOptions}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const checker=await build({entryPoints:['app/lesson-checker.ts'],bundle:true,format:'esm',write:false});
const {compareLesson}=await import('data:text/javascript;base64,'+Buffer.from(checker.outputFiles[0].text).toString('base64'));
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
await Parser.init();
for(const language of ['python','javascript','csharp','cpp']){
 const base=lessons[language].find(item=>item.loopExample);
 const parser=new Parser();parser.setLanguage(await Parser.Language.load(`public/checker/tree-sitter-${language==='csharp'?'c_sharp':language}.wasm`));
 test(`${language}: default while example and output are preserved`,()=>{
  const actual=applyLoopExample(base,language,defaultLoopOptions);
  for(const key of ['answer','explanation','parts','output','outputAnnotations'])assert.deepEqual(actual[key],base[key]);
 });
 test(`${language}: counted loop accepts each counter/count, rejects wrong bound and while example`,()=>{
  for(const count of [1,3,10]){
   const variable='number';
   const options={mode:'counted',count},example=applyLoopExample(base,language,options);
   assert.equal(compareLesson(parser,example.answer,example,language).accepted,true);
   assert.equal(compareLesson(parser,base.answer,example,language).accepted,false);
   const wrong=applyLoopExample(base,language,{...options,count:count+1});
   assert.equal(compareLesson(parser,wrong.answer,example,language).accepted,false);
   const renamed=example.answer.replaceAll('number','counter');
   assert.equal(compareLesson(parser,renamed,example,language).accepted,true,'A consistently renamed variable is valid');
   assert.equal(example.output.length,count);assert.equal(example.output[0],`${variable[0].toUpperCase()+variable.slice(1)} 1`);
   assert.match(example.explanation,/variable you choose, not a keyword/);
  }
 });
}
test('Python uses an exclusive endpoint and names the chosen loop variable',()=>{
 const base=lessons.python.find(item=>item.loopExample),example=applyLoopExample(base,'python',{mode:'counted',count:3});
 assert.equal(example.answer,'for number in range(1, 4):\n    print(f"Number {number}")');
 assert.match(example.explanation,/stop \(4\) is excluded/);
 assert.deepEqual(example.output,['Number 1','Number 2','Number 3']);
});
