import { formatJalali, jalaliDateHtml } from "@/lib/jalali";

type JalaliDateProps = {
  date: string;
  format?: string;
  /** Plain text date (no per-token spans) — safer in flex meta rows. */
  plain?: boolean;
};

export function JalaliDate({
  date,
  format = "%d %b %Y",
  plain = false,
}: JalaliDateProps) {
  const { datetime, title, html } = jalaliDateHtml(date, format);
  if (plain) {
    return (
      <time dateTime={datetime} title={title}>
        {formatJalali(date, format)}
      </time>
    );
  }
  return (
    <time
      dateTime={datetime}
      title={title}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
