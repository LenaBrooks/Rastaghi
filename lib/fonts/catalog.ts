export type FontFile = {
  /** Path relative to `app/fonts/` */
  relPath: string;
  weight?: string;
  style?: "normal" | "italic";
};

export type FontEntry = {
  id: string;
  label: string;
  family: string;
  files: FontFile[];
};

/**
 * Selectable site fonts. Prefer FD / farsi-digits faces when available.
 * Files live under `app/fonts/` and are served on demand via `/api/fonts/...`.
 */
export const FONT_CATALOG: FontEntry[] = [
  {
    id: "hakaza",
    label: "حکازا",
    family: "Hakaza",
    files: [{ relPath: "Hakaza/Hakaza.woff2", weight: "400" }],
  },
  {
    id: "amiri",
    label: "امیری",
    family: "Amiri",
    files: [
      { relPath: "Amiri/Amiri-Regular.woff2", weight: "400" },
      { relPath: "Amiri/Amiri-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "arad",
    label: "آراد",
    family: "Arad FD",
    files: [{ relPath: "Arad/Arad-FD.woff2", weight: "400" }],
  },
  {
    id: "ario",
    label: "آریو",
    family: "Ario FD",
    files: [{ relPath: "Ario/Ario-FD.woff2", weight: "400" }],
  },
  {
    id: "behdad",
    label: "بهداد",
    family: "Behdad",
    files: [{ relPath: "Behdad/Behdad-Regular.woff2", weight: "400" }],
  },
  {
    id: "estedad",
    label: "استعداد",
    family: "Estedad",
    files: [{ relPath: "Estedad/Estedad-wght.woff2", weight: "100 900" }],
  },
  {
    id: "farbod",
    label: "فربد",
    family: "Farbod",
    files: [{ relPath: "Farbod/Farbod-Regular.woff2", weight: "400" }],
  },
  {
    id: "gandom",
    label: "گندم",
    family: "Gandom FD",
    files: [{ relPath: "gandom/farsi-digits/Gandom-FD.woff2", weight: "400" }],
  },
  {
    id: "ganjnameh",
    label: "گنجنامه",
    family: "Ganjnameh",
    files: [
      { relPath: "Ganjnameh/GanjNamehSans-Regular.woff2", weight: "400" },
    ],
  },
  {
    id: "iran-nastaliq",
    label: "ایران نستعلیق",
    family: "Iran Nastaliq",
    files: [
      { relPath: "IranNastaliq/IranNastaliq-Regular.woff2", weight: "400" },
    ],
  },
  {
    id: "koodak",
    label: "کودک",
    family: "Koodak",
    files: [{ relPath: "Koodak/Koodak-Regular.woff2", weight: "400" }],
  },
  {
    id: "lalezar",
    label: "لاله‌زار",
    family: "Lalezar",
    files: [{ relPath: "Lalezar/Lalezar-Regular.woff2", weight: "400" }],
  },
  {
    id: "lateef",
    label: "لطیف",
    family: "Lateef",
    files: [
      { relPath: "Lateef/Lateef-Regular.woff2", weight: "400" },
      { relPath: "Lateef/Lateef-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "markazi",
    label: "مرکزی",
    family: "Markazi Text",
    files: [{ relPath: "MarkaziText/MarkaziText-wght.woff2", weight: "100 900" }],
  },
  {
    id: "mikhak",
    label: "میخک",
    family: "Mikhak FD",
    files: [{ relPath: "Mikhak/Mikhak-FD.woff2", weight: "400" }],
  },
  {
    id: "milad-azad",
    label: "میلاد آزاد",
    family: "MiladAzad",
    files: [{ relPath: "MiladAzad/MiladAzad-Regular.woff2", weight: "400" }],
  },
  {
    id: "nahid",
    label: "ناهید",
    family: "Nahid FD",
    files: [{ relPath: "nahid/farsi-digits/Nahid-FD.woff2", weight: "400" }],
  },
  {
    id: "nazanin",
    label: "نازنین",
    family: "Nazanin",
    files: [
      { relPath: "Nazanin/Nazanin-Regular.woff2", weight: "400" },
      { relPath: "Nazanin/Nazanin-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "nazli",
    label: "نازلی",
    family: "Nazli",
    files: [
      { relPath: "Nazli/Nazli-Regular.woff2", weight: "400" },
      { relPath: "Nazli/Nazli-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "nika",
    label: "نیکا",
    family: "Nika",
    files: [{ relPath: "Nika/Nika-Regular.woff2", weight: "400" }],
  },
  {
    id: "noon",
    label: "نون",
    family: "Noon",
    files: [{ relPath: "Noon/Noon-Regular.woff2", weight: "400" }],
  },
  {
    id: "normal-sans",
    label: "نرمال سنس",
    family: "AQ Normal Sans",
    files: [
      { relPath: "NormalSans/AQNormalSans-VF.woff2", weight: "100 900" },
    ],
  },
  {
    id: "noto-kufi",
    label: "نوتو کوفی",
    family: "Noto Kufi Arabic",
    files: [
      {
        relPath: "NotoKufiArabic/NotoKufiArabic-wght.woff2",
        weight: "100 900",
      },
    ],
  },
  {
    id: "noto-naskh",
    label: "نوتو نسخ",
    family: "Noto Naskh Arabic",
    files: [
      {
        relPath: "NotoNaskhArabic/NotoNaskhArabic-wght.woff2",
        weight: "100 900",
      },
    ],
  },
  {
    id: "noto-sans",
    label: "نوتو سنس",
    family: "Noto Sans Arabic",
    files: [
      {
        relPath: "NotoSansArabic/NotoSansArabic-wght.woff2",
        weight: "100 900",
      },
    ],
  },
  {
    id: "parastoo",
    label: "پرستو",
    family: "Parastoo FD",
    files: [
      { relPath: "parastoo/farsi-digits/Parastoo-FD.woff2", weight: "400" },
      { relPath: "parastoo/farsi-digits/Parastoo-Bold-FD.woff2", weight: "700" },
    ],
  },
  {
    id: "sahel",
    label: "ساحل",
    family: "Sahel FD",
    files: [
      { relPath: "sahel/farsi-digits/Sahel-Light-FD.woff2", weight: "300" },
      { relPath: "sahel/farsi-digits/Sahel-FD.woff2", weight: "400" },
      { relPath: "sahel/farsi-digits/Sahel-SemiBold-FD.woff2", weight: "600" },
      { relPath: "sahel/farsi-digits/Sahel-Bold-FD.woff2", weight: "700" },
      { relPath: "sahel/farsi-digits/Sahel-Black-FD.woff2", weight: "900" },
    ],
  },
  {
    id: "samim",
    label: "صمیم",
    family: "Samim FD",
    files: [
      { relPath: "samim/farsi-digits/Samim-FD.woff2", weight: "400" },
      { relPath: "samim/farsi-digits/Samim-Medium-FD.woff2", weight: "500" },
      { relPath: "samim/farsi-digits/Samim-Bold-FD.woff2", weight: "700" },
    ],
  },
  {
    id: "samir",
    label: "سمیر",
    family: "Samir Farsi Numerals",
    files: [
      { relPath: "Samir/Samir Farsi Numerals.woff2", weight: "400" },
    ],
  },
  {
    id: "scheherazade",
    label: "شهرزاد",
    family: "Scheherazade New",
    files: [
      {
        relPath: "ScheherazadeNew/ScheherazadeNew-Regular.woff2",
        weight: "400",
      },
      { relPath: "ScheherazadeNew/ScheherazadeNew-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "sepehr",
    label: "سپهر",
    family: "Sepehr",
    files: [
      { relPath: "Sepehr/Sepehr-Thin.woff2", weight: "100" },
      { relPath: "Sepehr/Sepehr-Light.woff2", weight: "300" },
      { relPath: "Sepehr/Sepehr-Regular.woff2", weight: "400" },
      { relPath: "Sepehr/Sepehr-Medium.woff2", weight: "500" },
      { relPath: "Sepehr/Sepehr-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "shabnam",
    label: "شبنم",
    family: "Shabnam FD",
    files: [
      { relPath: "shabnam/farsi-digits/Shabnam-Thin-FD.woff2", weight: "100" },
      { relPath: "shabnam/farsi-digits/Shabnam-Light-FD.woff2", weight: "300" },
      { relPath: "shabnam/farsi-digits/Shabnam-FD.woff2", weight: "400" },
      { relPath: "shabnam/farsi-digits/Shabnam-Medium-FD.woff2", weight: "500" },
      { relPath: "shabnam/farsi-digits/Shabnam-Bold-FD.woff2", weight: "700" },
    ],
  },
  {
    id: "shafigh",
    label: "شفیق",
    family: "XB Shafigh Uzbek",
    files: [
      { relPath: "Shafigh/Shafigh-Regular.woff2", weight: "400" },
      { relPath: "Shafigh/Shafigh-Italic.woff2", weight: "400", style: "italic" },
      { relPath: "Shafigh/Shafigh-Bold.woff2", weight: "700" },
      {
        relPath: "Shafigh/Shafigh-BoldItalic.woff2",
        weight: "700",
        style: "italic",
      },
    ],
  },
  {
    id: "shahab",
    label: "شهاب",
    family: "Shahab",
    files: [{ relPath: "Shahab/Shahab-Regular.woff2", weight: "400" }],
  },
  {
    id: "sorena",
    label: "سورنا",
    family: "Sorena FD",
    files: [{ relPath: "Sorena/SorenaFD-Normal.woff2", weight: "400" }],
  },
  {
    id: "tanha",
    label: "تنها",
    family: "Tanha FD",
    files: [{ relPath: "tanha/farsi-digits/Tanha-FD.woff2", weight: "400" }],
  },
  {
    id: "terafik",
    label: "ترافیک",
    family: "Terafik",
    files: [
      { relPath: "Terafik/Terafik-Regular.woff2", weight: "400" },
      { relPath: "Terafik/Terafik-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "titr",
    label: "تیتر",
    family: "Titr",
    files: [{ relPath: "titr/Titr-Bold.woff2", weight: "700" }],
  },
  {
    id: "unixel",
    label: "یونیکسل",
    family: "Unixel",
    files: [{ relPath: "Unixel/Unixel-Regular.woff2", weight: "400" }],
  },
  {
    id: "vazirmatn",
    label: "وزیرمتن",
    family: "Vazirmatn",
    files: [{ relPath: "Vazirmatn/Vazirmatn-wght.woff2", weight: "100 900" }],
  },
  {
    id: "vizheh-azad",
    label: "ویژه آزاد",
    family: "VizhehAzad",
    files: [{ relPath: "VizhehAzad/VizhehAzad-Regular.woff2", weight: "400" }],
  },
  {
    id: "xb-kayhan",
    label: "کیهان",
    family: "XB Kayhan",
    files: [
      { relPath: "XBKayhan/XBKayhan-Regular.woff2", weight: "400" },
      { relPath: "XBKayhan/XBKayhan-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "xb-roya",
    label: "رویا",
    family: "XB Roya",
    files: [
      { relPath: "XBRoya/XBRoya-Regular.woff2", weight: "400" },
      { relPath: "XBRoya/XBRoya-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "xb-sols",
    label: "ثلث",
    family: "XB Sols",
    files: [
      { relPath: "XBSols/XBSols-Regular.woff2", weight: "400" },
      { relPath: "XBSols/XBSols-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "xb-tabriz",
    label: "تبریز",
    family: "XB Tabriz",
    files: [
      { relPath: "XBTabriz/XBTabriz-Regular.woff2", weight: "400" },
      { relPath: "XBTabriz/XBTabriz-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "xm-yekan",
    label: "یکان",
    family: "XM Yekan",
    files: [
      { relPath: "XMYekan/XMYekan-Regular.woff2", weight: "400" },
      { relPath: "XMYekan/XMYekan-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "xp-vosta",
    label: "وسطی",
    family: "XP Vosta",
    files: [
      { relPath: "XPVosta/XPVosta-Regular.woff2", weight: "400" },
      { relPath: "XPVosta/XPVosta-Bold.woff2", weight: "700" },
    ],
  },
  {
    id: "xp-ziba",
    label: "زیبا",
    family: "XP Ziba",
    files: [
      { relPath: "XPZiba/XPZiba-Regular.woff2", weight: "400" },
      { relPath: "XPZiba/XPZiba-Bold.woff2", weight: "700" },
    ],
  },
];

export const DEFAULT_FONT_ID = "hakaza";

const byId = new Map(FONT_CATALOG.map((f) => [f.id, f]));

export function getFontById(id: string): FontEntry | undefined {
  return byId.get(id);
}

export function listFontOptions(): { value: string; label: string }[] {
  return FONT_CATALOG.map((f) => ({ value: f.id, label: f.label }));
}

export function resolveFontId(id: string | undefined | null): string {
  if (id && byId.has(id)) return id;
  return DEFAULT_FONT_ID;
}

export function resolveFontIds(ids: {
  headerId: string;
  headingId: string;
  bodyId: string;
}): FontEntry[] {
  const unique = new Set([
    resolveFontId(ids.headerId),
    resolveFontId(ids.headingId),
    resolveFontId(ids.bodyId),
  ]);
  return [...unique]
    .map((id) => byId.get(id))
    .filter((f): f is FontEntry => Boolean(f));
}
