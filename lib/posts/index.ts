import { hasDatabaseUrl, sql } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import type { Post, PostSummary, Project } from "./types";

export type { Post, PostSummary, Project } from "./types";

function requireDbOrEmpty(): boolean {
  if (hasDatabaseUrl()) return true;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[posts] DATABASE_URL is missing — returning empty data. Set .env.local then run db:migrate && db:seed.",
    );
  }
  return false;
}

type PostRow = {
  slug: string;
  title: string;
  date: string | Date;
  tags: string[] | null;
  categories: string[] | null;
  excerpt: string | null;
  body: string;
  published?: boolean | null;
  featured?: boolean | null;
};

type PostSummaryRow = {
  slug: string;
  title: string;
  date: string | Date;
  tags: string[] | null;
  categories: string[] | null;
  excerpt: string | null;
  body?: string | null;
  published?: boolean | null;
  featured?: boolean | null;
};

type PostQueryOptions = {
  /** When true, include drafts (admin). Public callers omit this. */
  includeDrafts?: boolean;
};

type PostSummaryQueryOptions = PostQueryOptions & {
  /** Include raw markdown body (no HTML render). For admin counts / home body mode. */
  includeBody?: boolean;
};

type ProjectRow = {
  slug: string;
  title: string;
  date: string | Date;
  description: string;
  language: string | null;
  website: string | null;
  repo: string | null;
};

function slugifyTag(tag: string): string {
  return encodeURIComponent(tag.trim());
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Wall-clock `YYYY-MM-DDTHH:mm` (no TZ shift).
 * Posts store author-picked local clock as TIMESTAMPTZ +00:00; Neon may return
 * a Date or `...Z` string — never use local getHours() (Iran +03:30 would turn
 * 03:08 into 06:38).
 */
function formatDate(value: string | Date): string {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return `${value}T12:00`;
    }
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
    );
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatDateFromUtcParts(parsed);
    }
    return value;
  }
  return formatDateFromUtcParts(value);
}

function formatDateFromUtcParts(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/** Persist wall clock without session-TZ reinterpretation. */
function toDbDate(wall: string): string {
  const match = wall.trim().match(
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return wall;
  const day = match[1]!;
  const h = match[2] ?? "12";
  const min = match[3] ?? "00";
  const sec = match[4] ?? "00";
  return `${day}T${h}:${min}:${sec}+00:00`;
}

function mapPost(row: PostRow): Post {
  const body = row.body ?? "";
  const html = renderMarkdown(body);
  return {
    slug: row.slug,
    title: row.title,
    date: formatDate(row.date),
    tags: row.tags ?? [],
    categories: row.categories ?? [],
    excerpt: row.excerpt ?? undefined,
    body,
    html,
    published: row.published !== false,
    featured: row.featured === true,
  };
}

function mapPostSummary(row: PostSummaryRow): PostSummary {
  const summary: PostSummary = {
    slug: row.slug,
    title: row.title,
    date: formatDate(row.date),
    tags: row.tags ?? [],
    categories: row.categories ?? [],
    excerpt: row.excerpt ?? undefined,
    published: row.published !== false,
    featured: row.featured === true,
  };
  if (row.body != null) summary.body = row.body;
  return summary;
}

function mapProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    date: formatDate(row.date),
    description: row.description,
    language: row.language ?? undefined,
    website: row.website ?? undefined,
    repo: row.repo ?? undefined,
  };
}

/** Full posts with rendered HTML (feed, single-post). Prefer summaries for lists. */
export async function getPosts(
  options: PostQueryOptions = {},
): Promise<Post[]> {
  if (!requireDbOrEmpty()) return [];
  const rows = options.includeDrafts
    ? ((await sql()`
        SELECT slug, title,
          to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
          tags, categories, excerpt, body, published, featured
        FROM posts
        ORDER BY date DESC, slug ASC
      `) as PostRow[])
    : ((await sql()`
        SELECT slug, title,
          to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
          tags, categories, excerpt, body, published, featured
        FROM posts
        WHERE published = TRUE
        ORDER BY date DESC, slug ASC
      `) as PostRow[]);
  return rows.map(mapPost);
}

/** List posts without markdown HTML. Optionally include raw body. */
export async function getPostSummaries(
  options: PostSummaryQueryOptions = {},
): Promise<PostSummary[]> {
  if (!requireDbOrEmpty()) return [];
  const withBody = options.includeBody === true;
  const rows = options.includeDrafts
    ? withBody
      ? ((await sql()`
          SELECT slug, title,
            to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
            tags, categories, excerpt, body, published, featured
          FROM posts
          ORDER BY date DESC, slug ASC
        `) as PostSummaryRow[])
      : ((await sql()`
          SELECT slug, title,
            to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
            tags, categories, excerpt, published, featured
          FROM posts
          ORDER BY date DESC, slug ASC
        `) as PostSummaryRow[])
    : withBody
      ? ((await sql()`
          SELECT slug, title,
            to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
            tags, categories, excerpt, body, published, featured
          FROM posts
          WHERE published = TRUE
          ORDER BY date DESC, slug ASC
        `) as PostSummaryRow[])
      : ((await sql()`
          SELECT slug, title,
            to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
            tags, categories, excerpt, published, featured
          FROM posts
          WHERE published = TRUE
          ORDER BY date DESC, slug ASC
        `) as PostSummaryRow[]);
  return rows.map(mapPostSummary);
}

/** Raw markdown bodies for specific slugs (home body-mode sections). */
export async function getPostBodiesBySlugs(
  slugs: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!requireDbOrEmpty() || slugs.length === 0) return map;
  const rows = (await sql()`
    SELECT slug, body FROM posts
    WHERE slug = ANY (${slugs}) AND published = TRUE
  `) as { slug: string; body: string }[];
  for (const row of rows) map.set(row.slug, row.body ?? "");
  return map;
}

export async function getPostBySlug(
  slug: string,
  options: PostQueryOptions = {},
): Promise<Post | null> {
  if (!requireDbOrEmpty()) return null;
  const rows = options.includeDrafts
    ? ((await sql()`
        SELECT slug, title,
          to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
          tags, categories, excerpt, body, published, featured
        FROM posts
        WHERE slug = ${slug}
        LIMIT 1
      `) as PostRow[])
    : ((await sql()`
        SELECT slug, title,
          to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
          tags, categories, excerpt, body, published, featured
        FROM posts
        WHERE slug = ${slug} AND published = TRUE
        LIMIT 1
      `) as PostRow[]);
  return rows[0] ? mapPost(rows[0]) : null;
}

export async function getAdjacentPosts(slug: string): Promise<{
  previous: PostSummary | null;
  next: PostSummary | null;
}> {
  const posts = await getPostSummaries();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return {
    next: index > 0 ? posts[index - 1] : null,
    previous: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export async function getRelatedPosts(
  post: Pick<Post, "slug" | "tags" | "categories">,
  limit = 3,
): Promise<PostSummary[]> {
  const posts = await getPostSummaries();
  const others = posts.filter((p) => p.slug !== post.slug);
  const score = (other: PostSummary) => {
    const tagHits = other.tags.filter((t) => post.tags.includes(t)).length;
    const catHits = (other.categories ?? []).filter((c) =>
      (post.categories ?? []).includes(c),
    ).length;
    return tagHits * 2 + catHits;
  };
  const related = others
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);

  if (related.length >= limit) return related.slice(0, limit);

  const seen = new Set(related.map((p) => p.slug));
  const fallback = others.filter((p) => !seen.has(p.slug));
  return [...related, ...fallback].slice(0, limit);
}

export async function getAllTags(): Promise<
  { name: string; slug: string; count: number }[]
> {
  const posts = await getPostSummaries();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugifyTag(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fa"));
}

export async function getPostsByTag(tag: string): Promise<PostSummary[]> {
  if (!requireDbOrEmpty()) return [];
  const decoded = decodeURIComponent(tag);
  const rows = (await sql()`
    SELECT slug, title,
      to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
      tags, categories, excerpt, published, featured
    FROM posts
    WHERE ${decoded} = ANY (tags) AND published = TRUE
    ORDER BY date DESC, slug ASC
  `) as PostSummaryRow[];
  return rows.map(mapPostSummary);
}

export async function getPostsByCategory(
  category: string,
): Promise<PostSummary[]> {
  if (!requireDbOrEmpty()) return [];
  const name = decodeURIComponent(category).trim();
  if (!name) return [];
  const rows = (await sql()`
    SELECT slug, title,
      to_char(date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS date,
      tags, categories, excerpt, published, featured
    FROM posts
    WHERE ${name} = ANY (categories) AND published = TRUE
    ORDER BY date DESC, slug ASC
  `) as PostSummaryRow[];
  return rows.map(mapPostSummary);
}

export async function getAllCategories(): Promise<
  { name: string; posts: PostSummary[] }[]
> {
  const posts = await getPostSummaries();
  const map = new Map<string, PostSummary[]>();
  const uncategorized: PostSummary[] = [];
  for (const post of posts) {
    if (!post.categories?.length) {
      uncategorized.push(post);
      continue;
    }
    for (const cat of post.categories) {
      const list = map.get(cat) ?? [];
      list.push(post);
      map.set(cat, list);
    }
  }
  const groups = [...map.entries()].map(([name, items]) => ({
    name,
    posts: items,
  }));
  if (uncategorized.length) {
    groups.push({ name: "بدون سرفصل", posts: uncategorized });
  }
  return groups;
}

export async function getPostsGroupedByYear(): Promise<
  { year: string; posts: PostSummary[] }[]
> {
  const posts = await getPostSummaries();
  const map = new Map<string, PostSummary[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    const list = map.get(year) ?? [];
    list.push(post);
    map.set(year, list);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([year, items]) => ({ year, posts: items }));
}

export async function getProjects(): Promise<Project[]> {
  if (!requireDbOrEmpty()) return [];
  const rows = (await sql()`
    SELECT slug, title, date, description, language, website, repo
    FROM projects
    ORDER BY date DESC, slug ASC
  `) as ProjectRow[];
  return rows.map(mapProject);
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | null> {
  if (!requireDbOrEmpty()) return null;
  const rows = (await sql()`
    SELECT slug, title, date, description, language, website, repo
    FROM projects
    WHERE slug = ${slug}
    LIMIT 1
  `) as ProjectRow[];
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function isSlugTaken(
  slug: string,
  excludeSlug?: string,
): Promise<boolean> {
  if (!requireDbOrEmpty()) return false;
  if (excludeSlug && excludeSlug === slug) return false;
  const rows = excludeSlug
    ? ((await sql()`
        SELECT 1 FROM posts
        WHERE slug = ${slug} AND slug <> ${excludeSlug}
        LIMIT 1
      `) as { "?column?": number }[])
    : ((await sql()`
        SELECT 1 FROM posts WHERE slug = ${slug} LIMIT 1
      `) as { "?column?": number }[]);
  return rows.length > 0;
}

export async function getPostSlugs(): Promise<string[]> {
  if (!requireDbOrEmpty()) return [];
  const rows = (await sql()`
    SELECT slug FROM posts ORDER BY date DESC
  `) as { slug: string }[];
  return rows.map((r) => r.slug);
}

type PostInput = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  categories?: string[];
  excerpt?: string;
  body: string;
  published?: boolean;
  featured?: boolean;
};

/** Insert a new post — fails if slug already exists. */
export async function insertPost(input: PostInput): Promise<void> {
  const published = input.published !== false;
  const featured = input.featured === true;
  const date = toDbDate(input.date);
  await sql()`
    INSERT INTO posts (slug, title, date, tags, categories, excerpt, body, published, featured)
    VALUES (
      ${input.slug},
      ${input.title},
      ${date},
      ${input.tags ?? []},
      ${input.categories ?? []},
      ${input.excerpt ?? null},
      ${input.body},
      ${published},
      ${featured}
    )
  `;
}

/** Update an existing post by its current slug (may rename slug). */
export async function updatePost(
  originalSlug: string,
  input: PostInput,
): Promise<void> {
  const published = input.published !== false;
  const featured = input.featured === true;
  const date = toDbDate(input.date);
  await sql()`
    UPDATE posts SET
      slug = ${input.slug},
      title = ${input.title},
      date = ${date},
      tags = ${input.tags ?? []},
      categories = ${input.categories ?? []},
      excerpt = ${input.excerpt ?? null},
      body = ${input.body},
      published = ${published},
      featured = ${featured},
      updated_at = NOW()
    WHERE slug = ${originalSlug}
  `;
}

export async function setPostPublished(
  slug: string,
  published: boolean,
): Promise<void> {
  await sql()`
    UPDATE posts
    SET published = ${published}, updated_at = NOW()
    WHERE slug = ${slug}
  `;
}

export async function deletePost(slug: string): Promise<void> {
  await sql()`DELETE FROM posts WHERE slug = ${slug}`;
}

export { nextNumericSlug, slugifyTitle, uniqueSlug } from "./slug";

export function tagUrl(tag: string): string {
  return `/tag/${slugifyTag(tag)}`;
}

export function postUrl(slug: string): string {
  return `/${slug}`;
}
