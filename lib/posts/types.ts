/**
 * Shared post contract.
 * Source of truth: Neon Postgres (`posts` table).
 * Pages should only import from `@/lib/posts` — never query Neon directly.
 */
export type Post = {
  slug: string;
  title: string;
  date: string; // local ISO datetime YYYY-MM-DDTHH:mm
  tags: string[];
  categories?: string[];
  excerpt?: string;
  /** Raw markdown body */
  body: string;
  /** Rendered HTML (derived from body at read time) */
  html: string;
  /** false = draft, hidden from the public site */
  published: boolean;
  /** true = show in homepage «برگزیده‌ها» */
  featured: boolean;
};

/** List/card fields without markdown HTML (and usually without body). */
export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  categories?: string[];
  excerpt?: string;
  published: boolean;
  featured: boolean;
  /** Only when fetched with `includeBody: true` (e.g. admin word counts). */
  body?: string;
};

export type Project = {
  slug: string;
  title: string;
  date: string;
  description: string;
  language?: string;
  website?: string;
  repo?: string;
};
