import { DEFAULT_FONT_ID, listFontOptions, resolveFontId } from "@/lib/fonts/catalog";
import { hasDatabaseUrl, sql } from "@/lib/db";

export type SettingOption = { value: string; label: string };

/**
 * Registry of editable site settings.
 * Add new entries here — they automatically appear in /admin/settings.
 */
const CONTACT_BODY_DEFAULT = [
  "برای ارتباط می‌توانید از راه‌های زیر استفاده کنید.",
  "",
  "ایمیل: hello@example.com",
  "تلگرام: @example",
  "",
  "پیامتان را بفرستید؛ در اولین فرصت پاسخ می‌دهم.",
].join("\n");

export const SETTING_DEFS = [
  {
    key: "home.hero_name",
    label: "نام در بنر",
    group: "صفحه اصلی",
    defaultValue: "محمد رستاقی",
    type: "text" as const,
  },
  {
    key: "home.hero_tagline",
    label: "شعار بنر",
    group: "صفحه اصلی",
    defaultValue: "آموزش نویسندگی، تفکر و توسعه فردی",
    type: "text" as const,
  },
  {
    key: "home.featured_title",
    label: "عنوان برگزیده‌ها",
    group: "صفحه اصلی",
    defaultValue: "برگزیده‌ها:",
    type: "text" as const,
  },
  {
    key: "contact.title",
    label: "عنوان",
    group: "تماس با ما",
    defaultValue: "تماس با ما",
    type: "text" as const,
  },
  {
    key: "contact.body",
    label: "متن صفحه",
    group: "تماس با ما",
    defaultValue: CONTACT_BODY_DEFAULT,
    type: "textarea" as const,
  },
  {
    key: "font.header",
    label: "فونت هدر",
    group: "قلم‌ها",
    defaultValue: DEFAULT_FONT_ID,
    type: "select" as const,
  },
  {
    key: "font.heading",
    label: "فونت عناوین",
    group: "قلم‌ها",
    defaultValue: DEFAULT_FONT_ID,
    type: "select" as const,
  },
  {
    key: "font.body",
    label: "فونت متن",
    group: "قلم‌ها",
    defaultValue: DEFAULT_FONT_ID,
    type: "select" as const,
  },
  {
    key: "comments.mode",
    label: "وضعیت نظرات",
    group: "نظرات",
    defaultValue: "moderation",
    type: "select" as const,
    options: [
      { value: "moderation", label: "نیاز به تأیید" },
      { value: "open", label: "باز — بدون تأیید" },
      { value: "closed", label: "بسته — ثبت نظر غیرفعال" },
    ],
  },
] as const;

export const COMMENT_MODES = ["moderation", "open", "closed"] as const;
export type CommentMode = (typeof COMMENT_MODES)[number];

export function resolveCommentMode(raw: string | undefined | null): CommentMode {
  if (raw === "open" || raw === "closed" || raw === "moderation") return raw;
  return "moderation";
}

export type SettingKey = (typeof SETTING_DEFS)[number]["key"];

export type SettingDef = {
  key: string;
  label: string;
  group: string;
  defaultValue: string;
  type?: "text" | "textarea" | "select";
  options?: SettingOption[];
};

const FONT_KEYS = new Set<string>(["font.header", "font.heading", "font.body"]);

export function getSettingDefs(): SettingDef[] {
  const fontOptions = listFontOptions();
  return SETTING_DEFS.map((d) => {
    const base: SettingDef = {
      key: d.key,
      label: d.label,
      group: d.group,
      defaultValue: d.defaultValue,
      type: d.type,
    };
    if (d.type === "select") {
      if ("options" in d && d.options) {
        base.options = [...d.options];
      } else if (FONT_KEYS.has(d.key)) {
        base.options = fontOptions;
      }
    }
    return base;
  });
}

function requireDbOrEmpty(): boolean {
  if (hasDatabaseUrl()) return true;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[settings] DATABASE_URL is missing — using defaults.",
    );
  }
  return false;
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const def of SETTING_DEFS) {
    map[def.key] = def.defaultValue;
  }
  if (!requireDbOrEmpty()) return map;

  const keys = SETTING_DEFS.map((d) => d.key);
  if (keys.length === 0) return map;

  const rows = (await sql()`
    SELECT key, value FROM site_settings
    WHERE key = ANY (${keys})
  `) as { key: string; value: string }[];

  for (const row of rows) {
    if (FONT_KEYS.has(row.key)) {
      map[row.key] = resolveFontId(row.value);
    } else if (row.key === "comments.mode") {
      map[row.key] = resolveCommentMode(row.value);
    } else {
      map[row.key] = row.value;
    }
  }
  return map;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const def = SETTING_DEFS.find((d) => d.key === key);
  const fallback = def?.defaultValue ?? "";
  if (!requireDbOrEmpty()) return fallback;

  const rows = (await sql()`
    SELECT value FROM site_settings WHERE key = ${key} LIMIT 1
  `) as { value: string }[];

  const value = rows[0]?.value ?? fallback;
  return FONT_KEYS.has(key) ? resolveFontId(value) : value;
}

export async function setSettings(
  values: Record<string, string>,
): Promise<void> {
  if (!requireDbOrEmpty()) {
    throw new Error("DATABASE_URL is not set.");
  }

  const allowed = new Set(SETTING_DEFS.map((d) => d.key));
  for (const [key, raw] of Object.entries(values)) {
    if (!allowed.has(key as SettingKey)) continue;
    const value = String(raw ?? "").trim();
    const def = SETTING_DEFS.find((d) => d.key === key);
    let next = value || def?.defaultValue || "";
    if (FONT_KEYS.has(key)) {
      next = resolveFontId(next);
    }
    if (key === "comments.mode") {
      next = resolveCommentMode(next);
    }
    await sql()`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${key}, ${next}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;
  }
}

export async function getCommentMode(): Promise<CommentMode> {
  const map = await getSettingsMap();
  return resolveCommentMode(map["comments.mode"]);
}
