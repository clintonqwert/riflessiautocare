import type { Metadata } from "next";
import type { DetailService, FAQItem, PricingPackage } from "@/types/content";
import {
  BAY_FACTS,
  BUSINESS_NAME,
  CONTACT_EMAIL,
  SERVICE_CITIES,
} from "@/lib/content/site";
import { VEHICLE_SIZE_LABELS, VEHICLE_SIZES } from "@/types/content";

export const SITE_NAME = BUSINESS_NAME;
// TODO(owner): confirm final production domain.
const _siteUrlFallback = "https://riflessiautocare.ca";
if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required in production — set it in Vercel environment variables before deploying.",
  );
}
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? _siteUrlFallback
).replace(/\/$/, "");
export const SITE_DESCRIPTION =
  "Private, appointment-only auto detailing serving Metro Vancouver. Drop-off only — one vehicle at a time, detailed until the finish is right.";

interface BuildMetadataInput {
  /** Full title, e.g. "Interior Detailing in Metro Vancouver — Riflessi Auto Care" */
  title: string;
  description: string;
  /** Route path starting with "/", no trailing slash */
  path: string;
  /** Path under /og/ or absolute URL; 1200×630 */
  ogImage?: string;
}

/**
 * Canonical metadata builder used by every page.
 * Canonical URLs are absolute with no trailing slash.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
}: BuildMetadataInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ---------------------------------------------------------------------------
 * JSON-LD builders — render via <JsonLd schema={...} /> (components/shared).
 * ------------------------------------------------------------------------- */

const businessRef = {
  "@type": "AutoRepair" as const,
  name: SITE_NAME,
  url: SITE_URL,
};

/**
 * Site-wide LocalBusiness node (rendered once in the root layout).
 * `AutoRepair` is schema.org's closest AutomotiveBusiness subtype with wide
 * search support; detailing is expressed through the Service nodes.
 * Address is deliberately omitted — service-area business (home bay).
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    areaServed: SERVICE_CITIES.map((city) => ({
      "@type": "City" as const,
      name: `${city}, BC`,
    })),
    knowsAbout: [
      "car detailing",
      "interior detailing",
      "exterior detailing",
      "ceramic coating",
    ],
    additionalProperty: {
      "@type": "PropertyValue",
      name: "Service model",
      value: `${BAY_FACTS.model}. ${BAY_FACTS.intake}.`,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export function serviceSchema(service: DetailService) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.primaryKeyword,
    description: service.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: businessRef,
    areaServed: BAY_FACTS.areaServed,
  };
}

export function faqSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Pricing page: every package × vehicle-size tier as an Offer. */
export function offerCatalogSchema(packages: PricingPackage[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `${SITE_NAME} — Detailing Packages`,
    url: `${SITE_URL}/pricing`,
    itemListElement: packages.flatMap((pkg) =>
      VEHICLE_SIZES.map((size) => ({
        "@type": "Offer",
        name: `${pkg.name} — ${VEHICLE_SIZE_LABELS[size]}`,
        price: pkg.prices[size],
        priceCurrency: "CAD",
        itemOffered: {
          "@type": "Service",
          name: pkg.name,
          provider: businessRef,
        },
      })),
    ),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
