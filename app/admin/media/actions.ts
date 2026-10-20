"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  deleteCloudinaryMedia,
  getCloudinaryUsage,
  isCloudinaryConfigured,
  listCloudinaryMedia,
  parseMediaKind,
  type CloudinaryMediaItem,
  type CloudinaryUsageSummary,
  type MediaKind,
} from "@/lib/cloudinary";

function requireAdmin(): Promise<boolean> {
  return isAdminAuthenticated();
}

export type MediaListState = {
  items: CloudinaryMediaItem[];
  nextCursor: string | null;
  error?: string;
};

export async function loadMediaUsageAction(): Promise<
  | { ok: true; usage: CloudinaryUsageSummary }
  | { ok: false; error: string }
> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "Cloudinary در env پیکربندی نشده است." };
  }
  try {
    const usage = await getCloudinaryUsage();
    return { ok: true, usage };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "خواندن حجم ناموفق بود.",
    };
  }
}

export async function listMediaAction(input: {
  kind: string;
  nextCursor?: string | null;
}): Promise<MediaListState> {
  if (!(await requireAdmin())) {
    return { items: [], nextCursor: null, error: "Unauthorized" };
  }
  if (!isCloudinaryConfigured()) {
    return {
      items: [],
      nextCursor: null,
      error: "Cloudinary در env پیکربندی نشده است.",
    };
  }
  const kind = parseMediaKind(input.kind);
  if (!kind) {
    return { items: [], nextCursor: null, error: "نوع فایل نامعتبر است." };
  }
  try {
    return await listCloudinaryMedia({
      kind,
      nextCursor: input.nextCursor,
      maxResults: 40,
    });
  } catch (err) {
    console.error(err);
    return {
      items: [],
      nextCursor: null,
      error: err instanceof Error ? err.message : "دریافت فایل‌ها ناموفق بود.",
    };
  }
}

export async function deleteMediaAction(input: {
  targets: { publicId: string; resourceType: "image" | "video" }[];
}): Promise<{ ok: boolean; deleted: string[]; error?: string }> {
  if (!(await requireAdmin())) {
    return { ok: false, deleted: [], error: "Unauthorized" };
  }
  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      deleted: [],
      error: "Cloudinary در env پیکربندی نشده است.",
    };
  }
  const targets = (input.targets ?? []).filter(
    (t) =>
      t?.publicId &&
      (t.resourceType === "image" || t.resourceType === "video"),
  );
  if (targets.length === 0) {
    return { ok: false, deleted: [], error: "فایلی انتخاب نشده." };
  }
  try {
    const result = await deleteCloudinaryMedia(targets);
    revalidatePath("/admin/media");
    if (result.deleted.length === 0) {
      return {
        ok: false,
        deleted: [],
        error: "حذف انجام نشد.",
      };
    }
    return {
      ok: result.failed.length === 0,
      deleted: result.deleted,
      error:
        result.failed.length > 0
          ? `${result.failed.length} مورد حذف نشد.`
          : undefined,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      deleted: [],
      error: err instanceof Error ? err.message : "حذف ناموفق بود.",
    };
  }
}

export type { MediaKind, CloudinaryMediaItem, CloudinaryUsageSummary };
