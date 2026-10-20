import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import {
  getHomeHero,
  getHomeNavItems,
  getHomeProjects,
  getHomeSections,
} from "@/lib/home-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default async function Page() {
  const [navItems, sections, projects, hero] = await Promise.all([
    getHomeNavItems(),
    getHomeSections(),
    getHomeProjects(),
    getHomeHero(),
  ]);

  return (
    <HomePage
      navItems={navItems}
      sections={sections}
      projects={projects}
      hero={hero}
    />
  );
}
