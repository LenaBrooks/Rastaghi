import Link from "next/link";
import { getAllTags, tagUrl } from "@/lib/posts";

export async function TagCloud() {
  const tags = await getAllTags();
  if (!tags.length) return null;

  const max = Math.max(...tags.map((t) => t.count));
  const min = Math.min(...tags.map((t) => t.count));

  return (
    <>
      <hr />
      <div id="tag-cloud">
        {tags.map((tag) => {
          const set =
            max === min
              ? 5
              : Math.max(
                  1,
                  Math.min(
                    10,
                    Math.round(
                      1 + ((tag.count - min) / (max - min)) * 9,
                    ),
                  ),
                );
          return (
            <span key={tag.name}>
              <Link className={`set-${set}`} href={tagUrl(tag.name)}>
                {tag.name}
              </Link>{" "}
            </span>
          );
        })}
      </div>
    </>
  );
}
