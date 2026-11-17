export type ClockTarget={hour:number;minute:number;label:string};
export function nextClockTarget(now=new Date()):ClockTarget{
 const target=new Date(now.getTime());
 target.setMinutes(target.getMinutes()+1,0,0);
 const hour=target.getHours(),minute=target.getMinutes();
 return {hour,minute,label:`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`};
}
type ClockLesson={clockExample?:boolean;answer:string;explanation:string;prompt:string;note:string;outputNote?:string;parts?:{code:string;name:string;meaning:string}[]};
export function applyClockTarget<T extends ClockLesson>(lesson:T,target:ClockTarget):T & {clockTarget?:ClockTarget}{
 if(!lesson.clockExample)return lesson;
 const patch=(text:string)=>text.replace(/\bhour\s*(===|==)\s*17/g,(_,operator)=>`hour ${operator} ${target.hour}`).replace(/\bminute\s*(===|==)\s*20/g,(_,operator)=>`minute ${operator} ${target.minute}`).replace(/hour is 17/g,`hour is ${target.hour}`).replace(/minute is 20/g,`minute is ${target.minute}`).replace(/17:20/g,target.label);
 return {...lesson,clockTarget:target,answer:patch(lesson.answer),explanation:patch(lesson.explanation),prompt:patch(lesson.prompt),note:patch(lesson.note),outputNote:lesson.outputNote?patch(lesson.outputNote):undefined,parts:lesson.parts?.map(part=>({...part,code:patch(part.code),meaning:patch(part.meaning)}))};
}
