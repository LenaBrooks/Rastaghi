import { getPosts, postUrl } from "@/lib/posts";
import { site } from "@/lib/site";

export async function GET() {
  const posts = await getPosts();
  const toAtomDate = (value: string) =>
    value.includes("T") ? `${value}:00Z` : `${value}T00:00:00Z`;

  const updated = toAtomDate(
    posts[0]?.date ?? new Date().toISOString().slice(0, 10),
  );

  const entries = posts
    .map((post) => {
      const url = `${site.url}${postUrl(post.slug)}`;
      return `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${url}" rel="alternate" type="text/html"/>
    <id>${url}</id>
    <updated>${toAtomDate(post.date)}</updated>
    <author><name>${escapeXml(site.author)}</name></author>
    <summary type="html"><![CDATA[<div dir="rtl">${post.excerpt ?? ""}</div>]]></summary>
    <content type="html"><![CDATA[<div dir="rtl">${post.html}</div>]]></content>
  </entry>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="fa">
  <title>${escapeXml(site.title)}</title>
  <subtitle>${escapeXml(site.description)}</subtitle>
  <link href="${site.url}/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${site.url}/" rel="alternate" type="text/html"/>
  <id>${site.url}/</id>
  <updated>${updated}</updated>
  ${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
