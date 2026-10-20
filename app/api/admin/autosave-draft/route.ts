import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getPostBySlug,
  getPostSlugs,
  insertPost,
  nextNumericSlug,
  slugifyTitle,
  uniqueSlug,
  updatePost,
} from "@/lib/posts";

export const runtime = "nodejs";

type AutosaveBody = {
  title?: string;
  slug?: string;
  body?: string;
  date?: string;
  tags?: string[];
  category?: string;
  /** Existing draft/post slug to update (new posts after first autosave). */
  originalSlug?: string;
  /** When editing a published post, keep publish state. */
  keepPublished?: boolean;
  featured?: boolean;
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: AutosaveBody;
  try {
    data = (await request.json()) as AutosaveBody;
  } catch {
    return NextResponse.json({ error: "نامعتبر" }, { status: 400 });
  }

  const titleRaw = String(data.title ?? "").trim();
  const bodyRaw = String(data.body ?? "");
  if (!titleRaw && !bodyRaw.trim()) {
    return NextResponse.json({ skipped: true });
  }

  const title = titleRaw || "پیش‌نویس بدون عنوان";
  const body = bodyRaw.trim() ? bodyRaw : "";
  const tags = Array.isArray(data.tags)
    ? data.tags.map(String).map((t) => t.trim()).filter(Boolean)
    : [];
  const category = String(data.category ?? "").trim();
  const categories = category ? [category] : [];
  let date = String(data.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(date)) {
    const now = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    date = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`;
  }

  const originalSlug = String(data.originalSlug ?? "").trim();
  const taken = await getPostSlugs();

  let slug = String(data.slug ?? "").trim();
  const exclude = originalSlug || undefined;
  if (!slug) {
    slug = nextNumericSlug(taken, exclude);
  } else {
    const base = slugifyTitle(slug.replace(/_/g, "-"));
    slug = uniqueSlug(base || nextNumericSlug(taken, exclude), taken, exclude);
  }

  let published = false;
  let featured = data.featured === true;
  if (originalSlug) {
    const existing = await getPostBySlug(originalSlug, { includeDrafts: true });
    if (existing) {
      if (data.keepPublished) published = existing.published;
      if (data.featured === undefined) featured = existing.featured;
    }
  }

  const payload = {
    slug,
    title,
    date,
    tags,
    categories,
    body,
    published,
    featured,
  };

  try {
    if (originalSlug) {
      const existing = await getPostBySlug(originalSlug, {
        includeDrafts: true,
      });
      if (existing) {
        await updatePost(originalSlug, payload);
        revalidatePath("/admin");
        return NextResponse.json({ slug: payload.slug, updated: true });
      }
    }
    await insertPost(payload);
    revalidatePath("/admin");
    return NextResponse.json({ slug: payload.slug, created: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "autosave failed" }, { status: 500 });
  }
}
