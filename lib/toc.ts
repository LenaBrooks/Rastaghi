export type TocItem = { id: string; text: string; level: number };

/** Inject ids into h2/h3 and return TOC items. */
export function enhanceHtmlWithToc(html: string): {
  html: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  let i = 0;

  const enhanced = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = `toc-${++i}`;
      toc.push({ id, text, level: Number(level) });
      return `<h${level} id="${id}"><a href="#${id}">${inner}</a></h${level}>`;
    },
  );

  if (toc.length < 2) {
    return { html, toc: [] };
  }

  const list = toc
    .map(
      (item) =>
        `<li class="toc-level-${item.level}"><a href="#${item.id}">${item.text}</a></li>`,
    )
    .join("");

  const tocHtml = `<nav class="toc" aria-label="فهرست"><h2>فهرست</h2><ol>${list}</ol></nav>`;

  return { html: tocHtml + enhanced, toc };
}
