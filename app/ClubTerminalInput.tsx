"use client";
import {useState} from 'react';
export function clubEntryMessage(name:string){
 return /^J/i.test(name)?'You can enter the club!':'You cannot enter the club.';
}
export default function ClubTerminalInput(){
 const [name,setName]=useState('');
 const [submitted,setSubmitted]=useState<string|null>(null);
 return <div className="club-terminal">
  <form className="club-terminal-form" aria-label="Club name input" onSubmit={event=>{event.preventDefault();setSubmitted(name);}}>
   <label>Enter your name:<input aria-label="Club name" value={name} onChange={event=>setName(event.target.value)} autoComplete="given-name" spellCheck={false}/></label>
   <button type="submit">Submit name</button>
  </form>
  <p className="club-terminal-result" role="status">{submitted===null?'Enter a name and press Enter or Submit name.':clubEntryMessage(submitted)}</p>
 </div>;
}
