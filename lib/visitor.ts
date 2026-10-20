import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export const VISITOR_COOKIE = "visitor_id";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Read visitor id; create + set cookie if missing. Server-only. */
export async function getOrCreateVisitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value?.trim();
  if (existing && existing.length >= 8 && existing.length <= 64) {
    return existing;
  }
  const id = randomUUID();
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}

export async function peekVisitorId(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value?.trim();
  if (existing && existing.length >= 8 && existing.length <= 64) {
    return existing;
  }
  return null;
}
