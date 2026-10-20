import Link from "next/link";
import type { HomeSection } from "@/lib/home-fake";

type HomeLinkSectionProps = {
  section: HomeSection;
};

export function HomeLinkSection({ section }: HomeLinkSectionProps) {
  return (
    <section className="home-shahin-section" aria-labelledby={`sec-${section.id}`}>
      <h2 id={`sec-${section.id}`} className="home-shahin-section-title">
        {section.title}
      </h2>
      <ul className="home-shahin-list">
        {section.items.map((item) => (
          <li key={`${item.href}-${item.title}`} className="home-shahin-row">
            <Link href={item.href} className="home-shahin-row-link">
              <span className="home-shahin-row-title">
                {item.badge ? (
                  <span className="home-shahin-row-badge" aria-hidden>
                    {item.badge}
                  </span>
                ) : null}
                {item.title}
              </span>
              {item.meta ? (
                <span className="home-shahin-row-meta">{item.meta}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
