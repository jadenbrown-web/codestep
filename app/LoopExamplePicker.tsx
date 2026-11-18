'use client';
import {type LoopOptions} from './loop-examples';
export default function LoopExamplePicker({options,onChange,comparison=false}:{options:LoopOptions;onChange:(options:LoopOptions)=>void;comparison?:boolean}){
 return <div className="comparison-case-picker loop-example-picker">
  <div className="comparison-case-choices" role="group" aria-label="Loop examples">
   <button type="button" aria-pressed={options.mode==='while'} onClick={()=>{if(options.mode!=='while')onChange({...options,mode:'while'});}}>While · until correct</button>
   <button type="button" aria-pressed={options.mode==='counted'} onClick={()=>{if(options.mode!=='counted')onChange({...options,mode:'counted'});}}>For · fixed count</button>
  </div>
  {options.mode==='counted'&&<div className="loop-count-options">
   <label>Repeat <output>{options.count}</output> time{options.count===1?'':'s'}<input type="range" aria-label="Number of repeats" min="1" max="10" step="1" value={options.count} onChange={event=>{const count=Number(event.target.value);if(count!==options.count)onChange({...options,count});}}/></label>

  </div>}
  <p><b>{options.mode==='while'?'Keep asking until the answer is correct':`Repeat exactly ${options.count} time${options.count===1?'':'s'}`}</b><span>{options.mode==='counted'?'number is the loop variable; it holds the current counter value.':'The original question, while condition and break stay the same.'}</span><span>{comparison?'Changes both comparison examples; your practice code stays unchanged.':'Switching modes clears your attempt. The slider changes only the repeat limit in your code; choose Check code again.'}</span></p>
 </div>;
}
