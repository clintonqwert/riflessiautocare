import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // /thank-you is deliberately NOT disallowed: it carries `noindex`, and a
  // crawler can only honor noindex on a page it is allowed to crawl.
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
