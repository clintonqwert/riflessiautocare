import type { Metadata } from "next";
import Link from "next/link";
import {
  buildMetadata,
  breadcrumbSchema,
  offerCatalogSchema,
  SITE_NAME,
} from "@/lib/seo";
import { getAddOns, getPricingPackages } from "@/lib/content/pricing";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTABand } from "@/components/shared/CTABand";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/button";
import {
  VEHICLE_SIZES,
  VEHICLE_SIZE_LABELS,
} from "@/types/content";

export const metadata: Metadata = buildMetadata({
  title: `Detailing Packages & Pricing — ${SITE_NAME} | Metro Vancouver`,
  description:
    "Exact detailing prices per vehicle size — interior, exterior, full detail, and ceramic coating packages plus add-ons. Agreed before the work starts.",
  path: "/pricing",
});

export default function PricingPage() {
  const packages = getPricingPackages();
  const addOns = getAddOns();

  return (
    <>
      <JsonLd schema={offerCatalogSchema(packages)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />

      <PageHero
        eyebrow="Pacchetti"
        heading="Priced by the vehicle, not the mood."
        subheading="Exact prices per vehicle size — what's listed is what most vehicles pay, agreed before the work starts. No quote games at pickup."
      />

      {/* Packages */}
      <section
        className="bg-surface pb-20 md:pb-28"
        aria-label="Detailing packages"
      >
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {packages.map((pkg, i) => (
              <div
                key={pkg.service}
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
              >
                <Card
                  hover={!pkg.featured}
                  className={`flex h-full flex-col p-6 md:p-7 ${
                    pkg.featured ? "border-accent/50 shadow-accent" : ""
                  }`}
                >
                  {pkg.featured && (
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                      The Riflessi standard
                    </p>
                  )}
                  <h2 className="font-sans text-lg font-semibold text-fg">
                    {pkg.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{pkg.tagline}</p>

                  <dl className="mt-5 flex flex-col divide-y divide-line border-y border-line">
                    {VEHICLE_SIZES.map((size) => (
                      <div
                        key={size}
                        className="flex items-baseline justify-between py-2.5"
                      >
                        <dt className="text-sm text-muted">
                          {VEHICLE_SIZE_LABELS[size]}
                        </dt>
                        <dd className="font-serif text-xl font-medium text-fg">
                          ${pkg.prices[size]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-muted">
                    Hands-on time: {pkg.duration}
                  </p>

                  <ul className="mt-5 flex flex-1 flex-col gap-2">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2 text-sm leading-snug text-muted"
                      >
                        <span aria-hidden className="mt-0.5 text-accent">
                          —
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      href="/contact"
                      className={buttonClasses({
                        variant: pkg.featured ? "primary" : "secondary",
                        size: "md",
                        className: "w-full",
                      })}
                    >
                      Book {pkg.name}
                    </Link>
                    <Link
                      href={`/services/${pkg.service}`}
                      className="inline-flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      What&apos;s included <span aria-hidden>→</span>
                    </Link>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section
        className="bg-surface pb-24 md:pb-32"
        aria-labelledby="addons-heading"
      >
        <div className="mx-auto max-w-container px-5 md:px-8">
          <SectionHeading
            id="addons-heading"
            eyebrow="Extra"
            heading="Add-ons."
            lede="Bolt onto any package. Priced for the time they actually take — not skipped, not rushed."
          />
          <ul
            className="mt-10 grid max-w-3xl grid-cols-1 gap-x-10 sm:grid-cols-2"
            data-reveal
          >
            {addOns.map((addOn) => (
              <li
                key={addOn.name}
                className="flex items-baseline justify-between gap-4 border-b border-line py-4"
              >
                <span className="text-base text-fg">{addOn.name}</span>
                <span className="shrink-0 font-serif text-xl font-medium text-fg">
                  {addOn.from && (
                    <span className="mr-1 font-sans text-sm font-normal text-muted">
                      from
                    </span>
                  )}
                  ${addOn.price}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted" data-reveal>
            Heavy soiling, pet hair throughout, or long-neglected paint can add
            time — if the car needs more than the package covers, you&apos;ll
            know the full price before any work starts.
          </p>
        </div>
      </section>

      <CTABand
        headline="Know what your car needs? Lock in a day."
        subhead={
          "One vehicle at a time, by appointment.\nSend the form — you'll hear back within one business day."
        }
        secondaryCTA={{ label: "Compare the services", href: "/services" }}
      />
    </>
  );
}
