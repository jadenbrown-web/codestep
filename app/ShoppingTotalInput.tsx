"use client";
import {useState} from 'react';
export function calculateTotal(price:number,quantity:number){return price*quantity;}
export default function ShoppingTotalInput(){
 const [price,setPrice]=useState('');
 const [quantity,setQuantity]=useState('');
 const [total,setTotal]=useState<number|null>(null);
 const [error,setError]=useState('');
 return <div className="club-terminal total-terminal">
  <form className="club-terminal-form total-terminal-form" aria-label="Shopping total input" onSubmit={event=>{
   event.preventDefault();
   const values=[price.trim(),quantity.trim()];
   const result=calculateTotal(Number(values[0]),Number(values[1]));
   if(!values.every(value=>/^[+-]?\d+$/.test(value)&&Number.isSafeInteger(Number(value)))||!Number.isSafeInteger(result)){setError('Enter a whole-number price and quantity.');setTotal(null);return;}
   setError('');setTotal(result);
  }}>
   <label>Enter the price: £<input aria-label="Price in pounds" inputMode="numeric" autoComplete="off" value={price} onChange={event=>setPrice(event.target.value)}/></label>
   <label>Enter the quantity:<input aria-label="Quantity" inputMode="numeric" autoComplete="off" value={quantity} onChange={event=>setQuantity(event.target.value)}/></label>
   <button type="submit">Calculate total</button>
  </form>
  <p className="club-terminal-result" role="status">{error||(total===null?'Enter a price and quantity, then press Calculate total.':`Total: £${total}`)}</p>
 </div>;
}
