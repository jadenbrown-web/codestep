'use client';
import {type LoopOptions} from './loop-examples';
export default function LoopExamplePicker({options,onChange,comparison=false}:{options:LoopOptions;onChange:(options:LoopOptions)=>void;comparison?:boolean}){
 return <div className="comparison-case-picker loop-example-picker">
  <div className="comparison-case-choices" role="group" aria-label="Loop examples">
   <button type="button" aria-pressed={options.mode==='while'} onClick={()=>onChange({...options,mode:'while'})}>While · until correct</button>
   <button type="button" aria-pressed={options.mode==='counted'} onClick={()=>onChange({...options,mode:'counted'})}>For · fixed count</button>
  </div>
  {options.mode==='counted'&&<div className="loop-count-options">
   <label>Repeat <output>{options.count}</output> time{options.count===1?'':'s'}<input type="range" aria-label="Number of repeats" min="1" max="10" step="1" value={options.count} onChange={event=>onChange({...options,count:Number(event.target.value)})}/></label>
   <div><b>Loop variable</b><div className="comparison-case-choices" role="group" aria-label="Loop variable">{(['attempt','bar','number'] as const).map(variable=><button type="button" key={variable} aria-pressed={options.variable===variable} onClick={()=>onChange({...options,variable})}><code>{variable}</code></button>)}</div></div>
  </div>}
  <p><b>{options.mode==='while'?'Keep asking until the answer is correct':`Repeat exactly ${options.count} time${options.count===1?'':'s'}`}</b><span>{options.mode==='counted'?'attempt, bar and number are variable names you choose; they hold the current counter value.':'The original question, while condition and break stay the same.'}</span><span>{comparison?'Changes both comparison examples; your practice code stays unchanged.':'Changing options clears your attempt. Type the new code, then choose Check code.'}</span></p>
 </div>;
}
