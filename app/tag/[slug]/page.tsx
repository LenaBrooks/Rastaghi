import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/PostList";
import { SiteShell } from "@/components/SiteShell";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = decodeURIComponent(slug);
  return {
    title: name,
    robots: { index: false },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);
  if (!posts.length) notFound();
  const name = decodeURIComponent(slug);

  return (
    <SiteShell>
      <PostList groups={[{ title: name, posts }]} />
    </SiteShell>
  );
}
