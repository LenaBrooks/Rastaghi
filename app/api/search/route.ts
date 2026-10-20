import { NextResponse } from "next/server";
import { hasDatabaseUrl, sql } from "@/lib/db";

export const runtime = "nodejs";

type SearchRow = {
  slug: string;
  title: string;
  excerpt: string | null;
};

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] as SearchRow[] });
  }
  if (q.length > 80) {
    return NextResponse.json({ error: "query too long" }, { status: 400 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ results: [] as SearchRow[] });
  }

  const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;

  try {
    const rows = (await sql()`
      SELECT slug, title, excerpt
      FROM posts
      WHERE published = TRUE
        AND (
          title ILIKE ${pattern} ESCAPE '\'
          OR COALESCE(excerpt, '') ILIKE ${pattern} ESCAPE '\'
          OR EXISTS (
            SELECT 1 FROM unnest(tags) AS t(tag)
            WHERE t.tag ILIKE ${pattern} ESCAPE '\'
          )
        )
      ORDER BY date DESC, slug ASC
      LIMIT 8
    `) as SearchRow[];

    return NextResponse.json({
      results: rows.map((r) => ({
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
      })),
    });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ error: "search failed" }, { status: 500 });
  }
}
