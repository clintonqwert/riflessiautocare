"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * A video behind a click-to-load facade.
 *
 * A detailing film is easily tens of megabytes. Mounting the `<video>` on first
 * paint would have the browser start buffering before anyone has decided to
 * watch, on pages that already carry a 2 MB car model — so nothing but a poster
 * image loads until the play button is pressed, and `preload="none"` keeps even
 * the mounted element to what playback actually needs.
 *
 * Shared by the film section and the gallery hero so the two cannot drift: a
 * fix to the loading behaviour or the keyboard handling lands in both.
 */

interface VideoFacadeProps {
  /** Path under /public, e.g. "/video/detail-demo.mp4". */
  src: string;
  /** Still frame shown before playback. Same aspect as the film. */
  poster: string;
  /** WebVTT captions under /public. Strongly recommended if there is speech. */
  captionsSrc?: string;
  /** Rendered widths, for the poster's srcset. */
  sizes?: string;
  /** Load the poster eagerly — set only when the frame is above the fold. */
  priority?: boolean;
  /** Accessible name for the play control. */
  label?: string;
}

export function VideoFacade({
  src,
  poster,
  captionsSrc,
  sizes = "(min-width: 768px) 80vw, 100vw",
  priority = false,
  label = "Play the film",
}: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // The button that received the click unmounts on activation, so without this
  // the focus ring lands back on <body> and a keyboard user loses their place.
  useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <video
        ref={videoRef}
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
    );
  }

  return (
    <>
      <Image
        src={poster}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
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
        <span className="sr-only">{label}</span>
      </button>
    </>
  );
}
