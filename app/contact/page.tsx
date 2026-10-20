import type { Metadata } from "next";
import { ShahinShell } from "@/components/home/ShahinShell";
import { getHomeNavItems } from "@/lib/home-data";
import { renderMarkdown } from "@/lib/markdown";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = await getSetting("contact.title");
  return {
    title: title || "تماس با ما",
  };
}

export default async function ContactPage() {
  const [title, body, navItems] = await Promise.all([
    getSetting("contact.title"),
    getSetting("contact.body"),
    getHomeNavItems(),
  ]);
  const html = renderMarkdown(body || "");

  return (
    <ShahinShell navItems={navItems}>
      <article className="shahin-post">
        <header className="shahin-post-header">
          <h1 className="shahin-post-title">{title || "تماس با ما"}</h1>
        </header>
        <div
          className="shahin-post-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </ShahinShell>
  );
}
