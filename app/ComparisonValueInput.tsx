"use client";
import {useState} from 'react';
import {comparisonCase,comparisonMessage,type ComparisonCaseId} from './comparison-examples';
export default function ComparisonValueInput({example}:{example:ComparisonCaseId}){
 const item=comparisonCase(example),[value,setValue]=useState(''),[result,setResult]=useState('');
 return <div className="club-terminal">
  <form className="club-terminal-form" aria-label="Try the comparison" onSubmit={event=>{
   event.preventDefault();const raw=value.trim(),number=Number(raw);
   setResult(/^[+-]?\d+$/.test(raw)&&Number.isSafeInteger(number)?comparisonMessage(example,number):'Enter a whole number to try this comparison.');
  }}>
   <label>{item.question}<input aria-label="Comparison value" inputMode="numeric" autoComplete="off" value={value} onChange={event=>setValue(event.target.value)}/></label>
   <button type="submit">Try value</button>
  </form>
  <p className="club-terminal-result" role="status">{result||'Try a value on either side of the boundary, and the boundary itself.'}</p>
 </div>;
}
