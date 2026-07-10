import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/button";
import { VEHICLE_SIZE_LABELS, type PricingPackage } from "@/types/content";

function formatCad(value: number) {
  return `$${value}`;
}

export function FeaturedPackages({ packages }: { packages: PricingPackage[] }) {
  return (
    <section className="bg-surface py-24 md:py-32" aria-labelledby="packages-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="packages-heading"
          eyebrow="Pacchetti"
          heading="Priced by the vehicle, not the mood."
          lede="Exact prices per vehicle size — what's listed is what most vehicles pay, agreed before the work starts."
          align="center"
        />
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 items-stretch gap-5 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <div key={pkg.service} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
              <Card
                hover={!pkg.featured}
                className={`flex h-full flex-col p-6 ${
                  pkg.featured ? "border-accent/50 shadow-accent" : ""
                }`}
              >
                {pkg.featured && (
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                    The Riflessi standard
                  </p>
                )}
                <h3 className="font-sans text-lg font-semibold text-fg">{pkg.name}</h3>
                <p className="mt-1 text-sm text-muted">{pkg.tagline}</p>
                <p className="mt-5">
                  <span className="font-serif text-4xl font-medium text-fg">
                    {formatCad(pkg.prices["coupe-sedan"])}
                  </span>
                  <span className="ml-1.5 text-sm text-muted">
                    {VEHICLE_SIZE_LABELS["coupe-sedan"].toLowerCase()}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatCad(pkg.prices["suv-crossover"])} SUV ·{" "}
                  {formatCad(pkg.prices["truck-van"])} truck &amp; van · {pkg.duration}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm leading-snug text-muted">
                      <span aria-hidden className="mt-0.5 text-accent">
                        —
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${pkg.service}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  What&apos;s included <span aria-hidden>→</span>
                </Link>
              </Card>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center" data-reveal>
          <Link href="/pricing" className={buttonClasses({ variant: "secondary", size: "md" })}>
            All packages &amp; add-ons
          </Link>
        </div>
      </div>
    </section>
  );
}
