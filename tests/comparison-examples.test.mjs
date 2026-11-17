import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('app/comparison-examples.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {comparisonCase,comparisonMessage,comparisonExample}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const boundaries={
 'at-least':[[17,false],[18,true],[19,true]],greater:[[29,false],[30,false],[31,true]],less:[[4,true],[5,false],[6,false]],'at-most':[[19,true],[20,true],[21,false]],equal:[[99,false],[100,true],[101,false]],'not-equal':[[-1,true],[0,false],[1,true]],between:[[19,false],[20,true],[25,true],[26,false]],outside:[[1,true],[2,false],[10,false],[11,true]],margin:[[94,false],[95,true],[100,true],[105,true],[106,false]],
};
for(const [id,values] of Object.entries(boundaries))test(`${id}: exact boundaries and both branches`,()=>{
 const item=comparisonCase(id);
 for(const [value,passes] of values)assert.equal(comparisonMessage(id,value),passes?item.yes:item.no,`${id} ${value}`);
});
test('ranges use both checks while outside uses either; margins compare absolute distance',()=>{
 assert.match(comparisonExample('python','between').answer,/temperature >= 20 and temperature <= 25/);
 assert.match(comparisonExample('javascript','outside').answer,/weight < 2 \|\| weight > 10/);
 assert.match(comparisonExample('cpp','margin').answer,/std::abs\(measured - 100\) <= 5/);
 assert.match(comparisonExample('javascript','equal').answer,/score === 100/);
 assert.match(comparisonExample('python','at-least').parts[0].meaning,/input\(\) returns text/);
});
