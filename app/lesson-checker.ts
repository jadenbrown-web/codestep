import type Parser from 'web-tree-sitter';
import { checkPythonColours } from './python-colours';

export type CourseLanguage = 'javascript' | 'python' | 'csharp' | 'cpp' | 'html' | 'css';
type Node = Parser.SyntaxNode;
type Form = string | Form[];
type Exercise = { title: string; answer: string; prompt: string };
export type CheckResult = { accepted: boolean; kind: 'accepted' | 'syntax' | 'unverified'; message: string; output?: string[]; colours?: string[] };
const parsers = new Map<CourseLanguage, Parser>();
let loading: Promise<typeof Parser> | undefined;
const languageLoads = new Map<CourseLanguage, Promise<Parser>>();

async function browserParser(): Promise<typeof Parser> {
  if (!loading) loading = (async () => {
    const host = window as unknown as { TreeSitter?: typeof Parser };
    if (!host.TreeSitter) await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/checker/tree-sitter.js';
      script.onload = () => resolve();
      script.onerror = () => { script.remove(); reject(new Error('The code checker could not load. Please try again.')); };
      document.head.appendChild(script);
    });
    const Constructor = host.TreeSitter!;
    await Constructor.init({ locateFile: (file: string) => `/checker/${file}` });
    return Constructor;
  })().catch(error => { loading = undefined; throw error; });
  return loading;
}
export async function prepareChecker(language: CourseLanguage) {
  if (!languageLoads.has(language)) languageLoads.set(language, (async () => {
    const Constructor = await browserParser();
    const parser = new Constructor();
    parser.setLanguage(await Constructor.Language.load(`/checker/tree-sitter-${language === 'csharp' ? 'c_sharp' : language}.wasm`));
    parsers.set(language, parser);
    return parser;
  })().catch(error => { languageLoads.delete(language); throw error; }));
  return languageLoads.get(language)!;
}
export async function checkLesson(code: string, lesson: Exercise, language: CourseLanguage): Promise<CheckResult> {
  return compareLesson(await prepareChecker(language), code, lesson, language);
}

export function checkPreparedLesson(code: string, lesson: Exercise, language: CourseLanguage): CheckResult | null {
  const parser = parsers.get(language);
  return parser ? compareLesson(parser, code, lesson, language) : null;
}

function field(node: Node, ...names: string[]) {
  for (const name of names) { const value = node.childForFieldName(name); if (value) return value; }
  return null;
}
const ignored = new Set(['comment', 'line_comment', 'block_comment']);
const identifiers = new Set(['identifier']);
const strings = new Set(['string', 'string_literal', 'string_literal_expression', 'raw_string_literal', 'verbatim_string_literal']);
const numbers = new Set(['number', 'integer', 'float', 'integer_literal', 'real_literal', 'number_literal']);
const fixedNames = new Set(['main', 'correct', 'getMessage', 'Car', '__init__']);

function decode(text: string, language: CourseLanguage) {
  const match = text.match(/^([rRuUbBfF$@]*)("""|'''|"|'|`)([\s\S]*?)\2$/);
  if (!match) return text;
  const [, prefix, , body] = match;
  if (prefix.includes('@')) return body.replace(/""/g, '"');
  if (language === 'python' && /r/i.test(prefix)) return body;
  return body.replace(/\\(?:u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|U([0-9a-fA-F]{8})|x([0-9a-fA-F]{2})|([0-7]{1,3})|([\s\S]))/g,
    (whole, brace, unicode, long, hex, octal, simple) => {
      if (brace || unicode || long || hex || octal) {
        const value = parseInt(brace || unicode || long || hex || octal, octal ? 8 : 16);
        return value <= 0x10ffff ? String.fromCodePoint(value) : whole;
      }
      const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', a: '\x07', '\\': '\\', '"': '"', "'": "'", '`': '`', '\n': '' };
      return simple in escapes ? escapes[simple] : whole;
    });
}

// Binding IDs depend on their initializer and scope, so changing a name does
// not change its meaning. References resolve in their original lexical scope.
function canonical(root: Node, language: CourseLanguage, lesson: Exercise): Form {
  type Scope = { key: string; parent?: Scope; bindings: Map<string, string>; counts: Map<string, number> };
  const rootScope: Scope = { key: 'root', bindings: new Map(), counts: new Map() };
  const scopes = new Map<number, Scope>();
  const bindingNodes = new Set<number>();
  const scopeKinds = new Set(['function_definition', 'function_declaration', 'function_expression', 'arrow_function', 'lambda', 'lambda_expression', 'local_function_statement', 'method_declaration', 'constructor_declaration']);
  if (language !== 'python') for (const type of ['statement_block', 'compound_statement', 'block', 'for_each_statement', 'for_range_loop', 'for_statement', 'for_in_statement']) scopeKinds.add(type);
  function shape(node: Node): string {
    if (identifiers.has(node.type)) return '$reference';
    if (['binary_expression', 'binary_operator'].includes(node.type)) {
      const left = field(node, 'left'); const right = field(node, 'right');
      const op = node.children.find(child => !child.isNamed() && ['+', '*'].includes(child.text))?.text;
      if (left && right && op && numbers.has(left.type) && numbers.has(right.type)) return 'numeric:' + op + ':' + [shape(left), shape(right)].sort().join(':');
    }
    if (strings.has(node.type)) return JSON.stringify(['string', decode(node.text, language)]);
    if (numbers.has(node.type)) return node.text.replace(/_/g, '');
    return node.type + '(' + node.children.filter(child => !ignored.has(child.type)).map(child => child.isNamed() ? shape(child) : child.text).join(',') + ')';
  }
  function bind(node: Node | null, value: Node | null, scope: Scope, role = 'variable') {
    if (!node || node.type !== 'identifier' || fixedNames.has(node.text)) return;
    if (!scope.bindings.has(node.text)) {
      const key = role + ':' + (value ? shape(value) : 'parameter');
      const number = scope.counts.get(key) ?? 0;
      scope.counts.set(key, number + 1);
      scope.bindings.set(node.text, `${scope.key}:${key}:${number}`);
    }
    bindingNodes.add(node.id);
  }
  function scan(node: Node, scope: Scope) {
    if (scopeKinds.has(node.type)) {
      const role = 'scope:' + node.type;
      const index = scope.counts.get(role) ?? 0;
      scope.counts.set(role, index + 1);
      scope = { key: `${scope.key}/${role}:${index}`, parent: scope, bindings: new Map(), counts: new Map() };
    }
    scopes.set(node.id, scope);
    if (node.type === 'variable_declarator') bind(field(node, 'name') ?? node.namedChildren.find(child => child.type === 'identifier') ?? null, field(node, 'value') ?? node.namedChildren.find(child => child.type === 'equals_value_clause')?.namedChildren[0] ?? null, scope);
    if (language === 'cpp' && node.type === 'declaration' && field(node, 'declarator')?.type === 'identifier') bind(field(node, 'declarator'), field(node, 'type'), scope, 'uninitialized');
    if (language === 'javascript' && node.type === 'for_in_statement' && node.children.some(child => ['let', 'const', 'var'].includes(child.text))) bind(field(node, 'left'), null, scope, 'loop');
    if (node.type === 'for_each_statement') bind(field(node, 'left'), null, scope, 'loop');
    if (node.type === 'for_range_loop') {
      const declarator = field(node, 'declarator');
      bind(declarator?.type === 'identifier' ? declarator : declarator?.descendantsOfType('identifier')[0] ?? null, null, scope, 'loop');
    }
    if (node.type === 'init_declarator') bind(field(node, 'declarator'), field(node, 'value'), scope);
    if (language === 'python' && node.type === 'assignment') bind(field(node, 'left'), field(node, 'right'), scope);
    if (['parameter', 'parameter_declaration', 'optional_parameter', 'required_parameter'].includes(node.type)) bind(field(node, 'name', 'declarator') ?? node.namedChildren.find(child => child.type === 'identifier') ?? null, null, scope, 'parameter');
    if (['parameters', 'formal_parameters'].includes(node.type)) for (const [index, child] of node.namedChildren.entries()) if (child.type === 'identifier') bind(child, null, scope, `parameter${index}`);
    // Python loop names belong to the surrounding function/module scope.
    if (language === 'python' && node.type === 'for_statement') bind(field(node, 'left'), null, scope, 'loop');
    for (const child of node.namedChildren) scan(child, scope);
  }
  scan(root, rootScope);
  function resolved(node: Node) {
    let scope: Scope | undefined = scopes.get(node.id);
    while (scope) { const binding = scope.bindings.get(node.text); if (binding) return binding; scope = scope.parent; }
    return null;
  }
  function isProperty(node: Node) {
    const parent = node.parent;
    return !!parent && ((['member_access_expression', 'member_expression', 'attribute', 'field_expression', 'qualified_identifier'].includes(parent.type) && field(parent, 'property', 'name', 'attribute', 'field')?.id === node.id) || ['pair', 'keyword_argument'].includes(parent.type) && field(parent, 'key', 'name')?.id === node.id);
  }
  function pure(node: Node): boolean {
    if (identifiers.has(node.type) || numbers.has(node.type)) return true;
    if (strings.has(node.type)) return !node.namedChildren.some(child => /interpolation|substitution/.test(child.type));
    if (['true', 'false', 'none', 'null_literal', 'null', 'true_literal', 'false_literal', 'boolean'].includes(node.type)) return true;
    if (['parenthesized_expression', 'binary_expression', 'binary_operator', 'boolean_operator', 'comparison_operator', 'unary_expression', 'unary_operator', 'list', 'array', 'initializer_list', 'object', 'dictionary', 'pair'].includes(node.type)) return node.namedChildren.every(pure);
    return false;
  }
  function declaration(node: Node): { name: string; value: Node } | null {
    if (node.type === 'global_statement' || node.type === 'expression_statement') return node.namedChildren.length === 1 ? declaration(node.namedChildren[0]) : null;
    if (['lexical_declaration', 'variable_declaration', 'local_declaration_statement', 'declaration'].includes(node.type)) {
      const declarations = node.descendantsOfType(['variable_declarator', 'init_declarator']);
      if (declarations.length === 1) return declaration(declarations[0]);
    }
    if (['variable_declarator', 'init_declarator', 'assignment'].includes(node.type)) {
      const name = field(node, 'name', 'declarator', 'left') ?? node.namedChildren.find(child => child.type === 'identifier');
      const value = field(node, 'value', 'right') ?? node.namedChildren.find(child => child.type === 'equals_value_clause')?.namedChildren[0];
      if (name?.type === 'identifier' && value && bindingNodes.has(name.id) && pure(value)) return { name: name.text, value };
    }
    return null;
  }
  function orderDeclarations(children: Node[]) {
    const result = [...children];
    let start = 0;
    while (start < result.length) {
      if (!declaration(result[start])) { start++; continue; }
      let end = start + 1;
      while (end < result.length && declaration(result[end])) end++;
      const run = result.slice(start, end);
      const names = run.map(node => declaration(node)!.name);
      // Never reorder reads of a variable written in this run, or mutations.
      const safe = new Set(names).size === names.length && run.every(node => !declaration(node)!.value.descendantsOfType('identifier').some(ref => names.includes(ref.text)));
      if (safe) result.splice(start, run.length, ...run.sort((a, b) => JSON.stringify(convert(a)).localeCompare(JSON.stringify(convert(b)))));
      start = end;
    }
    return result;
  }
  function stringParts(node: Node): Form[] | null {
    if (['call', 'call_expression'].includes(node.type) && ['str', 'String'].includes(field(node, 'function')?.text ?? '')) {
      const args = field(node, 'arguments');
      if (args?.namedChildren.length === 1) return [['value', convert(args.namedChildren[0])]];
    }
    if (strings.has(node.type) && !node.namedChildren.some(child => /interpolation/.test(child.type))) return [['text', decode(node.text, language)]];
    if (node.type === 'template_string' || node.type === 'interpolated_string_expression' || node.type === 'string' && node.namedChildren.some(child => child.type === 'interpolation')) {
      const result: Form[] = []; let cursor = node.startIndex;
      const text = node.text;
      const opening = text.match(/^[fFrRuUbB$@]*("""|'''|"|'|`)/)?.[0] ?? '';
      const closing = opening.match(/("""|'''|"|'|`)$/)?.[0] ?? '';
      cursor += opening.length;
      for (const child of node.namedChildren.filter(child => /interpolation|template_substitution/.test(child.type))) {
        const raw = root.text.slice(cursor - root.startIndex, child.startIndex - root.startIndex);
        if (raw) result.push(['text', decode('"' + raw + '"', language)]);
        const expression = field(child, 'expression') ?? child.namedChildren[0];
        if (!expression) return null;
        const extras = child.namedChildren.filter(part => part.id !== expression.id);
        result.push(extras.length ? ['formatted-value', convert(expression), ...extras.map(convert)] : ['value', convert(expression)]); cursor = child.endIndex;
      }
      const raw = text.slice(cursor - node.startIndex, text.length - closing.length);
      if (raw) result.push(['text', decode('"' + raw + '"', language)]);
      return result;
    }
    const operator = field(node, 'operator')?.text ?? node.children.find(child => !child.isNamed() && child.text === '+')?.text;
    if (['binary_expression', 'binary_operator'].includes(node.type) && operator === '+') {
      const left = field(node, 'left'); const right = field(node, 'right');
      if (!left || !right) return null;
      const l = stringParts(left); const r = stringParts(right);
      // Numeric addition must not be mistaken for interpolation. A literal
      // string on either side establishes string concatenation in JS/C#.
      if (!l && !r) return null;
      const textContext = language !== 'python' || !!l && !!r || [left, right].filter(item => !stringParts(item)).every(item => item.type === 'identifier' && /string/.test(resolved(item) ?? ''));
      if (!textContext) return null;
      return [...(l ?? [['value', convert(left)]]), ...(r ?? [['value', convert(right)]])];
    }
    return null;
  }
  function compactParts(parts: Form[]): Form[] {
    const result: Form[] = [];
    for (const part of parts) {
      if (Array.isArray(part) && part[0] === 'text' && part[1] === '') continue;
      const previous = result.at(-1);
      if (Array.isArray(part) && part[0] === 'text' && Array.isArray(previous) && previous[0] === 'text') previous[1] = String(previous[1]) + String(part[1]);
      else result.push(part);
    }
    return result;
  }
  function safeOutput(node: Node): boolean {
    if (node.type === 'global_statement' || node.type === 'expression_statement') return node.namedChildren.length === 1 && safeOutput(node.namedChildren[0]);
    if (['call', 'call_expression', 'invocation_expression'].includes(node.type)) {
      const name = field(node, 'function')?.text;
      if (!['print', 'console.log', 'Console.WriteLine'].includes(name ?? '')) return false;
      const args = field(node, 'arguments');
      return !!args && args.descendantsOfType(['call', 'call_expression', 'invocation_expression', 'assignment_expression', 'update_expression']).length === 0;
    }
    return language === 'cpp' && node.type === 'binary_expression' && node.text.startsWith('std::cout') && node.descendantsOfType(['call_expression', 'assignment_expression', 'update_expression']).length === 0;
  }
  function convert(node: Node): Form {
    if (language === 'javascript') {
      const arrow = node.type === 'lexical_declaration' && node.namedChildren.length === 1 ? field(node.namedChildren[0], 'value') : null;
      if (node.type === 'function_declaration' || arrow?.type === 'arrow_function') {
        const fn = arrow ?? node;
        const name = arrow ? field(node.namedChildren[0], 'name') : field(node, 'name');
        const params = field(fn, 'parameters', 'parameter');
        const body = field(fn, 'body');
        if (name && params && body) return ['function', name.text, params.type === 'identifier' ? ['formal_parameters', '(', convert(params), ')'] : convert(params), body.type === 'statement_block' ? convert(body) : ['statement_block', '{', ['return_statement', 'return', convert(body)], '}']];
      }
    }
    const binary = ['binary_expression', 'binary_operator', 'boolean_operator', 'comparison_operator'].includes(node.type);
    if (binary) {
      const left = field(node, 'left') ?? node.namedChildren[0];
      const right = field(node, 'right') ?? node.namedChildren.at(-1);
      const op = field(node, 'operator')?.text ?? node.children.find(child => !child.isNamed() && ['&&', '||', 'and', 'or', '>=', '<=', '<', '>', '+', '*'].includes(child.text))?.text;
      if (left && right && op && pure(left) && pure(right)) {
        if (['&&', '||', 'and', 'or'].includes(op) || ['+', '*'].includes(op) && numbers.has(left.type) && numbers.has(right.type)) return ['binary', op, ...[convert(left), convert(right)].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))];
        if (['>=', '<=', '>', '<'].includes(op)) {
          const l = convert(left); const r = convert(right);
          const swap = JSON.stringify(l) > JSON.stringify(r);
          const flipped: Record<string, string> = { '>=': '<=', '<=': '>=', '>': '<', '<': '>' };
          return ['comparison', swap ? flipped[op] : op, swap ? r : l, swap ? l : r];
        }
      }
    }

    if (ignored.has(node.type)) return [];
    if (language === 'javascript' && ['let', 'const'].includes(node.text) && lesson.title !== 'Use changeable and fixed values') return 'binding-kind';
    if (language === 'csharp' && ['implicit_type', 'predefined_type'].includes(node.type) && node.parent?.type === 'variable_declaration') {
      const value = node.parent.descendantsOfType('equals_value_clause')[0]?.namedChildren[0];
      if (value && (strings.has(value.type) || numbers.has(value.type))) {
        const inferred = strings.has(value.type) ? 'string' : /^\d+$/.test(value.text) ? 'int' : 'double';
        if (node.text === 'var' || node.text === inferred) return ['inferred-type', inferred];
      }
    }
    if (node.type === 'parenthesized_expression' && node.namedChildren.length === 1) return convert(node.namedChildren[0]);
    if (identifiers.has(node.type)) return ['identifier', !isProperty(node) && resolved(node) || node.text];
    if (numbers.has(node.type)) return ['number', node.text.replace(/_/g, '')];
    const parts = stringParts(node);
    if (parts) return ['string-value', ...compactParts(parts)];
    if (language === 'html') {
      if (node.type === 'doctype') return ['doctype', node.text.toLowerCase().replace(/\s+/g, ' ').trim()];
      if (['tag_name', 'attribute_name'].includes(node.type)) return [node.type, node.text.toLowerCase()];
      if (node.type === 'text') return ['text', node.text.replace(/\s+/g, ' ').trim()];
      if (node.type === 'attribute') {
        const name = node.namedChildren.find(child => child.type === 'attribute_name')?.text.toLowerCase() ?? '';
        const value = node.descendantsOfType('attribute_value')[0]?.text ?? '';
        return ['attribute', name, /^(controls|autoplay|loop|muted|disabled|checked|required)$/.test(name) ? 'present' : value];
      }
    }
    if (language === 'css') {
      if (['plain_value', 'color_value', 'integer_value', 'float_value'].includes(node.type)) {
        const text = node.text.toLowerCase();
        const colours: Record<string, string> = { red: '#ff0000', blue: '#0000ff', lightblue: '#add8e6', tomato: '#ff6347', black: '#000000', white: '#ffffff' };
        if (colours[text]) return ['css-value', colours[text]];
        if (/^#[0-9a-f]{3}$/.test(text)) return ['css-value', '#' + text.slice(1).split('').map(char => char + char).join('')];
        if (/^#[0-9a-f]{6}$/.test(text)) return ['css-value', text];
      }
    }
    if (node.children.length === 0) return [node.type, node.text];
    let children = node.children.filter(child => !ignored.has(child.type) && !(child.text === ';' && ['javascript', 'css'].includes(language)));
    if (['program', 'module', 'compilation_unit', 'translation_unit', 'block', 'statement_block', 'compound_statement'].includes(node.type)) children = orderDeclarations(children);
    if (lesson.title === 'Choose a text colour') {
      // This exercise permits either print order. Only contiguous side-effect
      // free output calls are reordered; assignments remain in place.
      for (let start = 0; start < children.length; start++) {
        if (!safeOutput(children[start])) continue;
        let end = start + 1;
        while (end < children.length && safeOutput(children[end])) end++;
        const sorted = children.slice(start, end).sort((a, b) => JSON.stringify(convert(a)).localeCompare(JSON.stringify(convert(b))));
        children.splice(start, sorted.length, ...sorted); start = end - 1;
      }
    }
    let forms = children.map(child => child.isNamed() ? convert(child) : language === 'javascript' && ['let', 'const'].includes(child.text) && lesson.title !== 'Use changeable and fixed values' ? 'binding-kind' : child.text);
    if (language === 'html' && ['start_tag', 'self_closing_tag'].includes(node.type)) {
      const attributes = children.filter(child => child.type === 'attribute').map(convert).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      forms = ['<', ...children.filter(child => child.type === 'tag_name').map(convert), ...attributes, '>'];
      return ['start_tag', ...forms];
    }
    if (language === 'css' && node.type === 'block') {
      const declarations = children.filter(child => child.type === 'declaration');
      const names = declarations.map(child => child.namedChildren.find(part => part.type === 'property_name')?.text);
      if (new Set(names).size === names.length) forms = ['{', ...declarations.map(convert).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), '}'];
    }
    // Imports/includes with no runtime side effects may be arranged freely.
    if (node.type === 'translation_unit') {
      const includes = children.filter(child => child.type === 'preproc_include').map(convert).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      forms = [...includes, ...children.filter(child => child.type !== 'preproc_include').map(convert)];
    }
    return [node.type, ...forms];
  }
  return convert(root);
}

// Typing practice accepts different letter case without changing the lesson example.
// Keep token boundaries, quoted spaces, punctuation and Python indentation intact.
function typingTokens(code: string, language: CourseLanguage): string {
  const comments = language === 'python' ? '#[^\\n]*' : language === 'html' ? '<!--[\\s\\S]*?-->' : '//[^\\n]*|/\\*[\\s\\S]*?\\*/';
  const pattern = new RegExp(`("""[\\s\\S]*?"""|\\'\\'\\'[\\s\\S]*?\\'\\'\\'|@?"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\x60(?:\\\\.|[^\\x60\\\\])*\\x60)|(${comments})|([A-Za-z_$][\\w$]*|[0-9]+(?:\\.[0-9]+)?|[^\\s])`, 'g');
  const tokens: string[] = [];
  const indentation: string[] = [];
  let lastRow = -1;
  for (const match of code.matchAll(pattern)) {
    if (match[2]) continue;
    if (language === 'python') {
      const before = code.slice(0, match.index);
      const row = before.split('\n').length;
      if (row !== lastRow) {
        const line = code.slice(before.lastIndexOf('\n') + 1);
        indentation.push(line.match(/^[ \t]*/)?.[0] ?? '');
        lastRow = row;
      }
    }
    tokens.push(match[0].toLowerCase());
  }
  return JSON.stringify([tokens, indentation]);
}

export function compareLesson(parser: Parser, code: string, lesson: Exercise, language: CourseLanguage): CheckResult {
  const result = compareStrictLesson(parser, code, lesson, language);
  if (result.accepted || code.length > 50000) return result;
  if (typingTokens(code, language) !== typingTokens(lesson.answer, language)) return result;
  const example = compareStrictLesson(parser, lesson.answer, lesson, language);
  return example.accepted ? { ...example, message: 'Capital letters are optional in typing practice.' } : result;
}

function compareStrictLesson(parser: Parser, code: string, lesson: Exercise, language: CourseLanguage): CheckResult {
  if (code.length > 50000) return { accepted: false, kind: 'unverified', message: 'Keep this exercise under 50,000 characters.' };
  const actual = parser.parse(code); const expected = parser.parse(lesson.answer);
  try {
    if (actual.rootNode.hasError()) {
      const problem = actual.rootNode.descendantsOfType('ERROR')[0];
      return { accepted: false, kind: 'syntax', message: `Check the syntax${problem ? ` near line ${problem.startPosition.row + 1}` : ''}. Look for missing punctuation or an incomplete block.` };
    }
    if (language === 'python' && lesson.title === 'Choose a text colour') {
      const result = checkPythonColours(code);
      return { ...result, kind: result.accepted ? 'accepted' : 'unverified' };
    }
    const accepted = JSON.stringify(canonical(actual.rootNode, language, lesson)) === JSON.stringify(canonical(expected.rootNode, language, lesson));
    return { accepted, kind: accepted ? 'accepted' : 'unverified', message: accepted ? '' : 'Couldn’t verify this version. Check the lesson’s required values and actions. A different solution can be valid even when this checker cannot recognise it.' };
  } finally { actual.delete(); expected.delete(); }
}
