/** Safe to import from client components. */
export function slugifyTitle(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `post-${Date.now()}`
  );
}

/** Next free numeric slug: 1, 2, 3, … */
export function nextNumericSlug(
  taken: Iterable<string>,
  exclude?: string,
): string {
  const used = new Set(
    [...taken].map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  if (exclude) used.delete(exclude.trim().toLowerCase());

  let n = 1;
  while (used.has(String(n))) n += 1;
  return String(n);
}

/** Pick a free slug: base, then base-2, base-3, … */
export function uniqueSlug(
  base: string,
  taken: Iterable<string>,
  exclude?: string,
): string {
  const used = new Set(
    [...taken].map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  if (exclude) used.delete(exclude.trim().toLowerCase());

  const root = (base.trim() || nextNumericSlug(used)).slice(0, 76);
  if (!used.has(root)) return root;

  if (/^\d+$/.test(root)) {
    return nextNumericSlug(used);
  }

  let n = 2;
  while (used.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
