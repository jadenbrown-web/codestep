"use client";
import {comparisonCases,comparisonCase,type ComparisonCaseId} from './comparison-examples';
export default function ComparisonCasePicker({selected,onSelect,language,comparison=false}:{selected:ComparisonCaseId;onSelect:(id:ComparisonCaseId)=>void;language:string;comparison?:boolean}){
 const item=comparisonCase(selected);
 return <div className="comparison-case-picker">
  <div className="comparison-case-choices" role="group" aria-label="Comparison examples">{comparisonCases.map(option=><button type="button" key={option.id} aria-label={option.name} aria-pressed={selected===option.id} title={option.name} onClick={()=>onSelect(option.id)}><code>{language==='javascript'&&option.id==='equal'?'===':language==='javascript'&&option.id==='not-equal'?'!==':option.symbol}</code></button>)}</div>
  <p><b>{item.name} · {item.scenario}</b><span>{item.meaning}</span><span>{comparison?'Changes these comparison examples; your practice code stays unchanged.':'Changing examples clears your current attempt. Type the new code, then choose Check code.'}</span></p>
 </div>;
}
