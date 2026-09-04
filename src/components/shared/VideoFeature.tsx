import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoFacade } from "@/components/shared/VideoFacade";

/**
 * The demo film as a standalone section, for pages that open on something else.
 *
 * The gallery opens on it instead — see `FilmHero` — so this is the mid-page
 * treatment: a section opener above, the framed film below. Loading behaviour
 * lives in `VideoFacade`.
 */

interface VideoFeatureProps {
  /** Path under /public, e.g. "/video/detail-demo.mp4". */
  src: string;
  /** Still frame shown before playback. Same aspect as the film. */
  poster: string;
  eyebrow: string;
  heading: string;
  lede?: string;
  /** Describes the film for anyone who cannot watch it. */
  description: string;
  /** WebVTT captions under /public. Strongly recommended if there is speech. */
  captionsSrc?: string;
  /** Provenance line under the frame. Travels with the film on every page. */
  note?: string;
}

export function VideoFeature({
  src,
  poster,
  eyebrow,
  heading,
  lede,
  description,
  captionsSrc,
  note,
}: VideoFeatureProps) {
  return (
    <section className="bg-surface py-24 md:py-32" aria-labelledby="film-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading id="film-heading" eyebrow={eyebrow} heading={heading} lede={lede} />

        <div className="mt-12" data-reveal>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-raised">
            <VideoFacade src={src} poster={poster} captionsSrc={captionsSrc} />
          </div>

          {/* The film's content in text, for anyone who cannot or will not
              watch it — and for search engines, which cannot. */}
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">{description}</p>

          {note && <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted/70">{note}</p>}
        </div>
      </div>
    </section>
  );
}
