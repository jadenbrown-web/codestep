export type LoopOptions={mode:'while'|'counted';count:number};
export const defaultLoopOptions:LoopOptions={mode:'while',count:3};
type LoopLesson={loopExample?:boolean;answer:string;explanation:string;prompt:string;note:string;output:string[];runHint?:string;parts?:{code:string;name:string;meaning:string}[];outputNote?:string;outputAnnotations?:string[]};
export function applyLoopExample<T extends LoopLesson>(lesson:T,language:string,options:LoopOptions):T & {loopOptions?:LoopOptions}{
 if(!lesson.loopExample)return lesson;
 if(options.mode==='while')return {...lesson,loopOptions:options};
 const {count}=options,variable='number',label='Number',stop=count+1;
 let answer='',loop='',print='',runHint=lesson.runHint;
 if(language==='python'){
  loop=`for ${variable} in range(1, ${stop}):`;print=`print(f"${label} {${variable}}")`;answer=`${loop}\n    ${print}`;
 }else if(language==='javascript'){
  loop=`for (let ${variable} = 1; ${variable} <= ${count}; ${variable}++)`;print=`console.log(\`${label} \${${variable}}\`);`;answer=`${loop} {\n  ${print}\n}`;
  runHint='Save as main.js and run node main.js, or run this example in a browser developer console. This counted loop does not ask for input.';
 }else if(language==='csharp'){
  loop=`for (int ${variable} = 1; ${variable} <= ${count}; ${variable}++)`;print=`Console.WriteLine($"${label} {${variable}}");`;answer=`${loop} {\n    ${print}\n}`;
 }else if(language==='cpp'){
  loop=`for (int ${variable} = 1; ${variable} <= ${count}; ${variable}++)`;print=`std::cout << "${label} " << ${variable} << "\\n";`;answer=`#include <iostream>\n\nint main() {\n  ${loop} {\n    ${print}\n  }\n}`;
 }else return lesson;
 const repetition=language==='python'?`range(1, ${stop}) produces ${Array.from({length:count},(_,i)=>i+1).join(', ')}. The start is included and the stop (${stop}) is excluded.`:`The counter starts at 1. ${variable} <= ${count} includes ${count}; ${variable}++ adds 1 after each repetition. When it reaches ${stop}, the condition is false and the loop stops.`;
 return {...lesson,loopOptions:options,answer,runHint,
  explanation:`Use a for loop when you know how many times to repeat. This example prints Number 1 through Number ${count}. ${repetition} ${variable} is a variable you choose, not a keyword. You can choose another valid variable name, but use it consistently. The while option asks the existing question until the answer is correct instead.`,
  prompt:`Use a for loop to print ${label} 1 through ${label} ${count}, once per line.`,
  note:`${language==='python'?'#':'//'} Repeat ${count} times and display each ${variable} number.`,
  output:Array.from({length:count},(_,i)=>`${label} ${i+1}`),outputAnnotations:undefined,
  outputNote:`This for loop runs ${count} time${count===1?'':'s'} and stops automatically. number holds the current counter value.`,
  parts:[
   {code:'for',name:'Repeat a fixed number of times',meaning:'Runs the loop body once for each counter value. Unlike the while example, this loop finishes after the chosen number of repetitions.'},
   {code:variable,name:'Your loop variable',meaning:`${variable} holds the current counter value. It is your chosen variable name, not a special word. It starts at 1 and changes on each repetition. Renaming it means using the new name in the loop header and printed value.`},
   {code:language==='python'?`in range(1, ${stop})`:`${variable} = 1; ${variable} <= ${count}; ${variable}++`,name:language==='python'?'Take each value from the range':'Start, check and increment',meaning:repetition},
   {code:print,name:'Display the current value',meaning:`The text ${label} is the label printed before each value. The variable ${variable} supplies the changing number, giving ${label} 1, ${count>1?`${label} 2, and so on`:'then stopping'}.`},
  ]};
}
