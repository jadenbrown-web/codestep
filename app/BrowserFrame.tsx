import React, {type ReactNode} from 'react';

export default function BrowserFrame({title='Web page',file='index.html',actions,children}:{title?:string;file?:string;actions?:ReactNode;children:ReactNode}) {
 return <div className="browser-page-preview">
  <div className="browser-preview-tab" aria-label="Browser tab title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span title={title}>{title}</span>{actions&&<div className="browser-preview-actions">{actions}</div>}</div>
  <div className="browser-preview-navigation" aria-label="Preview file"><span data-current-page={file} aria-live="polite">{file}</span></div>
  {children}
 </div>;
}
