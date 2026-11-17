"use client";
import {useState} from 'react';
export default function BankTerminalInput(){
 const [deposit,setDeposit]=useState('');
 const [balance,setBalance]=useState<number|null>(null);
 const [error,setError]=useState('');
 return <div className="club-terminal bank-terminal">
  <p className="bank-starting-balance">Starting balance: £100</p>
  <form className="club-terminal-form" aria-label="Bank deposit input" onSubmit={event=>{
   event.preventDefault();
   const value=deposit.trim();
   const amount=Number(value);
   if(!/^[+-]?\d+$/.test(value)||!Number.isSafeInteger(amount+100)){setError('Enter a whole number, such as 50.');setBalance(null);return;}
   setError('');setBalance(100+amount);
  }}>
   <label>How much would you like to deposit? £<input aria-label="Deposit amount" inputMode="numeric" value={deposit} onChange={event=>setDeposit(event.target.value)} autoComplete="off"/></label>
   <button type="submit">Deposit</button>
  </form>
  <p className="club-terminal-result" role="status">{error || (balance===null?'Enter a whole-number amount, then press Enter or Deposit.':`New balance: £${balance}`)}</p>
 </div>;
}
