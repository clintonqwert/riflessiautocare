interface PageHeroProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
}

export function PageHero({ eyebrow, heading, subheading }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-surface pt-28 pb-16 md:pt-40 md:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="relative mx-auto max-w-container px-5 md:px-8">
        <div className="max-w-[720px]">
          {eyebrow && (
            <p
              className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
              style={{ animationDelay: "0ms" }}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="text-display-sm md:text-display font-medium tracking-tight text-fg text-balance motion-safe:animate-[riseIn_0.5s_ease-out_both]">
            {heading}
          </h1>
          <div
            aria-hidden
            className="riflesso-line mt-7 w-28 motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: "120ms" }}
          />
          {subheading && (
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
              style={{ animationDelay: "160ms" }}
            >
              {subheading}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
