import type { Metadata } from "next";
import { buildMetadata, breadcrumbSchema, SITE_NAME } from "@/lib/seo";
import {
  getPrivacySections,
  LEGAL_LAST_UPDATED_DISPLAY,
  LEGAL_LAST_UPDATED_ISO,
} from "@/lib/content/legal";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { LegalContent } from "@/components/shared/LegalContent";

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy — ${SITE_NAME}`,
  description:
    "What Riflessi Auto Care collects through the booking form, why it is collected, where it goes, and how to have it corrected or removed.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ])}
      />
      <PageHero
        eyebrow="Privacy"
        heading="What happens to your details."
        subheading="One form, one purpose: booking your car in. Here is exactly what it collects and where it goes."
      />
      <LegalContent
        sections={getPrivacySections()}
        updatedIso={LEGAL_LAST_UPDATED_ISO}
        updatedDisplay={LEGAL_LAST_UPDATED_DISPLAY}
      />
    </>
  );
}
