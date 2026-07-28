import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbSchema, SITE_NAME } from "@/lib/seo";
import { getGalleryItems } from "@/lib/content/gallery";
import { SERVICE_LABELS } from "@/types/content";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTABand } from "@/components/shared/CTABand";
import { BeforeAfterPair } from "@/components/shared/BeforeAfterPair";

export const metadata: Metadata = buildMetadata({
  title: `Detailing Gallery — Before & After | ${SITE_NAME}`,
  description:
    "Before-and-after detailing work from the Riflessi bay in Metro Vancouver — interiors reset, paint decontaminated and polished, ceramic coatings cured under cover.",
  path: "/gallery",
});

export default function GalleryPage() {
  const items = getGalleryItems();
  // The note below disappears on its own once real photo paths land in gallery.ts.
  const awaitingPhotography = items.every(
    (item) => !item.beforeSrc && !item.afterSrc,
  );

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />
      <PageHero
        eyebrow="Il Lavoro"
        heading="Judged in the same daylight it was finished in."
        subheading="Before and after, shot side by side and left unedited. Paint either reflects properly or it doesn't — a photo cannot argue that either way."
      />

      <section className="bg-surface pb-24 md:pb-32" aria-label="Before and after work">
        <div className="mx-auto max-w-container px-5 md:px-8">
          {awaitingPhotography && (
            <p
              className="mb-12 max-w-2xl rounded-md border border-line bg-raised px-5 py-4 text-sm leading-relaxed text-muted"
              data-reveal
            >
              Riflessi is newly opened, so these frames are placeholders rather
              than stock photos of someone else&apos;s work. Each pair is filled
              in with the real vehicle as it rolls out of the bay.
            </p>
          )}

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-6 md:gap-y-16">
            {items.map((item, i) => (
              <div
                key={item.slug}
                data-reveal
                style={{ "--reveal-i": i % 2 } as React.CSSProperties}
              >
                <BeforeAfterPair item={item} />
                <Link
                  href={`/services/${item.service}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {SERVICE_LABELS[item.service]} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        headline="Want your car in the next set of frames?"
        subhead={
          "Every booking gets the bay to itself and a walkthrough at pickup.\nSend the form — you'll hear back within one business day."
        }
      />
    </>
  );
}
