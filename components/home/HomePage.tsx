import type { HomeHeroContent } from "@/lib/home-data";
import type {
  HomeNavItem,
  HomeProjectCard,
  HomeSection,
} from "@/lib/home-fake";
import { HomeHero } from "./HomeHero";
import { HomeLinkSection } from "./HomeLinkSection";
import { HomeProjectsGrid } from "./HomeProjectsGrid";
import { ShahinShell } from "./ShahinShell";

type HomePageProps = {
  navItems: HomeNavItem[];
  sections: HomeSection[];
  projects: HomeProjectCard[];
  hero: HomeHeroContent;
};

export function HomePage({
  navItems,
  sections,
  projects,
  hero,
}: HomePageProps) {
  return (
    <ShahinShell navItems={navItems} beforeBody={<HomeHero hero={hero} />}>
      <div className="home-shahin-body">
        {sections.map((section) => (
          <HomeLinkSection key={section.id} section={section} />
        ))}
        {projects.length > 0 ? (
          <HomeProjectsGrid items={projects} />
        ) : null}
      </div>
    </ShahinShell>
  );
}
