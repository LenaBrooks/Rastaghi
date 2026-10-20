import { jalaliDateHtml } from "@/lib/jalali";

type JalaliDateProps = {
  date: string;
  format?: string;
};

export function JalaliDate({
  date,
  format = "%d %b %Y",
}: JalaliDateProps) {
  const { datetime, title, html } = jalaliDateHtml(date, format);
  return (
    <time
      dateTime={datetime}
      title={title}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
