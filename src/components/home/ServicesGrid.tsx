import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SERVICE_ICONS } from "@/components/services/service-icons";
import type { DetailService } from "@/types/content";

export function ServicesGrid({ services }: { services: DetailService[] }) {
  return (
    <section className="bg-surface py-24 md:py-32" aria-labelledby="services-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="services-heading"
          eyebrow="Servizi"
          heading="Four services. Each done completely."
          lede="No fifteen-item menu, no upsell ladder — four ways to bring a car back, each one done start to finish."
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = SERVICE_ICONS[service.slug];
            return (
              <div key={service.slug} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
                <Card hover className="group flex h-full flex-col p-6">
                  <Icon className="h-7 w-7 text-accent" aria-hidden />
                  <h3 className="mt-5 font-sans text-lg font-semibold text-fg">
                    {service.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {service.excerpt}
                  </p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    What&apos;s included
                    <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5">
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
  );
}
