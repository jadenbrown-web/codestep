// A bounded evaluator for the colour exercise. Never executes submitted code.
export function checkPythonColours(code: string): { accepted: boolean; output: string[]; colours: string[]; message: string } {
  const values = new Map<string, string>();
  const printed: string[] = [];
  const fail = (message: string) => ({ accepted: false, output: [], colours: [], message });
  function expression(source: string): string {
    let position = 0;
    function spaces() { while (/\s/.test(source[position] ?? '') && position < source.length) position++; }
    function atom(): string {
      spaces();
      if (source[position] === '(') {
        position++; const result = sum(); spaces();
        if (source[position++] !== ')') throw new Error('Check the closing parenthesis.');
        return result;
      }
      let formatted = false;
      if (/[fF]/.test(source[position] ?? '') && /["']/.test(source[position + 1] ?? '')) { formatted = true; position++; }
      const quote = source[position];
      if (quote === '"' || quote === "'") {
        position++; let text = ''; let closed = false;
        while (position < source.length) {
          const character = source[position++];
          if (character === quote) { closed = true; break; }
          if (character !== '\\') { text += character; continue; }
          const rest = source.slice(position);
          const octal = rest.match(/^[0-7]{1,3}/);
          const hex = rest.match(/^x([0-9a-fA-F]{2})/);
          if (octal) { text += String.fromCharCode(parseInt(octal[0], 8)); position += octal[0].length; }
          else if (hex) { text += String.fromCharCode(parseInt(hex[1], 16)); position += hex[0].length; }
          else {
            const escaped = source[position++];
            const escapes: Record<string, string> = { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', "'": "'" };
            if (!(escaped in escapes)) throw new Error('Use \\033 or \\x1b for the ANSI escape character.');
            text += escapes[escaped];
          }
        }
        if (!closed) throw new Error('Close each quoted string.');
        if (formatted) {
          text = text.replace(/\{\{|\}\}|\{([^{}]*)\}|[{}]/g, token => {
            if (token === '{{') return '\u0001';
            if (token === '}}') return '\u0002';
            if (token === '{' || token === '}') throw new Error('Check the braces in the f-string.');
            const name = token.slice(1, -1).trim();
            if (!values.has(name)) throw new Error(`Define ${name} before using it.`);
            return values.get(name)!;
          }).replace(/\u0001/g, '{').replace(/\u0002/g, '}');
        }
        return text;
      }
      const name = source.slice(position).match(/^[A-Za-z_]\w*/)?.[0];
      if (!name || !values.has(name)) throw new Error(name ? `Define ${name} before using it.` : 'Use strings, colour variables, f-strings or + concatenation for this exercise.');
      position += name.length;
      return values.get(name)!;
    }
    function sum(): string {
      let value = atom(); spaces();
      while (source[position] === '+') { position++; value += atom(); spaces(); }
      return value;
    }
    const value = sum(); spaces();
    if (position !== source.length && source[position] !== '#') throw new Error('This checker supports string assignments and print calls with f-strings or + concatenation. Compare with the guide for other forms.');
    return value;
  }
  try {
    for (const raw of code.split(/\r?\n/)) {
      if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
      if (/^\s/.test(raw)) return fail('Keep these assignments and print calls at the top level without indentation.');
      const line = raw.trim();
      const assignment = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
      const print = line.match(/^print\s*\((.*)\)\s*(?:#.*)?$/);
      if (assignment) values.set(assignment[1], expression(assignment[2]));
      else if (print) printed.push(expression(print[1]));
      else return fail('This exercise checker supports string assignments and print calls. A different Python structure may be valid; use the guide or a supported form here.');
    }
  } catch (error) { return fail((error as Error).message); }
  const expected = new Map([['Red text', '31'], ['Green text', '32']]);
  const output: string[] = []; const colours: string[] = []; const seen = new Set<string>();
  let colour = '0';
  for (const line of printed) {
    let text = ''; const characterColours: string[] = []; let cursor = 0;
    const pattern = /\x1b\[(\d+)m/g;
    for (const match of line.matchAll(pattern)) {
      const segment = line.slice(cursor, match.index);
      text += segment; characterColours.push(...Array(segment.length).fill(colour));
      colour = match[1]; cursor = match.index! + match[0].length;
    }
    const segment = line.slice(cursor); text += segment; characterColours.push(...Array(segment.length).fill(colour));
    if (!text) continue; // A separate print(reset) also resets the terminal.
    const required = expected.get(text);
    if (!required || seen.has(text)) return fail('Print Red text and Green text once each, in either order.');
    if (characterColours.some(actual => actual !== required)) return fail(`Print ${text} in ${required === '31' ? 'red' : 'green'}. Check the ANSI code and where you insert it.`);
    seen.add(text); output.push(text); colours.push(required === '31' ? '#ef4444' : '#4ade80');
  }
  if (seen.size !== 2) return fail('Print both Red text and Green text. Either order is accepted.');
  if (colour !== '0') return fail('Reset the terminal colour after the final message using \\033[0m.');
  return { accepted: true, output, colours, message: '' };
}
