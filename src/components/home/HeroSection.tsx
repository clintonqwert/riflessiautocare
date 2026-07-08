import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/lib/content/navigation";

/**
 * Full-height luxury hero — obsidian surface, bronze glow, Fraunces display.
 * LCP element (h1) animates transform-only via riseIn so paint is never
 * delayed.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden bg-surface">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />
      {/* Ground reflection — a faint bronze floor line anchoring the composition */}
      <div
        aria-hidden
        className="riflesso-line pointer-events-none absolute inset-x-0 bottom-24 mx-auto w-2/3 opacity-60"
      />
      <div className="relative mx-auto w-full max-w-container px-5 py-28 md:px-8 md:py-36">
        <div className="max-w-[780px]">
          <p
            className="mb-5 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
          >
            Private Detailing Studio · Metro Vancouver
          </p>
          <h1 className="text-display-sm font-medium tracking-tight text-fg text-balance md:text-display lg:text-display-lg motion-safe:animate-[riseIn_0.5s_ease-out_both]">
            One vehicle.
            <br />
            Undivided attention.
          </h1>
          <p
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted md:text-xl motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: "160ms" }}
          >
            Riflessi is an appointment-only detailing studio. Drop off your
            car and it gets a dedicated bay, proper lighting, and one
            craftsman&apos;s full attention — until the finish is right.
          </p>
          <div
            className="mt-10 flex flex-col gap-3 sm:flex-row motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              href={PRIMARY_CTA.href}
              className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}
            >
              {PRIMARY_CTA.label}
            </Link>
            <Link
              href="/pricing"
              className={buttonClasses({ variant: "secondary", size: "lg", className: "w-full sm:w-auto" })}
            >
              See Packages &amp; Pricing
            </Link>
          </div>
          <p
            className="mt-8 text-sm text-muted motion-safe:animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: "400ms" }}
          >
            By appointment · Drop-off only · New Westminster area
          </p>
        </div>
      </div>
    </section>
  );
}
