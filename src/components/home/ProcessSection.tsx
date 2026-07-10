import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProcessStep } from "@/types/content";

export function ProcessSection({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="bg-surface py-24 md:py-32" aria-labelledby="process-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="process-heading"
          eyebrow="Il Processo"
          heading="Drop-off day, start to finish."
        />
        <ol className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative"
              data-reveal
              style={{ "--reveal-i": i } as React.CSSProperties}
            >
              <span className="font-serif text-display-sm font-medium leading-none text-accent/40" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-sans text-lg font-semibold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
