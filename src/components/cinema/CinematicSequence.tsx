"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type ReactNode } from "react";
import type { CinemaAct } from "@/lib/content/cinema";
import { useStageCapability } from "./capability";
import { useScrollStory } from "./useScrollStory";
import { StageFallback } from "./StageFallback";

// ssr:false has to live inside a Client Component for the code split to work
// (next/dist/docs/01-app/02-guides/lazy-loading.md). This is the boundary that
// keeps three, drei, gsap, and lenis out of the main bundle.
const PaintStage = dynamic(() => import("./PaintStage"), { ssr: false });

interface CinematicSequenceProps {
  acts: CinemaAct[];
  /**
   * Extra content rendered full-width beneath an act's copy, keyed by act id.
   * Server components can be passed straight through — that is how the service
   * cards and booking buttons stay server-rendered inside a client sequence.
   */
  slots?: Partial<Record<string, ReactNode>>;
}

function ActPanel({
  act,
  index,
  slot,
}: {
  act: CinemaAct;
  index: number;
  slot?: ReactNode;
}) {
  // The opening act carries the page's h1; the rest are siblings under it.
  const Heading = index === 0 ? "h1" : "h2";
  const headingId = `${act.id}-heading`;

  return (
    <section
      id={act.id}
      aria-labelledby={headingId}
      className="relative flex min-h-svh flex-col justify-center py-28 md:py-32"
    >
      <div className="mx-auto w-full max-w-container px-5 md:px-8">
        <div className="max-w-xl" data-reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">
            {act.eyebrow}
          </p>
          <Heading
            id={headingId}
            className={
              index === 0
                ? "mt-5 text-display-sm font-medium tracking-tight text-fg text-balance md:text-display lg:text-display-lg"
                : "mt-5 text-3xl font-medium tracking-tight text-fg text-balance md:text-[2.75rem] md:leading-[1.1]"
            }
          >
            {act.heading}
          </Heading>
          <div aria-hidden className="riflesso-line mt-7 w-24" />
          <p className="mt-6 text-lg leading-relaxed text-muted md:text-xl">
            {act.body}
          </p>
        </div>

        {slot && <div className="mt-12">{slot}</div>}
      </div>
    </section>
  );
}

/**
 * The scroll-driven homepage sequence: one sticky visual stage, seven acts of
 * real DOM copy scrolling over it.
 *
 * The copy is server-rendered and never depends on the stage — search engines,
 * reader modes, and no-JS visitors get the full narrative as ordinary
 * sections. The stage behind it is decoration that upgrades in when the device
 * can carry it.
 */
export function CinematicSequence({ acts, slots }: CinematicSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const capability = useStageCapability();
  const [stageVisible, setStageVisible] = useState(true);

  const cinematic = capability === "cinematic";
  const handleVisibility = useCallback(
    (visible: boolean) => setStageVisible(visible),
    [],
  );
  useScrollStory(containerRef, cinematic, handleVisibility);

  return (
    <div ref={containerRef} className="relative bg-surface">
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 h-svh w-full overflow-hidden"
      >
        {cinematic ? (
          <>
            {/* The canvas renders with alpha, so this gradient is what the form
                is read against. Kept in CSS rather than in the scene: free to
                render, and one place to tune the separation. */}
            <div className="stage-backdrop absolute inset-0" />
            <PaintStage active={stageVisible} />
          </>
        ) : (
          <StageFallback />
        )}

        {/*
          Legibility scrim. Copy sits in the left column, so the surface is
          darkened there and left clear on the right where the form sits —
          the contrast guarantee does not depend on what the scene renders.
        */}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-surface)_0%,color-mix(in_oklab,var(--color-surface)_72%,transparent)_38%,transparent_100%)] md:bg-[linear-gradient(100deg,var(--color-surface)_0%,color-mix(in_oklab,var(--color-surface)_88%,transparent)_30%,transparent_68%)]"
        />
      </div>

      {/* Pulled back over the sticky stage so the acts scroll across it. */}
      <div className="relative -mt-[100svh]">
        {acts.map((act, i) => (
          <ActPanel key={act.id} act={act} index={i} slot={slots?.[act.id]} />
        ))}
      </div>
    </div>
  );
}
