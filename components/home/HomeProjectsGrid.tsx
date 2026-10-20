import Image from "next/image";
import Link from "next/link";
import type { HomeProjectCard } from "@/lib/home-fake";

type HomeProjectsGridProps = {
  items: HomeProjectCard[];
};

export function HomeProjectsGrid({ items }: HomeProjectsGridProps) {
  return (
    <section className="home-shahin-projects" aria-labelledby="home-projects-title">
      <h2 id="home-projects-title" className="home-shahin-section-title">
        درباره من و پروژه‌ها
      </h2>
      <div className="home-shahin-projects-grid">
        {items.map((item) => (
          <Link key={item.title} href={item.href} className="home-shahin-project-card">
            <span className="home-shahin-project-media">
              <Image
                src={item.image}
                alt=""
                width={320}
                height={200}
                className="home-shahin-project-img"
              />
            </span>
            <span className="home-shahin-project-label">{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
