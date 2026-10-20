import { hasDatabaseUrl, sql } from "@/lib/db";
import { slugifyTitle } from "@/lib/posts/slug";

/** How category posts appear in the homepage section. */
export type HomeItemMode = "title" | "body";

export type Category = {
  id: number;
  name: string;
  slug: string;
  showOnHome: boolean;
  homeItemMode: HomeItemMode;
};

function requireDb(): boolean {
  return hasDatabaseUrl();
}

function resolveHomeItemMode(value: string | null | undefined): HomeItemMode {
  return value === "body" ? "body" : "title";
}

function mapCategory(row: {
  id: number | string;
  name: string;
  slug: string;
  show_on_home?: boolean | null;
  home_item_mode?: string | null;
}): Category {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    showOnHome: row.show_on_home === true,
    homeItemMode: resolveHomeItemMode(row.home_item_mode),
  };
}

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  show_on_home: boolean | null;
  home_item_mode: string | null;
};

export async function getCategories(): Promise<Category[]> {
  if (!requireDb()) return [];
  const rows = (await sql()`
    SELECT id, name, slug, show_on_home, home_item_mode
    FROM categories
    ORDER BY name ASC
  `) as CategoryRow[];
  return rows.map(mapCategory);
}

/** Categories flagged to appear as sections on the homepage. */
export async function getHomeCategories(): Promise<Category[]> {
  if (!requireDb()) return [];
  const rows = (await sql()`
    SELECT id, name, slug, show_on_home, home_item_mode
    FROM categories
    WHERE show_on_home = TRUE
    ORDER BY name ASC
  `) as CategoryRow[];
  return rows.map(mapCategory);
}

export async function createCategory(
  name: string,
  showOnHome = false,
  homeItemMode: HomeItemMode = "title",
): Promise<Category> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("نام دسته‌بندی خالی است.");
  const slug = slugifyTitle(trimmed);
  const mode = resolveHomeItemMode(homeItemMode);
  const rows = (await sql()`
    INSERT INTO categories (name, slug, show_on_home, home_item_mode)
    VALUES (${trimmed}, ${slug}, ${showOnHome}, ${mode})
    ON CONFLICT (name) DO UPDATE SET
      name = EXCLUDED.name,
      show_on_home = EXCLUDED.show_on_home,
      home_item_mode = EXCLUDED.home_item_mode
    RETURNING id, name, slug, show_on_home, home_item_mode
  `) as CategoryRow[];
  return mapCategory(rows[0]!);
}

export async function updateCategory(
  id: number,
  name: string,
  showOnHome = false,
  homeItemMode: HomeItemMode = "title",
): Promise<Category> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("نام دسته‌بندی خالی است.");
  if (!Number.isFinite(id)) throw new Error("دسته نامعتبر است.");

  const current = (await sql()`
    SELECT id, name, slug, show_on_home, home_item_mode
    FROM categories WHERE id = ${id} LIMIT 1
  `) as CategoryRow[];
  if (!current[0]) throw new Error("دسته پیدا نشد.");

  const oldName = current[0].name;
  const slug = slugifyTitle(trimmed);
  const mode = resolveHomeItemMode(homeItemMode);

  const clash = (await sql()`
    SELECT id FROM categories
    WHERE (name = ${trimmed} OR slug = ${slug}) AND id <> ${id}
    LIMIT 1
  `) as { id: number }[];
  if (clash[0]) throw new Error("نام یا اسلاگ تکراری است.");

  const rows = (await sql()`
    UPDATE categories
    SET name = ${trimmed},
        slug = ${slug},
        show_on_home = ${showOnHome},
        home_item_mode = ${mode}
    WHERE id = ${id}
    RETURNING id, name, slug, show_on_home, home_item_mode
  `) as CategoryRow[];

  if (oldName !== trimmed) {
    await sql()`
      UPDATE posts
      SET categories = array_replace(categories, ${oldName}, ${trimmed}),
          updated_at = NOW()
      WHERE ${oldName} = ANY (categories)
    `;
  }

  return mapCategory(rows[0]!);
}

export async function deleteCategory(id: number): Promise<void> {
  const rows = (await sql()`
    SELECT name FROM categories WHERE id = ${id} LIMIT 1
  `) as { name: string }[];
  const name = rows[0]?.name;
  await sql()`DELETE FROM categories WHERE id = ${id}`;
  if (name) {
    await sql()`
      UPDATE posts
      SET categories = array_remove(categories, ${name}),
          updated_at = NOW()
      WHERE ${name} = ANY (categories)
    `;
  }
}
