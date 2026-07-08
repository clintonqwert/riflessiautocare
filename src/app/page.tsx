import type { Metadata } from "next";
import { buildMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { getAllServices } from "@/lib/content/services";
import { getFeaturedPackages } from "@/lib/content/pricing";
import { getProcessSteps } from "@/lib/content/process";
import { getGalleryItems } from "@/lib/content/gallery";
import { getHomeFaq } from "@/lib/content/faq/home";
import { getStats } from "@/lib/content/stats";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WhySection } from "@/components/home/WhySection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { FAQSection } from "@/components/shared/FAQSection";
import { CTABand } from "@/components/shared/CTABand";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — Car Detailing Studio | Metro Vancouver`,
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

  return (
    <>
      <HeroSection />
      <ServicesGrid services={services} />
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
