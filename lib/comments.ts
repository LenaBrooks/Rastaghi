import { hasDatabaseUrl, sql } from "@/lib/db";

export type CommentRow = {
  id: number;
  postSlug: string;
  parentId: number | null;
  authorName: string;
  body: string;
  likesCount: number;
  approved: boolean;
  createdAt: string;
  likedByVisitor: boolean;
};

export type CommentNode = CommentRow & {
  children: CommentNode[];
  /** Display depth capped at 2 for indentation */
  depth: number;
  replyToName: string | null;
};

type DbComment = {
  id: number;
  post_slug: string;
  parent_id: number | null;
  author_name: string;
  body: string;
  likes_count: number;
  approved: boolean;
  created_at: string | Date;
};

function requireDbOrEmpty(): boolean {
  if (hasDatabaseUrl()) return true;
  if (process.env.NODE_ENV !== "production") {
    console.warn("[comments] DATABASE_URL missing — returning empty.");
  }
  return false;
}

function mapRow(row: DbComment, likedIds: Set<number>): CommentRow {
  return {
    id: Number(row.id),
    postSlug: row.post_slug,
    parentId: row.parent_id == null ? null : Number(row.parent_id),
    authorName: row.author_name,
    body: row.body,
    likesCount: Number(row.likes_count) || 0,
    approved: Boolean(row.approved),
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : row.created_at.toISOString(),
    likedByVisitor: likedIds.has(Number(row.id)),
  };
}

/** Flat list for a post, oldest first. */
export async function getCommentsForPost(
  postSlug: string,
  visitorId?: string | null,
  options?: { includeUnapproved?: boolean },
): Promise<CommentRow[]> {
  if (!requireDbOrEmpty()) return [];

  const includeUnapproved = options?.includeUnapproved === true;

  const rows = (
    includeUnapproved
      ? await sql()`
          SELECT id, post_slug, parent_id, author_name, body, likes_count,
                 approved, created_at
          FROM comments
          WHERE post_slug = ${postSlug}
          ORDER BY created_at ASC, id ASC
        `
      : await sql()`
          SELECT id, post_slug, parent_id, author_name, body, likes_count,
                 approved, created_at
          FROM comments
          WHERE post_slug = ${postSlug}
            AND approved = TRUE
          ORDER BY created_at ASC, id ASC
        `
  ) as DbComment[];

  let likedIds = new Set<number>();
  if (visitorId && rows.length > 0) {
    const likes = (await sql()`
      SELECT cl.comment_id
      FROM comment_likes cl
      INNER JOIN comments c ON c.id = cl.comment_id
      WHERE c.post_slug = ${postSlug}
        AND cl.visitor_id = ${visitorId}
    `) as { comment_id: number }[];
    likedIds = new Set(likes.map((l) => Number(l.comment_id)));
  }

  return rows.map((r) => mapRow(r, likedIds));
}

/** Public count of approved comments only. */
export async function countApprovedComments(postSlug: string): Promise<number> {
  if (!requireDbOrEmpty()) return 0;
  const rows = (await sql()`
    SELECT COUNT(*)::int AS n
    FROM comments
    WHERE post_slug = ${postSlug} AND approved = TRUE
  `) as { n: number }[];
  return Number(rows[0]?.n) || 0;
}

/** Pending (unapproved) comments across the site. */
export async function countPendingComments(): Promise<number> {
  if (!requireDbOrEmpty()) return 0;
  const rows = (await sql()`
    SELECT COUNT(*)::int AS n
    FROM comments
    WHERE approved = FALSE
  `) as { n: number }[];
  return Number(rows[0]?.n) || 0;
}

export type AdminCommentItem = CommentRow & {
  postTitle: string | null;
};

/** Newest pending first, then recent approved. */
export async function listAdminComments(options?: {
  pendingOnly?: boolean;
  limit?: number;
}): Promise<AdminCommentItem[]> {
  if (!requireDbOrEmpty()) return [];
  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 300);
  const pendingOnly = options?.pendingOnly === true;

  const rows = (
    pendingOnly
      ? await sql()`
          SELECT
            c.id, c.post_slug, c.parent_id, c.author_name, c.body,
            c.likes_count, c.approved, c.created_at,
            p.title AS post_title
          FROM comments c
          LEFT JOIN posts p ON p.slug = c.post_slug
          WHERE c.approved = FALSE
          ORDER BY c.created_at DESC, c.id DESC
          LIMIT ${limit}
        `
      : await sql()`
          SELECT
            c.id, c.post_slug, c.parent_id, c.author_name, c.body,
            c.likes_count, c.approved, c.created_at,
            p.title AS post_title
          FROM comments c
          LEFT JOIN posts p ON p.slug = c.post_slug
          ORDER BY c.approved ASC, c.created_at DESC, c.id DESC
          LIMIT ${limit}
        `
  ) as (DbComment & { post_title: string | null })[];

  return rows.map((row) => ({
    ...mapRow(row, new Set()),
    postTitle: row.post_title?.trim() || null,
  }));
}

/** Build tree; visual depth max 2; deeper nodes keep depth=2 + replyToName. */
export function buildCommentTree(flat: CommentRow[]): CommentNode[] {
  const byId = new Map<number, CommentNode>();
  for (const c of flat) {
    byId.set(c.id, {
      ...c,
      children: [],
      depth: 0,
      replyToName: null,
    });
  }

  const roots: CommentNode[] = [];
  const nameById = new Map(flat.map((c) => [c.id, c.authorName]));

  for (const c of flat) {
    const node = byId.get(c.id)!;
    if (c.parentId == null || !byId.has(c.parentId)) {
      node.depth = 0;
      roots.push(node);
      continue;
    }
    const parent = byId.get(c.parentId)!;
    const nextDepth = Math.min(parent.depth + 1, 2);
    node.depth = nextDepth;
    if (parent.depth >= 2 || nextDepth === 2) {
      node.replyToName = nameById.get(c.parentId) ?? null;
    }
    parent.children.push(node);
  }

  return roots;
}

export async function createComment(input: {
  postSlug: string;
  authorName: string;
  body: string;
  parentId?: number | null;
  approved?: boolean;
}): Promise<CommentRow> {
  const authorName = input.authorName.trim();
  const body = input.body.trim();
  if (!authorName) throw new Error("نام الزامی است.");
  if (!body) throw new Error("متن نظر الزامی است.");
  if (authorName.length > 80) throw new Error("نام خیلی بلند است.");
  if (body.length > 4000) throw new Error("متن خیلی بلند است.");

  if (input.parentId != null) {
    const parents = (await sql()`
      SELECT id, post_slug, approved
      FROM comments
      WHERE id = ${input.parentId}
      LIMIT 1
    `) as { id: number; post_slug: string; approved: boolean }[];
    if (!parents[0] || parents[0].post_slug !== input.postSlug) {
      throw new Error("نظر والد نامعتبر است.");
    }
    if (!parents[0].approved && !input.approved) {
      throw new Error("نظر والد هنوز تأیید نشده است.");
    }
  }

  const approved = input.approved === true;

  const rows = (await sql()`
    INSERT INTO comments (post_slug, parent_id, author_name, body, approved)
    VALUES (
      ${input.postSlug},
      ${input.parentId ?? null},
      ${authorName},
      ${body},
      ${approved}
    )
    RETURNING id, post_slug, parent_id, author_name, body, likes_count,
              approved, created_at
  `) as DbComment[];

  return mapRow(rows[0], new Set());
}

export async function approveComment(id: number): Promise<string | null> {
  const rows = (await sql()`
    UPDATE comments
    SET approved = TRUE
    WHERE id = ${id}
    RETURNING post_slug
  `) as { post_slug: string }[];
  return rows[0]?.post_slug ?? null;
}

/** Idempotent set: apply desired liked state, return authoritative count. */
export async function setCommentLike(
  commentId: number,
  visitorId: string,
  liked: boolean,
): Promise<{ likesCount: number; liked: boolean }> {
  const existing = (await sql()`
    SELECT 1 FROM comment_likes
    WHERE comment_id = ${commentId} AND visitor_id = ${visitorId}
    LIMIT 1
  `) as unknown[];
  const currentlyLiked = existing.length > 0;

  if (liked && !currentlyLiked) {
    const inserted = (await sql()`
      INSERT INTO comment_likes (comment_id, visitor_id)
      VALUES (${commentId}, ${visitorId})
      ON CONFLICT DO NOTHING
      RETURNING 1
    `) as unknown[];
    if (inserted.length > 0) {
      await sql()`
        UPDATE comments
        SET likes_count = likes_count + 1
        WHERE id = ${commentId}
      `;
    }
  } else if (!liked && currentlyLiked) {
    const deleted = (await sql()`
      DELETE FROM comment_likes
      WHERE comment_id = ${commentId} AND visitor_id = ${visitorId}
      RETURNING 1
    `) as unknown[];
    if (deleted.length > 0) {
      await sql()`
        UPDATE comments
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = ${commentId}
      `;
    }
  }

  const rows = (await sql()`
    SELECT likes_count FROM comments WHERE id = ${commentId} LIMIT 1
  `) as { likes_count: number }[];

  const nowLiked =
    (
      (await sql()`
      SELECT 1 FROM comment_likes
      WHERE comment_id = ${commentId} AND visitor_id = ${visitorId}
      LIMIT 1
    `) as unknown[]
    ).length > 0;

  return {
    likesCount: Number(rows[0]?.likes_count) || 0,
    liked: nowLiked,
  };
}

/** Delete comment and descendants (DB cascade on parent_id). */
export async function deleteComment(id: number): Promise<string | null> {
  const rows = (await sql()`
    DELETE FROM comments WHERE id = ${id}
    RETURNING post_slug
  `) as { post_slug: string }[];
  return rows[0]?.post_slug ?? null;
}
