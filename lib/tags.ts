import { hasDatabaseUrl, sql } from "@/lib/db";
import { slugifyTitle } from "@/lib/posts/slug";

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type TagWithCount = Tag & { count: number };

/** Strip leading # so storage stays bare. */
export function normalizeTagName(raw: string): string {
  return raw.trim().replace(/^#+/u, "").trim();
}

/** User-facing label: #نام */
export function formatTagLabel(name: string): string {
  const n = normalizeTagName(name);
  return n ? `#${n}` : "";
}

function requireDb(): boolean {
  return hasDatabaseUrl();
}

function mapTag(row: {
  id: number | string;
  name: string;
  slug: string;
}): Tag {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
  };
}

type TagRow = { id: number; name: string; slug: string };

export async function getTags(): Promise<Tag[]> {
  if (!requireDb()) return [];
  const rows = (await sql()`
    SELECT id, name, slug FROM tags ORDER BY name ASC
  `) as TagRow[];
  return rows.map(mapTag);
}

/** Tags with how many published+draft posts use them. */
export async function getTagsWithCounts(): Promise<TagWithCount[]> {
  if (!requireDb()) return [];
  const rows = (await sql()`
    SELECT
      t.id,
      t.name,
      t.slug,
      COALESCE((
        SELECT COUNT(*)::int
        FROM posts p
        WHERE t.name = ANY (p.tags)
      ), 0) AS count
    FROM tags t
    ORDER BY t.name ASC
  `) as (TagRow & { count: number })[];
  return rows.map((row) => ({ ...mapTag(row), count: Number(row.count) || 0 }));
}

/** Pull distinct tags from posts into the managed table. */
export async function syncTagsFromPosts(): Promise<void> {
  if (!requireDb()) return;
  const rows = (await sql()`
    SELECT DISTINCT trim(unnest(tags)) AS name
    FROM posts
    WHERE cardinality(tags) > 0
  `) as { name: string }[];

  for (const row of rows) {
    const name = normalizeTagName(row.name ?? "");
    if (!name) continue;
    const slug = slugifyTitle(name);
    await sql()`
      INSERT INTO tags (name, slug)
      VALUES (${name}, ${slug})
      ON CONFLICT (name) DO NOTHING
    `;
  }
}

/** Ensure these tag names exist (used when saving a post). */
export async function ensureTagsExist(names: string[]): Promise<void> {
  if (!requireDb()) return;
  for (const raw of names) {
    const name = normalizeTagName(raw);
    if (!name) continue;
    const slug = slugifyTitle(name);
    await sql()`
      INSERT INTO tags (name, slug)
      VALUES (${name}, ${slug})
      ON CONFLICT (name) DO NOTHING
    `;
  }
}

export async function createTag(name: string): Promise<Tag> {
  const trimmed = normalizeTagName(name);
  if (!trimmed) throw new Error("نام برچسب خالی است.");
  const slug = slugifyTitle(trimmed);
  const rows = (await sql()`
    INSERT INTO tags (name, slug)
    VALUES (${trimmed}, ${slug})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name, slug
  `) as TagRow[];
  return mapTag(rows[0]!);
}

export async function updateTag(id: number, name: string): Promise<Tag> {
  const trimmed = normalizeTagName(name);
  if (!trimmed) throw new Error("نام برچسب خالی است.");
  if (!Number.isFinite(id)) throw new Error("برچسب نامعتبر است.");

  const current = (await sql()`
    SELECT id, name, slug FROM tags WHERE id = ${id} LIMIT 1
  `) as TagRow[];
  if (!current[0]) throw new Error("برچسب پیدا نشد.");

  const oldName = current[0].name;
  const slug = slugifyTitle(trimmed);

  const clash = (await sql()`
    SELECT id FROM tags
    WHERE (name = ${trimmed} OR slug = ${slug}) AND id <> ${id}
    LIMIT 1
  `) as { id: number }[];
  if (clash[0]) throw new Error("نام یا اسلاگ تکراری است.");

  const rows = (await sql()`
    UPDATE tags
    SET name = ${trimmed}, slug = ${slug}
    WHERE id = ${id}
    RETURNING id, name, slug
  `) as TagRow[];

  if (oldName !== trimmed) {
    await sql()`
      UPDATE posts
      SET tags = array_replace(tags, ${oldName}, ${trimmed}),
          updated_at = NOW()
      WHERE ${oldName} = ANY (tags)
    `;
  }

  return mapTag(rows[0]!);
}

export async function deleteTag(id: number): Promise<void> {
  const rows = (await sql()`
    SELECT name FROM tags WHERE id = ${id} LIMIT 1
  `) as { name: string }[];
  const name = rows[0]?.name;
  await sql()`DELETE FROM tags WHERE id = ${id}`;
  if (name) {
    await sql()`
      UPDATE posts
      SET tags = array_remove(tags, ${name}),
          updated_at = NOW()
      WHERE ${name} = ANY (tags)
    `;
  }
}
