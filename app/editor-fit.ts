/** Fit wrapped source into the available editor without changing its contents. */
export function fitEditorCode(text: string, width: number, height: number) {
  const lines = text.replace(/\t/g, '    ').split('\n');
  for (let fontSize = 13; fontSize >= 9; fontSize -= .25) {
    const lineHeight = Math.round(fontSize * 1.4 * 100) / 100;
    const columns = Math.max(1, Math.floor(Math.max(1, width - 32) / (fontSize * .62)));
    const rows = Math.max(8, lines.reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / columns)), 0));
    if (rows * lineHeight + 12 <= height || fontSize === 9) return { fontSize, lineHeight, requiredHeight: rows * lineHeight + 12 };
  }
  return { fontSize: 9, lineHeight: 12.6, requiredHeight: 112.8 };
}
