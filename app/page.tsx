import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { getHomeProjects, getHomeSections } from "@/lib/home-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default async function Page() {
  const [sections, projects] = await Promise.all([
    getHomeSections(),
    getHomeProjects(),
  ]);

  return <HomePage sections={sections} projects={projects} />;
}
