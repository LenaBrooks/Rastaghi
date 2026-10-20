import Link from "next/link";
import type { PostSummary } from "@/lib/posts/types";
import { postUrl } from "@/lib/posts";
import { JalaliDate } from "./JalaliDate";

type Group = {
  title: string;
  posts: PostSummary[];
};

type PostListProps = {
  groups: Group[];
  withExcerpt?: boolean;
  headingAsGroupTitle?: boolean;
};

export function PostList({
  groups,
  withExcerpt = false,
}: PostListProps) {
  return (
    <>
      {groups.map((group) => (
        <section key={group.title}>
          <h1>❖ &nbsp; {group.title}</h1>
          <ol className={`list-meta${withExcerpt ? " with-excerpt" : ""}`}>
            {group.posts.map((item) => (
              <li key={item.slug} className="post-list-item">
                {withExcerpt ? (
                  <>
                    <h3>
                      <Link href={postUrl(item.slug)}>{item.title}</Link>
                    </h3>
                    <p className="post-meta">
                      <JalaliDate date={item.date} />
                    </p>
                    <p>{item.excerpt}</p>
                  </>
                ) : (
                  <div className="post-list-row">
                    <Link href={postUrl(item.slug)}>{item.title}</Link>
                    <span className="list-meta-col">
                      <JalaliDate date={item.date} format="%d %b %Y" />
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
