import type { MetadataRoute } from "next";
import { getPosts, getProjects, postUrl } from "@/lib/posts";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const projects = await getProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/all",
    "/tags",
    "/categories",
    "/projects",
  ].map((path) => ({
    url: `${site.url}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const postRoutes = posts.map((post) => ({
    url: `${site.url}${postUrl(post.slug)}`,
    lastModified: post.date,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${site.url}/projects/${project.slug}`,
    lastModified: project.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
