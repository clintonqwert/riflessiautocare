import type { Metadata } from "next";
import { buildMetadata, breadcrumbSchema, SITE_NAME } from "@/lib/seo";
import { getAboutPassages, getStandards, getRefusals } from "@/lib/content/about";
import { getStats } from "@/lib/content/stats";
import { BAY_FACTS, SERVICE_CITIES } from "@/lib/content/site";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTABand } from "@/components/shared/CTABand";
import { MediaFrame } from "@/components/shared/MediaFrame";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { StatsBand } from "@/components/shared/StatsBand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = buildMetadata({
  title: `About Riflessi — Car Detailing in Metro Vancouver | ${SITE_NAME}`,
  description:
    "One craftsman, one bay, one vehicle at a time. How Riflessi Auto Care works, what the standard is, and why every finish is judged in daylight.",
  path: "/about",
});

export default function AboutPage() {
  const passages = getAboutPassages();
  const standards = getStandards();
  const refusals = getRefusals();

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageHero
        eyebrow="La Storia"
        heading="One craftsman, one bay, one car."
        subheading={`${BAY_FACTS.model} in ${BAY_FACTS.areaServed}. The whole operation is built around a single idea: your car gets undivided attention, or it doesn't get booked.`}
      />

      <section className="bg-surface pb-24 md:pb-32" aria-label="The Riflessi story">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="flex flex-col gap-16 md:gap-24">
            {passages.map((passage, i) => (
              <article
                key={passage.heading}
                className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
                data-reveal
              >
                <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                  <h2 className="text-2xl font-medium tracking-tight text-fg md:text-3xl">
                    {passage.heading}
                  </h2>
                  <div aria-hidden className="riflesso-line mt-5 w-20" />
                  {passage.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-5 max-w-prose text-base leading-relaxed text-muted md:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className={i % 2 === 1 ? "md:order-1" : undefined}>
                  <MediaFrame
                    src={passage.media.src}
                    alt={passage.media.alt}
                    label={passage.media.label}
                    ratio="4/3"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  {passage.media.credit && (
                    <PhotoCredit credit={passage.media.credit} />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-raised py-24 md:py-32" aria-labelledby="standards-heading">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <SectionHeading
            id="standards-heading"
            eyebrow="Lo Standard"
            heading="Four things that happen every time."
            lede="Not a service tier or an upgrade — this is the baseline every vehicle gets, whichever package you book."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {standards.map((standard, i) => (
              <div
                key={standard.title}
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
              >
                <Card className="h-full p-7 md:p-8">
                  <h3 className="font-sans text-lg font-semibold text-fg">
                    {standard.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">
                    {standard.body}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-24 md:py-32" aria-labelledby="refusals-heading">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <SectionHeading
            id="refusals-heading"
            eyebrow="Mai"
            heading="And four things that never will."
          />
          <ul className="mt-12 flex max-w-3xl flex-col divide-y divide-line border-y border-line">
            {refusals.map((refusal, i) => (
              <li
                key={refusal}
                className="flex items-baseline gap-4 py-5"
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
              >
                <span aria-hidden className="text-lg leading-none text-accent">
                  ×
                </span>
                <span className="text-base leading-relaxed text-muted md:text-lg">
                  {refusal}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-raised py-24 md:py-32" aria-labelledby="area-heading">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <SectionHeading
            id="area-heading"
            align="center"
            eyebrow="La Zona"
            heading="Serving Metro Vancouver by drop-off."
            lede={`${BAY_FACTS.intake}. ${BAY_FACTS.addressPolicy}`}
          />
          <p
            className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-muted"
            data-reveal
          >
            Regular drop-offs come from{" "}
            <span className="text-fg">{SERVICE_CITIES.slice(0, -1).join(", ")}</span>, and{" "}
            <span className="text-fg">{SERVICE_CITIES.at(-1)}</span>.
          </p>
          <div className="mt-16">
            <StatsBand stats={getStats()} />
          </div>
        </div>
      </section>

      <CTABand
        headline="Bring it by and see the difference in daylight."
        subhead={
          "One vehicle at a time, by appointment.\nSend the form — you'll hear back within one business day."
        }
      />
    </>
  );
}
