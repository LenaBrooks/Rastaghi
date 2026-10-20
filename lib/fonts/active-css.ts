import {
  DEFAULT_FONT_ID,
  getFontById,
  resolveFontId,
  resolveFontIds,
  type FontEntry,
} from "@/lib/fonts/catalog";

const FALLBACK = 'Tahoma, "Segoe UI", sans-serif';

function cssUrlFor(relPath: string): string {
  // Encode each path segment (handles spaces like "Samir Farsi Numerals.woff2")
  const encoded = relPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `/api/fonts/${encoded}`;
}

function fontFaceCss(font: FontEntry): string {
  // Single-face fonts: cover a weight range so bold UI (home titles)
  // uses the real file instead of ugly synthetic bold.
  const expandSingle =
    font.files.length === 1 &&
    !(font.files[0]?.weight ?? "").includes(" ");

  return font.files
    .map((file) => {
      let weight = file.weight ?? "400";
      if (expandSingle) weight = "100 900";
      const style = file.style ?? "normal";
      return [
        "@font-face {",
        `  font-family: "${font.family}";`,
        `  src: url("${cssUrlFor(file.relPath)}") format("woff2");`,
        `  font-weight: ${weight};`,
        `  font-style: ${style};`,
        "  font-display: swap;",
        "}",
      ].join("\n");
    })
    .join("\n\n");
}

function stackFor(id: string): string {
  const font = getFontById(resolveFontId(id));
  const family = font?.family ?? getFontById(DEFAULT_FONT_ID)!.family;
  return `"${family}", ${FALLBACK}`;
}

export type ActiveFontIds = {
  headerId: string;
  headingId: string;
  bodyId: string;
};

/** Minimal CSS: only @font-face for selected fonts + role CSS variables. */
export function buildActiveFontsCss(ids: ActiveFontIds): string {
  const headerId = resolveFontId(ids.headerId);
  const headingId = resolveFontId(ids.headingId);
  const bodyId = resolveFontId(ids.bodyId);

  const faces = resolveFontIds({ headerId, headingId, bodyId })
    .map(fontFaceCss)
    .join("\n\n");

  const vars = [
    ":root {",
    `  --font-header: ${stackFor(headerId)};`,
    `  --font-heading: ${stackFor(headingId)};`,
    `  --font-body: ${stackFor(bodyId)};`,
    `  --font-sans: ${stackFor(bodyId)};`,
    "}",
  ].join("\n");

  return `${faces}\n\n${vars}\n`;
}
