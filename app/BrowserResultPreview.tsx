import React, {useEffect,useState,type ReactNode} from 'react';
import BrowserFrame from './BrowserFrame';

export default function BrowserResultPreview({code,css,showTab=false,label,actions}:{code:string;css?:string;showTab?:boolean;label?:string;actions?:ReactNode}){
  const [tabTitle,setTabTitle]=useState('');
  useEffect(()=>{if(showTab)setTabTitle(new DOMParser().parseFromString(code,'text/html').title || 'Untitled');},[code,showTab]);
  const document = '<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' + (css ? '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>' : '') + code;
  const page = <iframe key={document} className="browser-result-preview" title="Web page result" sandbox="" referrerPolicy="no-referrer" srcDoc={document} />;
  return <BrowserFrame title={showTab ? tabTitle || 'Untitled' : label ?? 'Web page'} actions={actions}>{page}</BrowserFrame>;
}
