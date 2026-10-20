const NUMERALS: Record<string, string> = {
  "0": "۰",
  "1": "۱",
  "2": "۲",
  "3": "۳",
  "4": "۴",
  "5": "۵",
  "6": "۶",
  "7": "۷",
  "8": "۸",
  "9": "۹",
};

export function formatBytesFa(bytes: number): string {
  const n = Math.max(0, Number(bytes) || 0);
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  if (n < 1024) {
    return `${toPersianDigits(n)} ${units[0]}`;
  }
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded =
    value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${toPersianDigits(rounded)} ${units[unit]}`;
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => NUMERALS[d] ?? d);
}
