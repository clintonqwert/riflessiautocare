import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Uppercase kicker above the heading, e.g. "Servizi" */
  eyebrow?: string;
  heading: string;
  lede?: string;
  /** Center the block (defaults to left-aligned editorial) */
  align?: "left" | "center";
  /** Heading id for aria-labelledby wiring */
  id?: string;
  className?: string;
}

/**
 * Standard section opener: eyebrow, Fraunces heading, riflesso hairline,
 * optional lede. The hairline is the brand's signature detail — light
 * sweeping across paint.
 */
export function SectionHeading({
  eyebrow,
  heading,
  lede,
  align = "left",
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn("max-w-2xl", centered && "mx-auto text-center", className)}
      data-reveal
    >
      {eyebrow && (
        <p className="mb-3 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="text-3xl md:text-[2.5rem] font-medium tracking-tight leading-[1.12] text-fg text-balance"
      >
        {heading}
      </h2>
      <div
        aria-hidden
        className={cn("riflesso-line mt-6 w-24", centered && "mx-auto")}
      />
      {lede && (
        <p className="mt-5 text-lg leading-relaxed text-muted">{lede}</p>
      )}
    </div>
  );
}
