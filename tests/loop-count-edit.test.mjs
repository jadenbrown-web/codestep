import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
const b=await build({entryPoints:['app/loop-count-edit.ts'],bundle:true,format:'esm',write:false});
const {patchLoopCount,mapLoopEditOffset}=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
test('Python patches only the range stop, preserving comments, custom names, formatting and other numbers',()=>{
 const code='# Keep 3, 4 and 10\nfor lap in range( 1, 4 ):\n    print(4, "range(1, 4)", lap)\n';
 const result=patchLoopCount(code,'python',3,10);
 assert.equal(result.code,code.replace('range( 1, 4 )','range( 1, 11 )'));
 assert.equal(mapLoopEditOffset(2,result.edit),2);
 assert.equal(mapLoopEditOffset(code.length,result.edit),code.length+1);
 assert.equal(mapLoopEditOffset(result.edit.end,result.edit),result.edit.start+2);
 assert.equal(patchLoopCount(result.code,'python',10,1).code,code.replace('range( 1, 4 )','range( 1, 2 )'));
});
for(const language of ['javascript','csharp','cpp'])test(`${language}: patch only the for condition and keep unrelated edits`,()=>{
 const code='// keep 3\nfor (int lap = 1; lap <= 3; lap++) {\n  print("3", lap);\n}\n';
 assert.equal(patchLoopCount(code,language,3,10).code,code.replace('lap <= 3','lap <= 10'));
 const multiline='for (let lap = 1;\n lap <= 3;\n lap++) {}';
 assert.equal(patchLoopCount(multiline,language,3,4).code,multiline.replace('<= 3','<= 4'));
});
test('unfinished headers can be patched, but unrelated or nonstandard code is never replaced',()=>{
 assert.equal(patchLoopCount('for number in range(1, 4','python',3,5).code,'for number in range(1, 6');
 for(const code of ['', '# for number in range(1, 4):', 'print("range(1, 4)")','for number in range(2, 4):','for number in range(1, 40):'])assert.equal(patchLoopCount(code,'python',3,5).code,code);
 assert.equal(patchLoopCount('for (int number = 1; number < 3; number++) {}','cpp',3,5).code,'for (int number = 1; number < 3; number++) {}');
});
