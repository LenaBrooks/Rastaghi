import Image from "next/image";
import type { HomeHeroContent } from "@/lib/home-data";

type HomeHeroProps = {
  hero: HomeHeroContent;
};

export function HomeHero({ hero }: HomeHeroProps) {
  return (
    <section
      className="home-shahin-hero"
      aria-label="معرفی"
      style={{ ["--hero-pattern" as string]: `url(${hero.pattern})` }}
    >
      <div className="home-shahin-hero-inner">
        <div className="home-shahin-portrait-wrap">
          <Image
            src={hero.portrait}
            alt={hero.name}
            width={370}
            height={590}
            priority
            className="home-shahin-portrait"
          />
        </div>
        <div className="home-shahin-identity">
          <div className="home-shahin-name-box">{hero.name}</div>
          <div className="home-shahin-tag-box">{hero.tagline}</div>
        </div>
      </div>
    </section>
  );
}
