import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const source=fs.readFileSync('app/page.tsx','utf8');
const start=source.indexOf('{',source.indexOf('const lessons:'));
const courses=JSON.parse(source.slice(start,source.indexOf('\n};',start)+2));
const titles=['Check for a particular time','Keep checking until the time is reached'];
for(const language of ['javascript','python','csharp','cpp'])test(`${language}: both clock lessons set a relative target before waiting`,()=>{
 for(const title of titles){
  const lesson=courses[language].find(item=>item.title===title);
  assert.doesNotMatch(JSON.stringify(lesson),/17:20|hour ==|minute ==|next day/);
  assert.match(lesson.answer,/>= target/);
  assert.match(lesson.outputNote,/previews the result immediately/);
  assert.ok(lesson.answer.indexOf('target =')<lesson.answer.search(/setTimeout|setInterval|while|await|time.sleep|std::this_thread/));
 }
});
for(const title of titles)test(`JavaScript ${title}: one minute across midnight, late checks and stop after one print`,()=>{
 const lesson=courses.javascript.find(item=>item.title===title);
 let now=Date.parse('2026-12-31T23:59:30Z'),callback,delay,stopped=false;
 const lines=[];
 vm.runInNewContext(lesson.answer,{Date:{now:()=>now},console:{log:value=>lines.push(value)},setTimeout:(fn,ms)=>{callback=fn;delay=ms;},setInterval:(fn,ms)=>{callback=fn;delay=ms;return 1;},clearInterval:()=>{stopped=true;}});
 if(title===titles[0]){assert.equal(delay,60000);now+=60001;callback();}
 else{assert.equal(delay,1000);for(let i=0;i<59;i++){now+=1000;callback();assert.deepEqual(lines,[]);}now+=2000;callback();assert.equal(stopped,true);}
 assert.deepEqual(lines,['Time reached!']);
});
for(const title of titles)test(`Python ${title}: one minute across midnight without a fixed clock`,()=>{
 const lesson=courses.python.find(item=>item.title===title);
 const harness=`import datetime as real, sys, types\ncurrent = real.datetime(2026,12,31,23,59,30)\nwaits = []\nclass Clock:\n    @staticmethod\n    def now(): return current\ndef sleep(seconds):\n    global current\n    waits.append(seconds)\n    current += real.timedelta(seconds=seconds)\nsys.modules['datetime'] = types.SimpleNamespace(datetime=Clock,timedelta=real.timedelta)\nsys.modules['time'] = types.SimpleNamespace(sleep=sleep)\nexec(${JSON.stringify(lesson.answer)})\nassert sum(waits) == 60, waits\nassert current == real.datetime(2027,1,1,0,0,30)\nassert waits == ${title===titles[0]?'[60]':'[1] * 60'}\n`;
 assert.equal(execFileSync('python3',['-c',harness],{encoding:'utf8'}),'Time reached!\n');
});
