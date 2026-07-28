import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buildMetadata,
  breadcrumbSchema,
  serviceSchema,
} from "@/lib/seo";
import { getAllServices, getServiceBySlug } from "@/lib/content/services";
import { getPackageForService } from "@/lib/content/pricing";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTABand } from "@/components/shared/CTABand";
import { FAQSection } from "@/components/shared/FAQSection";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/button";
import { SERVICE_ICONS } from "@/components/services/service-icons";
import {
  VEHICLE_SIZES,
  VEHICLE_SIZE_LABELS,
  type ServiceSlug,
} from "@/types/content";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllServices().map((service) => ({ slug: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug as ServiceSlug);
  if (!service) return {};
  return buildMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug as ServiceSlug);
  if (!service) notFound();

  const pkg = getPackageForService(service.slug);
  const pairs = service.pairsWith
    .map((pairSlug) => getServiceBySlug(pairSlug))
    .filter((pair) => pair !== undefined);

  return (
    <>
      <JsonLd schema={serviceSchema(service)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />

      <PageHero
        eyebrow="Servizi"
        heading={service.name}
        subheading={service.outcome}
      />

      {/* Why it's done this way */}
      <section
        className="bg-surface pb-20 md:pb-28"
        aria-labelledby="benefits-heading"
      >
        <div className="mx-auto max-w-container px-5 md:px-8">
          <h2 id="benefits-heading" className="sr-only">
            Why {service.name.toLowerCase()} at Riflessi
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {service.benefits.map((benefit, i) => (
              <div
                key={benefit}
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
              >
                <Card className="h-full p-6">
                  <span
                    aria-hidden
                    className="font-serif text-2xl font-medium text-accent"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-base leading-relaxed text-fg">
                    {benefit}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section
        className="bg-surface pb-20 md:pb-28"
        aria-labelledby="included-heading"
      >
        <div className="mx-auto max-w-container px-5 md:px-8">
          <SectionHeading
            id="included-heading"
            eyebrow="Incluso"
            heading="What's included."
            lede="Every step below happens on every visit — it's the service, not an add-on menu."
          />
          <ul
            className="mt-10 grid max-w-4xl grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2"
            data-reveal
          >
            {service.included.map((item) => (
              <li
                key={item}
                className="flex gap-3 border-b border-line pb-4 text-base leading-relaxed text-muted"
              >
                <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing for this service */}
      <section
        className="bg-surface pb-20 md:pb-28"
        aria-labelledby="service-pricing-heading"
      >
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div data-reveal>
            <Card className="mx-auto max-w-4xl p-7 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-sm">
                  <h2
                    id="service-pricing-heading"
                    className="font-sans text-xl font-semibold text-fg"
                  >
                    {pkg.name} — exact pricing
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {pkg.tagline} Priced by vehicle size and agreed before the
                    work starts. Hands-on time: {pkg.duration}.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/contact"
                      className={buttonClasses({ size: "md" })}
                    >
                      Book this service
                    </Link>
                    <Link
                      href="/pricing"
                      className={buttonClasses({ variant: "ghost", size: "md" })}
                    >
                      All packages &amp; add-ons →
                    </Link>
                  </div>
                </div>
                <dl className="flex flex-1 flex-col divide-y divide-line md:max-w-xs">
                  {VEHICLE_SIZES.map((size) => (
                    <div
                      key={size}
                      className="flex items-baseline justify-between py-3"
                    >
                      <dt className="text-sm text-muted">
                        {VEHICLE_SIZE_LABELS[size]}
                      </dt>
                      <dd className="font-serif text-2xl font-medium text-fg">
                        ${pkg.prices[size]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pairs well with */}
      {pairs.length > 0 && (
        <section
          className="bg-surface pb-20 md:pb-28"
          aria-labelledby="pairs-heading"
        >
          <div className="mx-auto max-w-container px-5 md:px-8">
            <SectionHeading
              id="pairs-heading"
              eyebrow="Abbinamenti"
              heading="Pairs well with."
            />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {pairs.map((pair, i) => {
                const Icon = SERVICE_ICONS[pair.slug];
                return (
                  <div
                    key={pair.slug}
                    data-reveal
                    style={{ "--reveal-i": i } as React.CSSProperties}
                  >
                    <Card hover className="group flex h-full flex-col p-6">
                      <Icon className="h-7 w-7 text-accent" aria-hidden />
                      <h3 className="mt-4 font-sans text-lg font-semibold text-fg">
                        {pair.name}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                        {pair.excerpt}
                      </p>
                      <Link
                        href={`/services/${pair.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        What&apos;s included
                        <span
                          aria-hidden
                          className="transition-transform duration-150 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <FAQSection
        items={service.pageFaq}
        heading={`${service.name} — what people ask.`}
      />

      <CTABand
        headline={`Ready to book the ${service.name}?`}
        subhead={
          "One vehicle at a time, by appointment.\nSend the form — you'll hear back within one business day."
        }
      />
    </>
  );
}
