import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim();

if (!url) {
  console.error(
    "Missing DATABASE_URL. Put your Neon URI in .env.local then retry.",
  );
  process.exit(1);
}

const TEST_POSTS = [
  {
    slug: "salam-rastaghi",
    title: "سلام به رستاقی",
    date: "2026-03-18",
    tags: ["معرفی"],
    categories: ["عمومی"],
    excerpt: "اولین نوشته برای راه‌اندازی بلاگ.",
    body: `این یک پست **نمونه** است تا ظاهر لیست و صفحهٔ پست را ببینیم.

## شروع

برای پر کردن دیتابیس با محتوای فارسی کوتاه.

> نقل‌قول نمونه برای استایل blockquote.

لیست کوتاه:

1. نوشتن
2. خواندن
3. انتشار
`,
  },
  {
    slug: "yaddasht-ruzane",
    title: "یادداشت کوتاه",
    date: "2026-03-10",
    tags: ["یادداشت"],
    categories: ["عمومی"],
    excerpt: "چند خط دربارهٔ نوشتن منظم.",
    body: `گاهی فقط چند پاراگراف کافی است.

### نکته

نوشتن هر روز، حتی کوتاه، عادت می‌سازد.

لینک نمونه: [صفحهٔ اصلی](/).
`,
  },
  {
    slug: "ketabkhane-va-man",
    title: "کتابخانه و من",
    date: "2026-02-28",
    tags: ["کتاب"],
    categories: ["کتاب"],
    excerpt: "دربارهٔ قفسه و عادت خواندن.",
    body: `کتابخانه فقط قفسه نیست؛ جایی است که آدم‌ها دور کتاب جمع می‌شوند.

- قفسه
- میز مطالعه
- سکوت مفید
`,
  },
];

function slugify(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `cat-${Date.now()}`
  );
}

async function main() {
  const sql = neon(url!);

  const categoryNames = [
    ...new Set(TEST_POSTS.flatMap((p) => p.categories)),
  ];
  for (const name of categoryNames) {
    const slug = slugify(name);
    await sql`
      INSERT INTO categories (name, slug)
      VALUES (${name}, ${slug})
      ON CONFLICT (name) DO NOTHING
    `;
    console.log("Seeded category:", name);
  }

  for (const post of TEST_POSTS) {
    await sql`
      INSERT INTO posts (slug, title, date, tags, categories, excerpt, body)
      VALUES (
        ${post.slug},
        ${post.title},
        ${post.date},
        ${post.tags},
        ${post.categories},
        ${post.excerpt},
        ${post.body}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        date = EXCLUDED.date,
        tags = EXCLUDED.tags,
        categories = EXCLUDED.categories,
        excerpt = EXCLUDED.excerpt,
        body = EXCLUDED.body,
        updated_at = NOW()
    `;
    console.log("Seeded post:", post.slug);
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
