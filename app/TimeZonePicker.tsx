'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {timeZones,timeZoneLabel,type TimeZoneId} from './time-zones';
export default function TimeZonePicker({selected,onSelect,comparison=false}:{selected:TimeZoneId;onSelect:(zone:TimeZoneId)=>void;comparison?:boolean}){
  const [open,setOpen]=useState(false);
  const id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
    document.addEventListener('pointerdown',close);
    return ()=>document.removeEventListener('pointerdown',close);
  },[open]);
  return <div className="time-zone-picker" ref={root} onKeyDown={event=>{if(event.key==='Escape'&&open){event.stopPropagation();setOpen(false);trigger.current?.focus();}}}>
    <button ref={trigger} className="time-zone-trigger" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>Time zone: {timeZoneLabel(selected)} <span aria-hidden="true">{open?'▴':'▾'}</span></button>
    {open&&<div id={id} className="time-zone-options" role="group" aria-label="Choose a time zone">{['Local','Europe','America'].map(region=><div key={region}><b>{region}</b>{timeZones.filter(zone=>zone.region===region).map(zone=><button key={zone.id} aria-pressed={selected===zone.id} onClick={()=>{onSelect(zone.id);setOpen(false);trigger.current?.focus();}}><span>{zone.label}</span>{selected===zone.id&&<span aria-hidden="true">✓</span>}</button>)}</div>)}</div>}
    <small>{comparison?'Changes both comparison examples; your practice code stays unchanged.':'Choose a location to change the example and quiz. Changing locations clears your current attempt.'}</small>
  </div>;
}
