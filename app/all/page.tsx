import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { SiteShell } from "@/components/SiteShell";
import { getPostsGroupedByYear } from "@/lib/posts";
import { formatJalali } from "@/lib/jalali";

export const metadata: Metadata = {
  title: "همه نوشته‌ها",
};

export default async function AllPostsPage() {
  const groups = await getPostsGroupedByYear();

  return (
    <SiteShell>
      <PostList
        groups={groups.map((g) => ({
          title: formatJalali(`${g.year}-06-15`, "%Y"),
          posts: g.posts,
        }))}
      />
    </SiteShell>
  );
}
