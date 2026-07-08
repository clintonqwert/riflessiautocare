import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/lib/content/navigation";

interface CTABandProps {
  headline?: string;
  subhead?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export function CTABand({
  headline = "Ready to see your car the way it left the factory?",
  subhead = "One vehicle at a time, by appointment.\nSend the form — you'll hear back within one business day.",
  primaryCTA = PRIMARY_CTA,
  secondaryCTA = { label: "See Packages & Pricing", href: "/pricing" },
}: CTABandProps) {
  return (
    <section className="bg-accent py-16 text-accent-fg md:py-20" aria-labelledby="cta-band-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <div className="mx-auto max-w-[640px] text-center" data-reveal>
          <h2
            id="cta-band-heading"
            className="text-3xl font-medium tracking-tight leading-[1.12] text-accent-fg md:text-[2.5rem]"
          >
            {headline}
          </h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-accent-fg/80">
            {subhead}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryCTA.href}
              className={buttonClasses({ variant: "inverse", size: "lg", className: "w-full sm:w-auto" })}
            >
              {primaryCTA.label}
            </Link>
            <Link
              href={secondaryCTA.href}
              className="inline-flex h-13 w-full items-center justify-center gap-2 px-7 text-base font-medium text-accent-fg/80 underline-offset-4 transition-colors hover:text-accent-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg sm:w-auto"
            >
              {secondaryCTA.label} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
