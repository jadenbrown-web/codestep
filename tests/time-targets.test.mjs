import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const compiled=ts.transpileModule(fs.readFileSync('app/clock-lessons.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {nextClockTarget,applyClockTarget}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const courses=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
test('18:28 shows explicit 18 and 29 rather than a runtime duration calculation',()=>{
 assert.deepEqual(nextClockTarget(new Date(2026,10,17,18,28,45)),{hour:18,minute:29,label:'18:29'});
});
test('the next minute rolls across hours and midnight',()=>{
 assert.deepEqual(nextClockTarget(new Date(2026,10,17,18,59,59)),{hour:19,minute:0,label:'19:00'});
 assert.deepEqual(nextClockTarget(new Date(2026,11,31,23,59,59)),{hour:0,minute:0,label:'00:00'});
});
for(const language of ['javascript','python','csharp','cpp'])test(`${language}: both clock lessons use the same literal target in code, explanations and preview`,()=>{
 for(const lesson of courses[language].filter(item=>item.clockExample)){
  const updated=applyClockTarget(lesson,{hour:18,minute:29,label:'18:29'});
  assert.match(updated.answer,/hour ===? 18/);assert.match(updated.answer,/minute ===? 29/);
  assert.match(updated.outputNote,/18:29/);assert.doesNotMatch(updated.answer,/timedelta|AddMinutes|Date.now|target =|sleep\(60\)/);
  assert.match(updated.prompt,/hour is 18.*minute is 29|18:29/);
  assert.doesNotMatch(JSON.stringify(updated),/17:20|hour ===? 17|minute ===? 20/);
  assert.match(lesson.answer,/hour ===? 17/,'Generating a target never mutates the shared lesson');
  if(language==='cpp')assert.match(updated.runHint,/-std=c\+\+17/,'Compiler flags are not time values');
 }
});
test('non-clock lessons are left unchanged',()=>{
 assert.equal(applyClockTarget(courses.python[0],nextClockTarget()),courses.python[0]);
});
