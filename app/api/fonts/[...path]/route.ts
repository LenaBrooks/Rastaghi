import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FONTS_ROOT = path.join(process.cwd(), "app", "fonts");
const ALLOWED_EXT = new Set([".woff2", ".woff"]);

function contentType(ext: string): string {
  if (ext === ".woff2") return "font/woff2";
  if (ext === ".woff") return "font/woff";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Reject traversal / absolute segments
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\0"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const rel = segments.join("/");
  const resolved = path.resolve(FONTS_ROOT, rel);
  const rootResolved = path.resolve(FONTS_ROOT);

  if (
    resolved !== rootResolved &&
    !resolved.startsWith(rootResolved + path.sep)
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const ext = path.extname(resolved).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  }

  try {
    const info = await stat(resolved);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await readFile(resolved);

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": contentType(ext),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
