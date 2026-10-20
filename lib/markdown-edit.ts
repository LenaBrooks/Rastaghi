export type TextSelection = {
  value: string;
  start: number;
  end: number;
};

export type EditResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

function selected(text: TextSelection): string {
  return text.value.slice(text.start, text.end);
}

/** Wrap selection (or placeholder) with before/after markers. */
export function wrapSelection(
  text: TextSelection,
  before: string,
  after: string,
  placeholder = "متن",
): EditResult {
  const sel = selected(text);
  const inner = sel || placeholder;
  const next = text.value.slice(0, text.start) + before + inner + after + text.value.slice(text.end);
  const selectionStart = text.start + before.length;
  const selectionEnd = selectionStart + inner.length;
  return { value: next, selectionStart, selectionEnd };
}

/** Prefix each selected line (or current line) with a marker. */
export function prefixLines(
  text: TextSelection,
  prefix: string,
): EditResult {
  const { value, start, end } = text;
  let lineStart = start;
  while (lineStart > 0 && value[lineStart - 1] !== "\n") lineStart -= 1;
  let lineEnd = end;
  while (lineEnd < value.length && value[lineEnd] !== "\n") lineEnd += 1;

  const block = value.slice(lineStart, lineEnd);
  const lines = block.length ? block.split("\n") : [""];
  const nextBlock = lines
    .map((line) => {
      if (line.startsWith(prefix)) return line;
      return prefix + line;
    })
    .join("\n");

  const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
  return {
    value: next,
    selectionStart: lineStart,
    selectionEnd: lineStart + nextBlock.length,
  };
}

/** Insert a block snippet, preferring blank lines around it. */
export function insertBlock(
  text: TextSelection,
  block: string,
): EditResult {
  const { value, start, end } = text;
  const beforeChar = start > 0 ? value[start - 1] : "\n";
  const afterChar = end < value.length ? value[end] : "\n";
  const lead = beforeChar === "\n" ? "\n" : "\n\n";
  const trail = afterChar === "\n" ? "\n" : "\n\n";
  const snippet = `${lead}${block.trim()}${trail}`;
  const next = value.slice(0, start) + snippet + value.slice(end);
  const cursor = start + snippet.length;
  return { value: next, selectionStart: cursor, selectionEnd: cursor };
}

export function insertInline(
  text: TextSelection,
  snippet: string,
  selectOffset = 0,
  selectLength = 0,
): EditResult {
  const next = text.value.slice(0, text.start) + snippet + text.value.slice(text.end);
  const selectionStart = text.start + selectOffset;
  const selectionEnd = selectionStart + selectLength;
  return { value: next, selectionStart, selectionEnd };
}
