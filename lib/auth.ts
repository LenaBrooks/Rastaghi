import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth-edge";

export { ADMIN_COOKIE };

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set in environment.");
  }
  return password;
}

function getSecret(): string {
  const secret =
    process.env.ADMIN_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (!secret) {
    throw new Error("ADMIN_SECRET (or ADMIN_PASSWORD) is not set.");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function buildToken(expiresAt: number): string {
  const payload = `admin:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const [, expiresRaw] = payload.split(":");
  const expiresAt = Number(expiresRaw);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

export function checkPassword(input: string): boolean {
  const expected = getPassword();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const token = buildToken(expiresAt);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const jar = await cookies();
    return verifyToken(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}
