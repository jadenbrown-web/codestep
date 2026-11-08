import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('production worker serves the CodeStep home page', async () => {
  const { default: worker } = await import('../dist/server/index.js');
  const response = await worker.fetch(new Request('http://localhost/', {headers:{accept:'text/html'}}), {
    ASSETS: {fetch: async () => new Response('Not found', {status:404})},
  }, {waitUntil() {}, passThroughOnException() {}});
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^text\/html/i);
  const html = await response.text();
  assert.match(html, /CodeStep/);
  assert.match(html, /What do you want to learn/);
  for (const language of ['JavaScript','C#','C++','Python','HTML','CSS']) assert.ok(html.includes(language), language);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/);
});

test('all language logos and code-checking grammars ship in the build', async () => {
  for (const language of ['javascript','csharp','cpp','python','html','css']) {
    await access(new URL(`../dist/client/language-logos/${language}.svg`, import.meta.url));
    await access(new URL(`../dist/client/checker/tree-sitter-${language === 'csharp' ? 'c_sharp' : language}.wasm`, import.meta.url));
  }
  const hosting = JSON.parse(await readFile(new URL('../dist/.openai/hosting.json',import.meta.url),'utf8'));
  assert.equal(hosting.project_id,'appgprj_6a749468474081918b5790a1d066502c');
});
