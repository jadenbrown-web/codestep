"use client";
import {useLayoutEffect,useRef} from 'react';

// Measure the compact card first so expanding it never creates unnecessary scroll.
export default function useReferenceSpace(content:string){
 const ref=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const card=ref.current,workspace=card?.parentElement;if(!card||!workspace)return;
  let frame=0;
  const update=()=>{
   card.style.removeProperty('--reference-fill-height');
   card.style.setProperty('--reference-room','0');
   if(!window.matchMedia('(max-width: 850px)').matches)return;
   const style=getComputedStyle(workspace);
   const available=Math.floor(workspace.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom));
   const compact=Math.ceil(card.scrollHeight);
   if(compact>available)return;
   let low=0,high=1;
   card.style.setProperty('--reference-room',String(high));
   if(Math.ceil(card.scrollHeight)<=available)low=high;
   else for(let attempt=0;attempt<6;attempt++){
    const candidate=(low+high)/2;card.style.setProperty('--reference-room',String(candidate));
    if(Math.ceil(card.scrollHeight)<=available)low=candidate;else high=candidate;
   }
   card.style.setProperty('--reference-room',String(low));
   card.style.setProperty('--reference-fill-height',`${available}px`);
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const observer=new ResizeObserver(schedule);observer.observe(workspace);
  // Content can settle after the theme or iframe loads without resizing its host.
  for(const child of card.querySelectorAll<HTMLElement>('.font-featured-example,.layout-controls,.padding-mode,.padding-sliders,.padding-explanation,footer'))observer.observe(child);
  update();
  return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[content]);
 return ref;
}
