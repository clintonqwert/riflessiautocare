import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, localBusinessSchema, websiteSchema } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NavBar } from "@/components/layout/NavBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StickyBookBar } from "@/components/layout/StickyBookBar";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { JsonLd } from "@/components/shared/JsonLd";
import "./globals.css";

// opsz axis = Fraunces' optical cuts at display sizes — the serif carries
// the brand voice, so the axis matters more than the extra bytes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Car Detailing | Metro Vancouver`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}
    >
      {/* pb-20 md:pb-0 reserves room for the mobile StickyBookBar */}
      <body className="flex min-h-full flex-col pb-20 md:pb-0">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-fg"
        >
          Skip to main content
        </a>
        <JsonLd schema={localBusinessSchema()} />
        <JsonLd schema={websiteSchema()} />
        <NavBar />
        <ScrollReveal />
        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <SiteFooter />
        <StickyBookBar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
