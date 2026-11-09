"use client";
import type {ReactNode} from 'react';
import CopyCodeButton from './CopyCodeButton';
import {BROWSER_INPUT_CODE,BROWSER_INPUT_HTML,type InputRuntime} from './input-runtimes';

export default function InputRuntimeExamples({nodeCode,selected,onSelect,renderCode}:{nodeCode:string;selected:InputRuntime;onSelect:(runtime:InputRuntime)=>void;renderCode:(code:string,language:'javascript'|'html')=>ReactNode}) {
  return <section className="input-runtime-examples" aria-label="JavaScript input environments">
    <h2>One language, two places to run it</h2>
    <p>A browser and Node.js both run JavaScript, but provide different input tools. A runtime is what runs your code; VS Code is where you edit it. These are not different versions of the JavaScript language.</p>
    <div className="runtime-picker" role="group" aria-label="Practice environment">
      <button aria-pressed={selected==='node'} data-active={selected==='node'} onClick={()=>onSelect('node')}>Node.js terminal</button>
      <button aria-pressed={selected==='browser'} data-active={selected==='browser'} onClick={()=>onSelect('browser')}>Browser prompt()</button>
    </div>
    <p className="runtime-practice-hint">Choose which example to practise in the main editor. Switching clears your current attempt. Both complete examples are shown below.</p>
    {[{id:'node' as const,title:'Node.js · terminal input',file:'name.mjs',code:nodeCode,description:'Read a line typed in the terminal. Import createInterface, create input, ask the question, then close the interface. Copy the whole example: input.question() alone fails because input has not been created.'},{id:'browser' as const,title:'Browser · prompt dialog',file:'name.js',code:BROWSER_INPUT_CODE,description:'Ask in a browser dialog. Open the browser developer console to see console.log output. Running this with node name.js fails because Node.js does not provide prompt() by default.'}].map(example=><article className="input-runtime-editor" key={example.id} data-selected={selected===example.id}>
      <header><div><h3>{example.title}</h3><small>{example.file}{selected===example.id?' · In practice editor':''}</small></div><CopyCodeButton iconOnly code={example.code} label={example.title}/></header>
      <div className="input-runtime-code"><pre><code className="example-syntax-code">{renderCode(example.code,'javascript')}</code></pre></div><p>{example.description}</p>{example.id==='node'&&<div className="runtime-command"><pre><code>node name.mjs</code></pre><CopyCodeButton iconOnly code="node name.mjs" label="Node.js run command"/></div>}
    </article>)}
    <article className="browser-input-launcher"><h3>Open the browser example</h3><p>Save the browser code as <code>name.js</code>. Save this launcher as <code>index.html</code> beside it and open index.html in your browser.</p><div className="runtime-command"><pre><code className="example-syntax-code">{renderCode(BROWSER_INPUT_HTML,'html')}</code></pre><CopyCodeButton iconOnly code={BROWSER_INPUT_HTML} label="browser HTML launcher"/></div></article>
  </section>;
}
