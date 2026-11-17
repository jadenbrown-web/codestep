import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {build} from 'esbuild';
import Parser from 'web-tree-sitter';
const mod=await build({entryPoints:['app/time-zones.ts'],bundle:true,format:'esm',write:false});
const {applyTimeZone,formatZonedClock,timeZones}=await import('data:text/javascript;base64,'+Buffer.from(mod.outputFiles[0].text).toString('base64'));
const checker=await build({entryPoints:['app/lesson-checker.ts'],bundle:true,format:'esm',write:false});
const {compareLesson}=await import('data:text/javascript;base64,'+Buffer.from(checker.outputFiles[0].text).toString('base64'));
const source=fs.readFileSync('app/page.tsx','utf8'),start=source.indexOf('{',source.indexOf('const lessons:'));
const lessons=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
await Parser.init();
for(const language of ['python','javascript','csharp','cpp']){
 const parser=new Parser();parser.setLanguage(await Parser.Language.load(`public/checker/tree-sitter-${language==='csharp'?'c_sharp':language}.wasm`));
 const local=lessons[language].find(item=>item.displayCurrentTime);
 test(`${language}: every time zone passes; local or wrong zone cannot pass a selected zone`,()=>{
  assert.equal(applyTimeZone(local,language,'local').answer,local.answer);
  for(const zone of timeZones.slice(1)){
   const lesson=applyTimeZone(local,language,zone.id);
   assert.equal(compareLesson(parser,lesson.answer,lesson,language).accepted,true,zone.id);
   assert.equal(compareLesson(parser,local.answer,lesson,language).accepted,false);
   assert.equal(compareLesson(parser,lesson.answer.replace(zone.id,'Asia/Tokyo'),lesson,language).accepted,false);
   assert.match(lesson.explanation,/daylight saving/);
  }
 });
}
test('named zones use date-specific daylight saving, including US/Europe transition gaps and day rollover',()=>{
 const cases=[['2026-11-17T23:30:00Z',['23:30','00:30','18:30','15:30']],['2026-07-17T12:00:00Z',['13:00','14:00','08:00','05:00']],['2026-03-20T12:00:00Z',['12:00','13:00','08:00','05:00']]];
 for(const [instant,expected] of cases)timeZones.slice(1).forEach((zone,i)=>assert.equal(formatZonedClock(new Date(instant),zone.id),expected[i]));
});
test('other lessons, including waiting for local time, stay unchanged',()=>{
 for(const course of Object.values(lessons))for(const lesson of course.filter(item=>!item.displayCurrentTime))assert.equal(applyTimeZone(lesson,'python','Europe/Paris'),lesson);
});
