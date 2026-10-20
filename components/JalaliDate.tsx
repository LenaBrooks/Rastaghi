import { formatJalali } from "@/lib/jalali";

type JalaliDateProps = {
  date: string;
  format?: string;
};

/** One-line jalali date — no per-token spans. */
export function JalaliDate({
  date,
  format = "%d %b %Y",
}: JalaliDateProps) {
  const text = formatJalali(date, format);
  return (
    <time dateTime={date} title={text}>
      {text}
    </time>
  );
}
