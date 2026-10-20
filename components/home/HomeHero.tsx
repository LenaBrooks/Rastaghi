import Image from "next/image";
import { homeHero } from "@/lib/home-fake";

export function HomeHero() {
  return (
    <section
      className="home-shahin-hero"
      aria-label="معرفی"
      style={{ ["--hero-pattern" as string]: `url(${homeHero.pattern})` }}
    >
      <div className="home-shahin-hero-inner">
        <div className="home-shahin-portrait-wrap">
          <Image
            src={homeHero.portrait}
            alt={homeHero.name}
            width={370}
            height={590}
            priority
            className="home-shahin-portrait"
          />
        </div>
        <div className="home-shahin-identity">
          <div className="home-shahin-name-box">{homeHero.name}</div>
          <div className="home-shahin-tag-box">{homeHero.tagline}</div>
        </div>
      </div>
    </section>
  );
}
