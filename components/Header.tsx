import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header id="site-header">
      <Link className="site-title" href="/">
        {site.title}
      </Link>
      <div className="site-header-end">
        <MobileNav />
      </div>
    </header>
  );
}
