import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconKey, IconClock, IconSparkle } from "@/components/ui/icons";

/**
 * What drop-off day feels like. Testimonial slots are deliberately absent
 * until real reviews exist — no invented quotes, ever. When reviews land,
 * they render here from a content module.
 */
const MOMENTS = [
  {
    icon: IconKey,
    title: "The handover",
    body: "Morning drop-off, a walk around the car together, and a clear agreement on exactly what's being done. Then the bay is your car's for the day.",
  },
  {
    icon: IconClock,
    title: "The quiet part",
    body: "No status anxiety. You get a message when the car is ready — not a call asking to approve surprise charges halfway through.",
  },
  {
    icon: IconSparkle,
    title: "The reveal",
    body: "Pickup ends with a walkthrough in daylight, panel by panel, so you see exactly what was done before you drive home in it.",
  },
];

export function ExperienceSection() {
  return (
    <section className="bg-raised py-24 md:py-32" aria-labelledby="experience-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="experience-heading"
          eyebrow="L'Esperienza"
          heading="What a Riflessi visit feels like."
        />
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {MOMENTS.map((moment, i) => {
            const Icon = moment.icon;
            return (
              <div key={moment.title} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
                <Icon className="h-7 w-7 text-accent" aria-hidden />
                <h3 className="mt-5 font-sans text-lg font-semibold text-fg">{moment.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{moment.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
