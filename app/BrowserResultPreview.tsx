import React, {useEffect,useState} from 'react';

export default function BrowserResultPreview({code,css,showTab=false}:{code:string;css?:string;showTab?:boolean}){
  const [tabTitle,setTabTitle]=useState('');
  useEffect(()=>{if(showTab)setTabTitle(new DOMParser().parseFromString(code,'text/html').title || 'Untitled');},[code,showTab]);
  const document = '<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' + (css ? '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>' : '') + code;
  const page = <iframe key={document} className="browser-result-preview" title="Web page result" sandbox="" referrerPolicy="no-referrer" srcDoc={document} />;
  return showTab ? <div className="browser-page-preview"><div className="browser-preview-tab" aria-label="Browser tab title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span>{tabTitle}</span><svg className="browser-tab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></div><div className="browser-preview-navigation" aria-label="Preview file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h17"/></svg><span>index.html</span></div>{page}</div> : page;
}
