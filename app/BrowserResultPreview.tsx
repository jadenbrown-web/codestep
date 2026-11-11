import React from 'react';

export default function BrowserResultPreview({code}:{code:string}){
  const document = '<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' + code;
  return <iframe className="browser-result-preview" title="Web page result" sandbox="" referrerPolicy="no-referrer" srcDoc={document} />;
}
