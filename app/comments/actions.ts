"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createComment,
  deleteComment,
  setCommentLike,
} from "@/lib/comments";
import { getOrCreateVisitorId } from "@/lib/visitor";

export type CommentActionState = {
  error?: string;
  ok?: boolean;
};

export async function createCommentAction(
  _prev: CommentActionState | undefined,
  formData: FormData,
): Promise<CommentActionState> {
  const postSlug = String(formData.get("postSlug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const parentRaw = String(formData.get("parentId") ?? "").trim();
  const parentId = parentRaw ? Number(parentRaw) : null;

  if (!postSlug) return { error: "پست نامعتبر است." };
  if (!name) return { error: "نام الزامی است." };
  if (!body) return { error: "متن نظر الزامی است." };

  try {
    await createComment({
      postSlug,
      authorName: name,
      body,
      parentId:
        parentId != null && Number.isFinite(parentId) ? parentId : null,
    });
  } catch (err) {
    console.error(err);
    return {
      error: err instanceof Error ? err.message : "ثبت نظر ناموفق بود.",
    };
  }

  revalidatePath(`/${postSlug}`);
  return { ok: true };
}

export async function setCommentLikeAction(
  commentId: number,
  liked: boolean,
): Promise<{ likesCount: number; liked: boolean } | { error: string }> {
  if (!Number.isFinite(commentId)) {
    return { error: "نامعتبر" };
  }
  try {
    const visitorId = await getOrCreateVisitorId();
    return await setCommentLike(commentId, visitorId, liked);
  } catch (err) {
    console.error(err);
    return { error: "لایک ناموفق بود." };
  }
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const postSlug = await deleteComment(id);
  if (postSlug) revalidatePath(`/${postSlug}`);
}
