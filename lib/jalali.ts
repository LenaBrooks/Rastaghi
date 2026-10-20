import { toPersianDigits } from "./persian";

const WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

const FORMAT_CLASSES: Record<string, string> = {
  "%A": "weekday",
  "%a": "weekday",
  "%B": "month",
  "%b": "month",
  "%d": "day",
  "%e": "day",
  "%Y": "year",
  "%y": "year",
  "%m": "month-num",
  "%H": "hour",
  "%M": "minute",
};

/** Parse wall-clock ISO as UTC so %H/%M never shift by +03:30. */
function parseDateInput(dateInput: string | Date): Date {
  if (typeof dateInput !== "string") {
    return new Date(
      Date.UTC(
        dateInput.getUTCFullYear(),
        dateInput.getUTCMonth(),
        dateInput.getUTCDate(),
        dateInput.getUTCHours(),
        dateInput.getUTCMinutes(),
        dateInput.getUTCSeconds(),
      ),
    );
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
  }
  const match = dateInput.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (match) {
    return new Date(
      Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6] ?? 0),
      ),
    );
  }
  const parsed = new Date(dateInput);
  return Number.isNaN(parsed.getTime())
    ? new Date()
    : new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate(),
          parsed.getUTCHours(),
          parsed.getUTCMinutes(),
          parsed.getUTCSeconds(),
        ),
      );
}

function formatToken(spec: string, time: Date, jy: number, jm: number, jd: number, weekday: number): string {
  switch (spec) {
    case "%A":
      return WEEKDAYS[weekday];
    case "%a":
      return WEEKDAYS[weekday][0] ?? "";
    case "%B":
    case "%b":
      return MONTHS[jm - 1];
    case "%d":
      return String(jd).padStart(2, "0");
    case "%e":
      return String(jd).padStart(2, " ");
    case "%Y":
      return String(jy);
    case "%y":
      return String(jy % 100).padStart(2, "0");
    case "%m":
      return String(jm).padStart(2, "0");
    case "%H":
      // Wall-clock hours (UTC parts — matches how we store author time)
      return String(time.getUTCHours()).padStart(2, "0");
    case "%M":
      return String(time.getUTCMinutes()).padStart(2, "0");
    default:
      return spec;
  }
}

/** Gregorian → Jalali (same algorithm as old persian_tools.rb). */
export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): [number, number, number] {
  const gCumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gCumulative[gm - 1];

  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return [jy, jm, jd];
}

export function formatJalali(
  dateInput: string | Date,
  format = "%d %b %Y",
): string {
  const time = parseDateInput(dateInput);
  const [jy, jm, jd] = gregorianToJalali(
    time.getUTCFullYear(),
    time.getUTCMonth() + 1,
    time.getUTCDate(),
  );
  const weekday = (time.getUTCDay() + 1) % 7;

  const result = format.replace(/%[AaBbdeYymHM]/g, (spec) =>
    formatToken(spec, time, jy, jm, jd, weekday),
  );

  return toPersianDigits(result);
}

export function jalaliDateHtml(
  dateInput: string | Date,
  format = "%d %b %Y",
): { datetime: string; title: string; html: string } {
  const time = parseDateInput(dateInput);
  const [jy, jm, jd] = gregorianToJalali(
    time.getUTCFullYear(),
    time.getUTCMonth() + 1,
    time.getUTCDate(),
  );
  const weekday = (time.getUTCDay() + 1) % 7;

  const html = format.replace(/%[AaBbdeYymHM]/g, (spec) => {
    const value = formatToken(spec, time, jy, jm, jd, weekday);
    const cls = FORMAT_CLASSES[spec] ?? "date-part";
    return `<span class="${cls}">${toPersianDigits(value)}</span>`;
  });

  const gregorian = time.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    datetime: time.toISOString(),
    title: `\u200E${gregorian}`,
    html,
  };
}
