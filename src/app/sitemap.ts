import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Only live routes are listed. As later PRs land pages, add them here:
 *   /services + /services/[slug] (from getAllServices)  — PR #2
 *   /pricing                                            — PR #2
 *   /about, /gallery, /privacy, /terms                  — PR #3
 *   /locations/[slug] (from locations.ts)               — PR #4
 *   /guides + /guides/[slug]                            — phase 2 blog hub
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (
    path: string,
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    priority,
  });

  return [entry("/", 1.0), entry("/contact", 1.0)];
}
