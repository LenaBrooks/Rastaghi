import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import { ThemeScript } from "@/components/ThemeScript";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildActiveFontsCss } from "@/lib/fonts/active-css";
import { getSettingsMap } from "@/lib/settings";
import { site } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Fallback before ThemeScript; runtime sync uses --bg (light/dark + hue).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(350, 10%, 12%)" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.title,
  title: {
    default: site.title,
    template: `%s - ${site.title}`,
  },
  description: site.description,
  authors: [{ name: site.author }],
  keywords: site.keywords.split(" "),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.title,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: site.favicon },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
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
        <PwaRegister />
      </body>
    </html>
  );
}
