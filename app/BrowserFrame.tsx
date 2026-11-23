import React, {type ReactNode} from 'react';

export default function BrowserFrame({title='Web page',file='index.html',children}:{title?:string;file?:string;children:ReactNode}) {
 return <div className="browser-page-preview">
  <div className="browser-preview-tab" aria-label="Browser tab title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span>{title}</span></div>
  <div className="browser-preview-navigation" aria-label="Preview file"><span>{file}</span></div>
  {children}
 </div>;
}
