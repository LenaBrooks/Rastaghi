import { marked } from "marked";

/**
 * Markdown collapses extra blank lines. Turn 3+ consecutive newlines into
 * visible vertical spacers so authors can add space with Enter.
 *
 * `\n\n`     → normal paragraph break (unchanged)
 * `\n\n\n`   → paragraph break + 1 spacer unit
 * `\n\n\n\n` → paragraph break + 2 spacer units
 */
export function preserveVerticalSpace(source: string): string {
  return source.replace(/\n{3,}/g, (match) => {
    const extra = match.length - 2;
    const spacers = Array.from(
      { length: extra },
      () => '<div class="md-vspace" aria-hidden="true"></div>',
    ).join("\n");
    return `\n\n${spacers}\n\n`;
  });
}

export function renderMarkdown(source: string): string {
  const prepared = preserveVerticalSpace(source);
  return marked.parse(prepared, {
    async: false,
    breaks: true,
    gfm: true,
  }) as string;
}
