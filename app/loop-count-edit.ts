export type LoopCountEdit={start:number;end:number;text:string};
/** Update just a recognised counter limit; never replace the learner's draft. */
export function patchLoopCount(code:string,language:string,previousCount:number,nextCount:number):{code:string;edit?:LoopCountEdit}{
 if(previousCount===nextCount)return {code};
 const old=language==='python'?previousCount+1:previousCount;
 const prefix=language==='python'
  ? '(^[\\t ]*for\\s+[A-Za-z_]\\w*\\s+in\\s+range\\s*\\(\\s*1\\s*,\\s*)'
  : '(^[\\t ]*for\\s*\\(\\s*(?:(?:let|const|var|int|auto)\\s+)?([A-Za-z_]\\w*)\\s*=\\s*1\\s*;\\s*\\2\\s*<=\\s*)';
 const suffix=language==='python'?'(?=\\s*(?:\\)|$))':'(?=\\s*(?:;|$))';
 const match=new RegExp(prefix+String(old)+suffix,'im').exec(code);
 if(!match)return {code};
 const start=match.index+match[1].length,end=start+String(old).length,text=String(language==='python'?nextCount+1:nextCount);
 return {code:code.slice(0,start)+text+code.slice(end),edit:{start,end,text}};
}
export function mapLoopEditOffset(offset:number,edit?:LoopCountEdit){
 if(!edit||offset<=edit.start)return offset;
 if(offset>=edit.end)return offset+edit.text.length-(edit.end-edit.start);
 return edit.start+Math.min(offset-edit.start,edit.text.length);
}
