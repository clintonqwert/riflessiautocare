import type { Metadata } from "next";
import { buildMetadata, breadcrumbSchema, SITE_NAME } from "@/lib/seo";
import {
  getTermsSections,
  LEGAL_LAST_UPDATED_DISPLAY,
  LEGAL_LAST_UPDATED_ISO,
} from "@/lib/content/legal";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { LegalContent } from "@/components/shared/LegalContent";

export const metadata: Metadata = buildMetadata({
  title: `Terms of Service — ${SITE_NAME}`,
  description:
    "How bookings, pricing, and drop-off work at Riflessi Auto Care — including what detailing can realistically achieve and what is expected on both sides.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ])}
      />
      <PageHero
        eyebrow="Terms"
        heading="How booking and drop-off work."
        subheading="Plain language, no fine print games — what you can expect, and what is expected of you on drop-off day."
      />
      <LegalContent
        sections={getTermsSections()}
        updatedIso={LEGAL_LAST_UPDATED_ISO}
        updatedDisplay={LEGAL_LAST_UPDATED_DISPLAY}
      />
    </>
  );
}
