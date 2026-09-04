import { VideoFacade } from "@/components/shared/VideoFacade";
import type { DemoFilm } from "@/lib/content/film";

/**
 * A page hero that opens on the film rather than on type alone.
 *
 * Same eyebrow / h1 / hairline / subheading as `PageHero`, so a visitor moving
 * between pages meets one voice — the film sits underneath it as the first
 * thing on the page instead of replacing the words.
 *
 * The frame is deliberately capped rather than run full-bleed. The film is
 * 864px wide at source, so stretching it edge to edge on a desktop display
 * would be a 3x upscale and look it. Held at this width it renders close to
 * 1:1 and stays sharp; the surrounding glow does the work a bleed would.
 */

interface FilmHeroProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  film: DemoFilm;
  /** Optional line under the frame, e.g. a provenance note. */
  note?: string;
}

export function FilmHero({ eyebrow, heading, subheading, film, note }: FilmHeroProps) {
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

        <div
          className="mt-12 max-w-[880px] motion-safe:animate-[fadeUp_0.5s_ease-out_both] md:mt-14"
          style={{ animationDelay: "220ms" }}
        >
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-raised shadow-accent">
            <VideoFacade
              src={film.src}
              poster={film.poster}
              captionsSrc={film.captionsSrc}
              sizes="(min-width: 1024px) 880px, 100vw"
              priority
            />
          </div>

          {/* What the film shows, for anyone who cannot or will not watch it —
              and for search engines, which cannot. */}
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">{film.description}</p>

          {note && <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted/70">{note}</p>}
        </div>
      </div>
    </section>
  );
}
