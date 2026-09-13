// Keep delimiter-only lines attached to the code they belong to.
export function splitCodeBlocks(code: string): string[] {
  const blocks: string[] = [];
  for (const line of code.split("\n")) {
    if (!line.trim()) continue;
    if (/^[{}()[\];,]+$/.test(line.trim()) && blocks.length) blocks[blocks.length - 1] += "\n" + line;
    else blocks.push(line);
  }
  return blocks;
}

const blockKey = (block: string) => block.split("\n").map(line => line.trim()).join("\n");

export function availableCodeBlocks(answer: string, code: string) {
  const used = new Map<string, number>();
  for (const block of splitCodeBlocks(code)) {
    const key = blockKey(block);
    used.set(key, (used.get(key) ?? 0) + 1);
  }
  return splitCodeBlocks(answer).map((text, id) => ({ text, id })).filter(({ text }) => {
    const key = blockKey(text);
    const count = used.get(key) ?? 0;
    if (!count) return true;
    used.set(key, count - 1);
    return false;
  }).sort((a, b) => a.text.trim().localeCompare(b.text.trim()) || a.id - b.id);
}
