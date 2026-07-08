import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatsBand } from "@/components/shared/StatsBand";
import { MediaFrame } from "@/components/shared/MediaFrame";
import type { Stat } from "@/types/content";

const REASONS = [
  {
    title: "A controlled environment, not a driveway",
    body: "Mobile detailing fights dust, weather, and whatever light the day offers. In the studio, paint is polished under inspection lighting and interiors dry properly indoors — the conditions the work deserves.",
    media: { alt: "The Riflessi studio bay under inspection lighting", label: "The studio" },
  },
  {
    title: "One car holds the studio",
    body: "There is no row of vehicles waiting behind yours. A booking reserves the whole bay for the whole visit, so nothing is rushed to make room for the next job.",
    media: { alt: "A single vehicle in the Riflessi studio bay", label: "One at a time" },
  },
  {
    title: "You know exactly who did the work",
    body: "No rotating crew, no handoffs. The person you meet at drop-off is the person who details your car and walks you around it at pickup — accountability you can shake hands with.",
    media: { alt: "Final walkthrough at vehicle pickup", label: "The craftsman" },
  },
];

export function WhySection({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-raised py-24 md:py-32" aria-labelledby="why-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="why-heading"
          eyebrow="Perché Riflessi"
          heading="Built small on purpose."
          lede="The things volume shops treat as constraints — one bay, one craftsman, appointments only — are exactly what make the work better."
        />

        <div className="mt-16 flex flex-col gap-16 md:gap-20">
          {REASONS.map((reason, i) => (
            <div
              key={reason.title}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
              data-reveal
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <h3 className="text-2xl font-medium tracking-tight text-fg md:text-3xl">
                  {reason.title}
                </h3>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-muted md:text-lg">
                  {reason.body}
                </p>
              </div>
              <MediaFrame
                alt={reason.media.alt}
                label={reason.media.label}
                ratio="4/3"
                className={i % 2 === 1 ? "md:order-1" : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-20">
          <StatsBand stats={stats} />
        </div>
      </div>
    </section>
  );
}
