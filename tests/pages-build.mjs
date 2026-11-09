import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';

// Check the actual standalone artifact and project-path URLs, independently of the Worker.
const html = await readFile('pages-dist/index.html', 'utf8');
assert.match(html, /<title>CodeStep/);
for (const asset of [...html.matchAll(/(?:src|href)="([^" ]+)"/g)].map(match => match[1])) {
  assert.ok(asset.startsWith('/codestep/'), asset);
  await access(`pages-dist/${asset.slice('/codestep/'.length)}`);
}
for (const language of ['javascript', 'python', 'cpp', 'csharp', 'html', 'css']) {
  await access(`pages-dist/language-logos/${language}.svg`);
  await access(`pages-dist/checker/tree-sitter-${language === 'csharp' ? 'c_sharp' : language}.wasm`);
}
await access('pages-dist/checker/tree-sitter.js');
await access('pages-dist/checker/tree-sitter.wasm');
await access('pages-dist/examples/name.mjs');
const scripts = (await readdir('pages-dist/assets')).filter(file => file.endsWith('.js'));
const code = (await Promise.all(scripts.map(file => readFile(`pages-dist/assets/${file}`, 'utf8')))).join('');
assert.ok(code.includes('tag-example-choice'), 'Selected text examples ship');
assert.ok(code.includes('fullCode'), 'Stable reveal colours ship');
assert.ok(code.includes('checker/tree-sitter-'), 'Browser checker ships');
assert.ok(!code.includes('chatgpt.site'), 'Standalone app must not depend on Sites');
console.log('Standalone artifact: project paths, six language grammars, updated examples and independent runtime verified.');
