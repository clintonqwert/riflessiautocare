"use client";

import Image from "next/image";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * The demo film, behind a click-to-load facade.
 *
 * A detailing video is easily tens of megabytes. Mounting the `<video>` on
 * first paint would have the browser start buffering it before anyone has
 * decided to watch, on a page that already carries a 2 MB car model — so
 * nothing but a poster image loads until the play button is pressed. This is
 * the same facade rule the framework already applies to third-party embeds.
 *
 * `preload="none"` on top of that is belt and braces: even after mounting, the
 * browser fetches only what playback needs.
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
}

export function VideoFeature({
  src,
  poster,
  eyebrow,
  heading,
  lede,
  description,
  captionsSrc,
}: VideoFeatureProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-surface py-24 md:py-32" aria-labelledby="film-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading id="film-heading" eyebrow={eyebrow} heading={heading} lede={lede} />

        <div className="mt-12" data-reveal>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-raised">
            {playing ? (
              <video
                src={src}
                poster={poster}
                controls
                autoPlay
                playsInline
                preload="none"
                className="h-full w-full object-cover"
              >
                {captionsSrc && (
                  <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
                )}
              </video>
            ) : (
              <>
                <Image
                  src={poster}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 80vw, 100vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="group absolute inset-0 flex items-center justify-center bg-surface/35 transition-colors hover:bg-surface/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-pill border border-accent bg-surface/80 text-accent shadow-accent backdrop-blur-sm transition-transform group-hover:scale-105">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                    </svg>
                  </span>
                  <span className="sr-only">Play the film</span>
                </button>
              </>
            )}
          </div>

          {/* The film's content in text, for anyone who cannot or will not
              watch it — and for search engines, which cannot. */}
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
