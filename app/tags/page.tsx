import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { SiteShell } from "@/components/SiteShell";
import { getAllTags, getPostSummaries } from "@/lib/posts";

export const metadata: Metadata = {
  title: "برچسب‌ها",
};

export default async function TagsPage() {
  const tags = await getAllTags();
  const posts = await getPostSummaries();
  const untagged = posts.filter((p) => p.tags.length === 0);

  const groups = tags.map((tag) => ({
    title: `#${tag.name}`,
    posts: posts.filter((p) => p.tags.includes(tag.name)),
  }));

  if (untagged.length) {
    groups.push({ title: "بدون برچسب", posts: untagged });
  }

  return (
    <SiteShell>
      <PostList groups={groups} />
    </SiteShell>
  );
}
