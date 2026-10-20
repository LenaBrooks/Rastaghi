import { getHomeCategories } from "@/lib/categories";
import { formatJalali } from "@/lib/jalali";
import { getPosts, getProjects, postUrl } from "@/lib/posts";
import { getSetting } from "@/lib/settings";
import type { HomeLinkItem, HomeProjectCard, HomeSection } from "@/lib/home-fake";

/** Strip light markdown/markup so short posts can show as plain line text. */
function plainBodyText(markdown: string): string {
  return markdown
    .replace(/\r\n?/g, "\n")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_~#>]+/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function postToItem(
  post: {
    slug: string;
    title: string;
    date: string;
    body?: string;
  },
  mode: "title" | "body" = "title",
): HomeLinkItem {
  const fromBody = mode === "body" ? plainBodyText(post.body ?? "") : "";
  return {
    title: fromBody || post.title,
    href: postUrl(post.slug),
    meta: formatJalali(post.date, "%Y/%m/%d"),
  };
}

export async function getHomeSections(): Promise<HomeSection[]> {
  const [posts, homeCategories, featuredTitle] = await Promise.all([
    getPosts(),
    getHomeCategories(),
    getSetting("home.featured_title"),
  ]);

  const sections: HomeSection[] = [];
  const featured = posts.filter((p) => p.featured);

  if (featured.length > 0) {
    sections.push({
      id: "featured",
      title: featuredTitle || "برگزیده‌ها:",
      items: featured.slice(0, 12).map((p) => postToItem(p, "title")),
    });
  }

  for (const cat of homeCategories) {
    const items = posts
      .filter((p) => (p.categories ?? []).includes(cat.name))
      .slice(0, 12)
      .map((p) => postToItem(p, cat.homeItemMode));
    if (items.length === 0) continue;
    sections.push({
      id: `cat-${cat.slug || encodeURIComponent(cat.name)}`,
      title: cat.name,
      items,
    });
  }

  if (posts.length > 0) {
    sections.push({
      id: "latest",
      title: "آخرین نوشته‌ها",
      items: posts.slice(0, 15).map((p) => postToItem(p, "title")),
    });
  }

  return sections;
}

export async function getHomeProjects(): Promise<HomeProjectCard[]> {
  const projects = await getProjects();
  return projects.slice(0, 6).map((project, index) => ({
    title: project.title,
    href: `/projects/${project.slug}`,
    image: index % 2 === 0 ? "/01.jpg" : "/img/me.png",
  }));
}
