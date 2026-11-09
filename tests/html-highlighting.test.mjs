import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const source=fs.readFileSync('app/page.tsx','utf8');
const ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HighlightedCode').getText(ast);
const js=ts.transpileModule(fn,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
const Component=new Function('React',js+'\nreturn HighlightedCode;')(React);
function tokens(code){
 const tree=Component({code,language:'html'});let offset=0;
 return React.Children.toArray(tree.props.children).filter(React.isValidElement).map(node=>{const value={kind:node.props.className,text:node.props.children,start:offset};offset+=value.text.length;return {...value,end:offset};});
}
test('heading text stays plain even when it contains an HTML tag name',()=>{
 const code='<h1>Main heading</h1>\n<h2>Main section</h2>\n<p>section div style const 123</p>';
 const parts=tokens(code);
 assert.equal(parts.map(p=>p.text).join(''),code);
 for(const match of code.matchAll(/>[^<]+</g)){
  const start=match.index+1,end=match.index+match[0].length-1;
  assert.ok(parts.filter(p=>p.end>start&&p.start<end).every(p=>p.kind==='syntax-plain'),match[0]);
 }
 assert.ok(parts.some(p=>p.text==='h2'&&p.kind==='syntax-keyword'));
});
test('attribute values and comments retain their syntax colours',()=>{
 const parts=tokens('<section id="section > heading">section</section><!-- section -->');
 assert.ok(parts.some(p=>p.text==='id'&&p.kind==='syntax-attribute'));
 assert.ok(parts.some(p=>p.text==='"section > heading"'&&p.kind==='syntax-string'));
 assert.ok(parts.some(p=>p.text==='<!-- section -->'&&p.kind==='syntax-comment'));
 assert.ok(parts.some(p=>p.text==='section'&&p.kind==='syntax-plain'));
});
test('embedded code and the typing caret still render normally',()=>{
 const html=renderToStaticMarkup(React.createElement(Component,{code:'<script>const value = 1;</script>',language:'html'}));
 assert.match(html,/syntax-keyword[^>]*>const</);
 const heading=renderToStaticMarkup(React.createElement(Component,{code:'<h2>Main section',language:'html',caretIndex:16}));
 assert.equal((heading.match(/class="editor-caret"/g)??[]).length,1);
});

test('animated code keeps its completed syntax colour from the first character',()=>{
 const samples={
  javascript:'function getMessage() { return "Hello"; }\nconsole.log(getMessage());',
  python:'def get_message():\n    return "Hello"\nprint(get_message())',
  csharp:'string GetMessage() { return "Hello"; }\nConsole.WriteLine(GetMessage());',
  cpp:'#include <iostream>\nint main() { std::cout << "Hello"; }',
  html:'<h2>Main section</h2><script>const value = 1;</script>',
  css:'p { font-family: "Courier New"; border: 5px dotted blue; }',
 };
 const decode=text=>text.replace(/&(lt|gt|amp|quot|#x27|#39);/g,(_,name)=>({lt:'<',gt:'>',amp:'&',quot:'"','#x27':"'",'#39':"'"})[name]);
 const render=(code,language,fullCode)=>{
  const html=renderToStaticMarkup(React.createElement(Component,{code,language,fullCode}));
  return [...html.matchAll(/<span class="(syntax-[^"]+)">([^<]*)<\/span>/g)].flatMap(m=>[...decode(m[2])].map(character=>({character,kind:m[1]})));
 };
 for(const [language,full] of Object.entries(samples)){
  const completed=render(full,language);
  assert.equal(completed.map(p=>p.character).join(''),full);
  for(let length=1;length<full.length;length++){
   const visible=render(full.slice(0,length),language,full);
   assert.deepEqual(visible,completed.slice(0,length),`${language}: first ${length} characters keep their syntax colours`);
  }
 }
});

test('CSS examples colour complete property names, numbers and font strings',()=>{
 const tree=Component({code:'p { border-radius: 12px; border-left: 5px solid blue; font-family: "Courier New"; }',language:'css'});
 const spans=React.Children.toArray(tree.props.children).filter(React.isValidElement);
 for(const property of ['border-radius','border-left','font-family']) assert.ok(spans.some(n=>n.props.children===property&&n.props.className==='syntax-api'),property);
 assert.ok(spans.some(n=>n.props.children==='12px'&&n.props.className==='syntax-number'));
 assert.ok(spans.some(n=>n.props.children==='"Courier New"'&&n.props.className==='syntax-string'));
});
