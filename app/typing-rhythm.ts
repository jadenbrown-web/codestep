export const CODE_TYPING_START_DELAY = 180;

export function codeTypingDelay(character: string, position: number) {
  return character === "\n" ? 24 : /[.,;{}]/.test(character) ? 11 : 5 + (position % 3) * 2;
}
