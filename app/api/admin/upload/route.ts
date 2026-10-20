import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  isCloudinaryConfigured,
  parseMediaKind,
  uploadMediaToCloudinary,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary در env پیکربندی نشده است." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل یافت نشد." }, { status: 400 });
  }

  const kind = parseMediaKind(formData.get("kind")) ?? "image";

  try {
    const uploaded = await uploadMediaToCloudinary(file, kind);
    return NextResponse.json({
      url: uploaded.url,
      publicId: uploaded.publicId,
      kind,
      resourceType: uploaded.resourceType,
      width: uploaded.width,
      height: uploaded.height,
    });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "آپلود ناموفق بود.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
