import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllServices } from "@/lib/content/services";

/**
 * Only live routes are listed. As later PRs land pages, add them here:
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

  return [
    entry("/", 1.0),
    entry("/contact", 1.0),
    entry("/services", 0.9),
    ...getAllServices().map((service) =>
      entry(`/services/${service.slug}`, 0.9),
    ),
    entry("/pricing", 0.9),
  ];
}
