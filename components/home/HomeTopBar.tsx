import Image from "next/image";
import Link from "next/link";
import { HomeSearch } from "@/components/home/HomeSearch";
import { ThemeToggle } from "@/components/ThemeControls";
import { homeHero, type HomeNavItem } from "@/lib/home-fake";

type HomeTopBarProps = {
  navItems: HomeNavItem[];
};

export function HomeTopBar({ navItems }: HomeTopBarProps) {
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
        {navItems.map((item, index) => (
          <span key={`${item.href}-${item.label}`} className="home-shahin-nav-item">
            {index > 0 ? (
              <span className="home-shahin-nav-sep" aria-hidden>
                |
              </span>
            ) : null}
            <Link href={item.href} className="home-shahin-nav-link">
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
            </Link>
          </span>
        ))}
      </nav>
      <div className="home-shahin-topbar-actions">
        <ThemeToggle className="home-shahin-theme-toggle" />
        <HomeSearch />
      </div>
    </header>
  );
}
