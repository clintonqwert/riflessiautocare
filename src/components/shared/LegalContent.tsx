import type { LegalSection } from "@/lib/content/legal";

interface LegalContentProps {
  sections: LegalSection[];
  /** Machine-readable date for <time dateTime> */
  updatedIso: string;
  /** Human-readable date shown to the reader */
  updatedDisplay: string;
}

/**
 * The single reading layout for legal prose — measured line length, generous
 * leading, no card chrome. Both /privacy and /terms render through this, so
 * they can never drift apart typographically.
 */
export function LegalContent({
  sections,
  updatedIso,
  updatedDisplay,
}: LegalContentProps) {
  return (
    <section className="bg-surface pb-24 md:pb-32">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <article className="max-w-[68ch]">
          <p className="text-sm text-muted">
            Last updated{" "}
            <time dateTime={updatedIso} className="text-fg">
              {updatedDisplay}
            </time>
          </p>

          <div className="mt-12 flex flex-col gap-12">
            {sections.map((section) => (
              <section key={section.heading} data-reveal>
                <h2 className="font-sans text-xl font-semibold tracking-tight text-fg">
                  {section.heading}
                </h2>
                <div aria-hidden className="riflesso-line mt-4 w-16" />

                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-5 text-base leading-relaxed text-muted"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-5 flex flex-col gap-3">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-base leading-relaxed text-muted"
                      >
                        <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                          —
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
