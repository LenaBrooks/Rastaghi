import Link from "next/link";
import { toPersianDigits } from "@/lib/persian";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath?: string;
};

export function Pagination({
  page,
  totalPages,
  basePath = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <nav className="pagination">
        <Link href="/all">همه</Link>
      </nav>
    );
  }

  let start = page - 2;
  if (start < 1) start = 1;
  let end = start + 4;
  if (end > totalPages) end = totalPages;

  const hrefFor = (p: number) => {
    if (p === 1) return basePath || "/";
    return `${basePath}/page/${p}`;
  };

  return (
    <nav className="pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} title="k">
          →
        </Link>
      ) : null}

      {start > 1 ? "…" : null}

      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) =>
        p === page ? (
          <span key={p} className="is-active">
            {toPersianDigits(p)}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)}>
            {toPersianDigits(p)}
          </Link>
        ),
      )}

      {end < totalPages ? "…" : null}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} title="j">
          ←
        </Link>
      ) : null}

      <Link href="/all">همه</Link>
    </nav>
  );
}
