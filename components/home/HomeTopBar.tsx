import Image from "next/image";
import { homeHero, homeNav } from "@/lib/home-fake";

export function HomeTopBar() {
  return (
    <header className="home-shahin-topbar">
      <Image
        src={homeHero.avatar}
        alt=""
        width={88}
        height={88}
        className="home-shahin-avatar"
        priority
      />
      <nav className="home-shahin-nav" aria-label="منوی اصلی">
        {homeNav.map((item, index) => (
          <span key={item.label} className="home-shahin-nav-item">
            {index > 0 ? (
              <span className="home-shahin-nav-sep" aria-hidden>
                |
              </span>
            ) : null}
            <a href={item.href} className="home-shahin-nav-link">
              {item.label}
              {item.pin ? (
                <span className="home-shahin-nav-pin" aria-hidden>
                  {" "}
                  📌
                </span>
              ) : null}
              {item.dropdown ? (
                <span className="home-shahin-nav-caret" aria-hidden>
                  {" "}
                  ▾
                </span>
              ) : null}
            </a>
          </span>
        ))}
      </nav>
    </header>
  );
}
