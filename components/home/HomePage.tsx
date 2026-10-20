import type { HomeProjectCard, HomeSection } from "@/lib/home-fake";
import { HomeHero } from "./HomeHero";
import { HomeLinkSection } from "./HomeLinkSection";
import { HomeProjectsGrid } from "./HomeProjectsGrid";
import { HomeTopBar } from "./HomeTopBar";

type HomePageProps = {
  sections: HomeSection[];
  projects: HomeProjectCard[];
};

export function HomePage({ sections, projects }: HomePageProps) {
  return (
    <div className="home-shahin" dir="rtl" lang="fa">
      <div className="home-shahin-shell">
        <HomeTopBar />
      </div>
      <HomeHero />
      <div className="home-shahin-shell home-shahin-shell--body">
        <div className="home-shahin-body">
          {sections.map((section) => (
            <HomeLinkSection key={section.id} section={section} />
          ))}
          {projects.length > 0 ? (
            <HomeProjectsGrid items={projects} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
