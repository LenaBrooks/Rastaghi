import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/PostList";
import { ShahinShell } from "@/components/home/ShahinShell";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { getHomeNavItems } from "@/lib/home-data";
import { getPostsByCategory } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return {
    title: cat?.name ?? decodeURIComponent(slug),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [cat, navItems] = await Promise.all([
    getCategoryBySlug(slug),
    getHomeNavItems(),
  ]);
  if (!cat) notFound();

  const posts = await getPostsByCategory(cat.name);

  return (
    <ShahinShell navItems={navItems}>
      <div className="shahin-list-page">
        <PostList groups={[{ title: cat.name, posts }]} />
      </div>
    </ShahinShell>
  );
}
