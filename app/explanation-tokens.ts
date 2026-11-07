export type ExplanationToken = { text: string; kind: 'text' | 'code' | 'file' | 'command' };

/** Keep instructions as prose, while marking the exact code and filenames to use. */
export function explanationTokens(text: string): ExplanationToken[] {
  const pattern = /g\+\+\s+-std=c\+\+\d+\s+[\w./-]+\s+-o\s+[\w./-]+|\bdotnet (?:new console|run)\b|\b(?:node|python3?|py)\s+[\w./-]+\.(?:mjs|js|py)\b|\.\/[\w-]+(?:\.[\w-]+)*|#include(?:\s*<[^>]+>)?|\b[\w-]+\.(?:cpp|cs|py|mjs|js|html|css|h|hpp)\b|\b[A-Za-z_]\w*(?:(?:::|\.)[A-Za-z_]\w*)+(?:\([^()\n]*\))?|\b[A-Za-z_]\w*\([^()\n]*\)|\\[nrt]|<<|>>|::|===|!==|==|!=|&&|\|\||\b(?:std|cout|cin|nullptr|None|True|False|Console|DateTime|RegexOptions|ThreadPool|System)\b/g;
  const result: ExplanationToken[] = [];
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    if (index > offset) result.push({ text: text.slice(offset, index), kind: 'text' });
    const value = match[0];
    const kind = /^(?:g\+\+ |dotnet |node |python3? |py |\.\/)/.test(value) ? 'command' : /^[\w-]+\.(?:cpp|cs|py|mjs|js|html|css|h|hpp)$/.test(value) ? 'file' : 'code';
    result.push({ text: value, kind });
    offset = index + value.length;
  }
  if (offset < text.length) result.push({ text: text.slice(offset), kind: 'text' });
  return result;
}
