import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { SiteShell } from "@/components/SiteShell";
import { getAllCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "موضوعات",
};

export default async function CategoriesPage() {
  const groups = await getAllCategories();

  return (
    <SiteShell>
      <PostList
        groups={groups.map((g) => ({ title: g.name, posts: g.posts }))}
      />
    </SiteShell>
  );
}
