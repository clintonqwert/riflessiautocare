import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { getAllServices } from "@/lib/content/services";
import { getFeaturedPackages } from "@/lib/content/pricing";
import { getProcessSteps } from "@/lib/content/process";
import { getGalleryItems } from "@/lib/content/gallery";
import { getHomeFaq } from "@/lib/content/faq/home";
import { getStats } from "@/lib/content/stats";
import { getCinemaActs } from "@/lib/content/cinema";
import { PRIMARY_CTA } from "@/lib/content/navigation";
import { CinematicSequence } from "@/components/cinema/CinematicSequence";
import { ServiceCards } from "@/components/home/ServiceCards";
import { WhySection } from "@/components/home/WhySection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { FAQSection } from "@/components/shared/FAQSection";
import { CTABand } from "@/components/shared/CTABand";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — Car Detailing | Metro Vancouver`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  const services = getAllServices();
  const packages = getFeaturedPackages();
  const steps = getProcessSteps();
  const gallery = getGalleryItems();
  const faq = getHomeFaq();
  const stats = getStats();
  const acts = getCinemaActs();

  return (
    <>
      {/*
        Slots are server-rendered and handed to the client sequence as props,
        so the service links and CTAs are in the HTML whether or not the 3D
        stage ever loads.
      */}
      <CinematicSequence
        acts={acts}
        slots={{
          arrival: (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={PRIMARY_CTA.href}
                className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}
              >
                {PRIMARY_CTA.label}
              </Link>
              <Link
                href="/pricing"
                className={buttonClasses({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                See Packages &amp; Pricing
              </Link>
            </div>
          ),
          services: <ServiceCards services={services} />,
          invitation: (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={PRIMARY_CTA.href}
                className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}
              >
                {PRIMARY_CTA.label}
              </Link>
              <Link
                href="/gallery"
                className={buttonClasses({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                See the work
              </Link>
            </div>
          ),
        }}
      />

      {/* Depth below the sequence — the substance a booking decision needs. */}
      <WhySection stats={stats} />
      <ProcessSection steps={steps} />
      <GalleryPreview items={gallery} />
      <FeaturedPackages packages={packages} />
      <ExperienceSection />
      <FAQSection items={faq} />
      <CTABand />
    </>
  );
}
