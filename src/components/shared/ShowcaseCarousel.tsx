"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ShowcaseItem } from "@/lib/content/showcase";

/**
 * Finished cars, as a horizontally scrolling strip.
 *
 * The scrolling itself is CSS scroll-snap on an overflow container, so it works
 * with touch, trackpad, and keyboard before any JavaScript runs — the arrows
 * are an addition for mouse users, not the mechanism. That ordering is why
 * there is no transform-based track and no index state driving position: the
 * DOM scroll position is the single source of truth, and the buttons just nudge
 * it.
 *
 * The container is a labelled, focusable region so keyboard users can reach it
 * and arrow through, which a bare `overflow-x-auto` div does not give you.
 */

export function ShowcaseCarousel({
  items,
  eyebrow,
  heading,
  lede,
}: {
  items: ShowcaseItem[];
  eyebrow: string;
  heading: string;
  lede?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const nudge = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // One card plus its gap, so a press always lands on a snap point.
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  if (!items.length) return null;

  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-pill border border-line-strong bg-overlay text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-35";

  return (
    <section className="bg-raised py-24 md:py-32" aria-labelledby="showcase-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            id="showcase-heading"
            eyebrow={eyebrow}
            heading={heading}
            lede={lede}
          />
          {/* Hidden from assistive tech: the region below is directly
              scrollable, so announcing these would offer a second, redundant
              way to do the same thing. */}
          <div className="hidden shrink-0 gap-2 md:flex" aria-hidden>
            <button type="button" onClick={() => nudge(-1)} disabled={atStart} className={arrow}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">Previous</span>
            </button>
            <button type="button" onClick={() => nudge(1)} disabled={atEnd} className={arrow}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">Next</span>
            </button>
          </div>
        </div>

        <ul
          ref={trackRef}
          onScroll={sync}
          tabIndex={0}
          role="region"
          aria-label={`${heading} — ${items.length} photos, scrollable`}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [scrollbar-width:thin]"
        >
          {items.map((item, i) => (
            <li
              key={item.src}
              className="w-[78vw] shrink-0 snap-start sm:w-[52vw] md:w-[38%] lg:w-[30%]"
            >
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 38vw, 78vw"
                    loading={i < 2 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </div>
                {item.caption && (
                  <figcaption className="mt-3 text-sm leading-relaxed text-muted">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
