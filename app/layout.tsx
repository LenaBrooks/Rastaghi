import type { Metadata, Viewport } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildActiveFontsCss } from "@/lib/fonts/active-css";
import { getSettingsMap } from "@/lib/settings";
import { site } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s - ${site.title}`,
  },
  description: site.description,
  authors: [{ name: site.author }],
  keywords: site.keywords.split(" "),
  icons: {
    icon: site.favicon,
  },
  openGraph: {
    locale: site.lang,
    siteName: site.title,
    type: "website",
  },
  alternates: {
    types: {
      "application/atom+xml": "/feed.xml",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettingsMap();
  const activeFontsCss = buildActiveFontsCss({
    headerId: settings["font.header"] ?? "hakaza",
    headingId: settings["font.heading"] ?? "hakaza",
    bodyId: settings["font.body"] ?? "hakaza",
  });

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <style
          id="site-fonts"
          dangerouslySetInnerHTML={{ __html: activeFontsCss }}
        />
        <meta name="copyright" content={site.copyright} />
      </head>
      <body>
        <TooltipProvider delay={280}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
