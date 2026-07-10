import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbSchema, SITE_NAME } from "@/lib/seo";
import { getAllServices } from "@/lib/content/services";
import { getPackageForService } from "@/lib/content/pricing";
import { BAY_FACTS } from "@/lib/content/site";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTABand } from "@/components/shared/CTABand";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/button";
import { SERVICE_ICONS } from "@/components/services/service-icons";

export const metadata: Metadata = buildMetadata({
  title: `Car Detailing Services in Metro Vancouver — ${SITE_NAME}`,
  description:
    "Interior, exterior, full detail, and ceramic coating — four services, each done start to finish by private drop-off in Metro Vancouver.",
  path: "/services",
});

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <PageHero
        eyebrow="Servizi"
        heading="Four ways to bring a car back."
        subheading={`No fifteen-item menu, no upsell ladder. ${BAY_FACTS.intake} — pick how far you want to take it.`}
      />
      <section className="bg-surface pb-24 md:pb-32" aria-label="All services">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[service.slug];
              const pkg = getPackageForService(service.slug);
              return (
                <div
                  key={service.slug}
                  data-reveal
                  style={{ "--reveal-i": i } as React.CSSProperties}
                >
                  <Card hover className="group flex h-full flex-col p-7 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <Icon className="h-8 w-8 text-accent" aria-hidden />
                      <p className="text-right text-sm text-muted">
                        from{" "}
                        <span className="font-serif text-xl font-medium text-fg">
                          ${pkg.prices["coupe-sedan"]}
                        </span>
                        <span className="block text-xs">{pkg.duration}</span>
                      </p>
                    </div>
                    <h2 className="mt-5 font-sans text-xl font-semibold text-fg">
                      {service.name}
                    </h2>
                    <p className="mt-2 text-base leading-relaxed text-muted">
                      {service.outcome}
                    </p>
                    <ul className="mt-5 flex flex-1 flex-col gap-2">
                      {service.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex gap-2 text-sm leading-snug text-muted"
                        >
                          <span aria-hidden className="mt-0.5 text-accent">
                            —
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7">
                      <Link
                        href={`/services/${service.slug}`}
                        className={buttonClasses({ variant: "secondary", size: "md" })}
                      >
                        {service.name} details
                        <span
                          aria-hidden
                          className="transition-transform duration-150 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
          <p className="mt-10 text-center text-sm text-muted" data-reveal>
            Every price is exact per vehicle size — see{" "}
            <Link
              href="/pricing"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              packages &amp; pricing
            </Link>{" "}
            for the full table and add-ons.
          </p>
        </div>
      </section>
      <CTABand
        headline="Not sure which service your car needs?"
        subhead={
          "Send the form with a note on the car's condition.\nYou'll get an honest recommendation within one business day — not an upsell."
        }
      />
    </>
  );
}
