import { NextResponse } from "next/server";
import {
  checkContactRateLimit,
  isTelegramConfigured,
  sendTelegramMessage,
} from "@/lib/telegram";

export const runtime = "nodejs";

const NAME_MAX = 80;
const EMAIL_MAX = 120;
const MESSAGE_MAX = 4000;
const MESSAGE_MIN = 3;

function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function isValidEmail(email: string): boolean {
  if (!email) return true;
  // Practical check; not a full RFC parser.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= EMAIL_MAX;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { error: "ارسال پیام فعلاً در دسترس نیست." },
      { status: 503 },
    );
  }

  const rate = checkContactRateLimit(clientKey(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  let body: ContactBody;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = (await request.json()) as ContactBody;
    } else {
      const form = await request.formData();
      body = {
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      };
    }
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const name = sanitizeText(body.name, NAME_MAX);
  const email = sanitizeText(body.email, EMAIL_MAX);
  const message = sanitizeText(body.message, MESSAGE_MAX);

  if (!name) {
    return NextResponse.json({ error: "نام الزامی است." }, { status: 400 });
  }
  if (!message || message.length < MESSAGE_MIN) {
    return NextResponse.json(
      { error: "متن پیام خیلی کوتاه است." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "ایمیل نامعتبر است." }, { status: 400 });
  }

  const lines = [
    "📩 پیام جدید از فرم تماس",
    "",
    `نام: ${name}`,
    email ? `ایمیل: ${email}` : "ایمیل: —",
    "",
    "پیام:",
    message,
  ];

  const result = await sendTelegramMessage(lines.join("\n"));
  if (!result.ok) {
    const status =
      result.status === 401 || result.status === 403
        ? 502
        : result.status === 429
          ? 429
          : result.status >= 500
            ? 502
            : 502;
    return NextResponse.json(
      { error: "ارسال پیام ناموفق بود. بعداً دوباره تلاش کنید." },
      {
        status,
        ...(result.status === 429
          ? { headers: { "Retry-After": "60" } }
          : {}),
      },
    );
  }

  return NextResponse.json({ ok: true, message: "پیام شما ارسال شد." });
}
