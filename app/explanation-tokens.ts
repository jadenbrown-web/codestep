export type ExplanationToken = { text: string; kind: 'text' | 'code' | 'file' | 'command' };

export type ExplanationContext = { code?: string; language?: string };

const CODE_WORDS = new Set('let const def elif lambda async await nullptr bool int double void var foreach typeof instanceof public private static readonly auto namespace Path File Directory Regex Thread List HashSet Dictionary Random Task Date Math String Object Number Array Set Map Promise null true false str len isinstance enumerate hasattr getattr setattr'.split(' '));

/** Keep instructions as prose, while marking the exact code and filenames to use. */
export function explanationTokens(text: string, context: ExplanationContext = {}): ExplanationToken[] {
  const basePattern = /g\+\+\s+-std=c\+\+\d+\s+[\w./-]+\s+-o\s+[\w./-]+|\bdotnet (?:new console|run)\b|\b(?:node|python3?|py)\s+[\w./-]+\.(?:mjs|js|py)\b|\.\/[\w-]+(?:\.[\w-]+)*|#include(?:\s*<[^>]+>)?|\b[\w-]+\.(?:cpp|cs|py|mjs|js|html|css|h|hpp)\b|\b[A-Za-z_]\w*(?:(?:::|\.)[A-Za-z_]\w*)+(?:\([^()\n]*\))?|\b[A-Za-z_]\w*\([^()\n]*\)|<\/?[A-Za-z][^>\n]*>|#[0-9a-fA-F]{6}\b|\$\{[^}\n]+\}|\{[A-Za-z_]\w*\}|\b(?:font-family|background-color|text-align|border-radius|border-left|border-bottom|href|src|alt|DOCTYPE)\b|\\[nrt]|<<|>>|::|===|!==|==|!=|&&|\|\||=>|->|<=|>=|\+=|-=|\*=|\/=|=|\(\)|\[\]|[{}]|\b(?:std|cout|cin|nullptr|None|True|False|Console|DateTime|RegexOptions|ThreadPool|System)\b/g;
  const words = [...new Set((context.code ?? '').match(/\b[A-Za-z_]\w*/g) ?? [])]
    .filter(word => CODE_WORDS.has(word) || /[a-z][A-Z]|[A-Za-z]_[A-Za-z]/.test(word));
  const contextual = words.length ? `|\\b(?:${words.sort((a,b) => b.length-a.length).join('|')})\\b` : '';
  // Explicit code spans disambiguate words such as "return", "from" and "print".
  const pattern = new RegExp('`[^`\\n]+`|' + basePattern.source + contextual, 'g');
  const result: ExplanationToken[] = [];
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    if (index > offset) result.push({ text: text.slice(offset, index), kind: 'text' });
    const value = match[0].startsWith('`') ? match[0].slice(1, -1) : match[0];
    const kind = /^(?:g\+\+ |dotnet |node |python3? |py |\.\/)/.test(value) ? 'command' : /^[\w-]+\.(?:cpp|cs|py|mjs|js|html|css|h|hpp)$/.test(value) ? 'file' : 'code';
    result.push({ text: value, kind });
    offset = index + match[0].length;
  }
  if (offset < text.length) result.push({ text: text.slice(offset), kind: 'text' });
  return result;
}
