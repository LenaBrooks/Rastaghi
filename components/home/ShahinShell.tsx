import type { HomeNavItem } from "@/lib/home-fake";
import { HomeTopBar } from "./HomeTopBar";

type ShahinShellProps = {
  navItems: HomeNavItem[];
  children: React.ReactNode;
  /** Optional block between topbar and main body (e.g. home hero). */
  beforeBody?: React.ReactNode;
};

export function ShahinShell({
  navItems,
  children,
  beforeBody,
}: ShahinShellProps) {
  return (
    <div className="home-shahin" dir="rtl" lang="fa">
      <div className="home-shahin-shell">
        <HomeTopBar navItems={navItems} />
      </div>
      {beforeBody}
      <div className="home-shahin-shell home-shahin-shell--body">
        {children}
      </div>
    </div>
  );
}
