"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types/content";

/**
 * Before/after comparison with a draggable divider.
 *
 * The "after" image sits underneath and the "before" is clipped over it, so
 * dragging right reveals more of the finished car. That direction matters: the
 * payoff should arrive as you push, not retreat.
 *
 * Accessibility is the whole reason this is a `role="slider"` on a real
 * `<button>` rather than a bare div with pointer handlers. It is focusable,
 * arrow keys move it, Home/End jump to either extreme, and a screen reader
 * announces it as a slider with a percentage. Both images carry real alt text
 * and are in the DOM regardless of whether the handle is ever touched, so the
 * content is never gated behind an interaction.
 */

interface BeforeAfterSliderProps {
  item: GalleryItem;
  sizes?: string;
  /** Give the LCP candidate on the page priority; everything else lazy-loads. */
  priority?: boolean;
  className?: string;
}

const STEP = 4;
const BIG_STEP = 12;

export function BeforeAfterSlider({
  item,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const setFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  // Pointer events cover mouse, touch and pen in one path. Capture means the
  // drag keeps tracking after the cursor leaves the frame, which is what makes
  // dragging to the very edge feel right.
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const move = (delta: number) => {
      e.preventDefault();
      setPosition((p) => Math.min(100, Math.max(0, p + delta)));
    };
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        return move(-STEP);
      case "ArrowRight":
      case "ArrowUp":
        return move(STEP);
      case "PageDown":
        return move(-BIG_STEP);
      case "PageUp":
        return move(BIG_STEP);
      case "Home":
        e.preventDefault();
        return setPosition(0);
      case "End":
        e.preventDefault();
        return setPosition(100);
    }
  };

  const hasBoth = Boolean(item.beforeSrc && item.afterSrc);

  return (
    <figure className={className}>
      <div
        ref={frameRef}
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line select-none",
          !hasBoth && "paint-reflection",
        )}
      >
        {/* After — the base layer, fully present underneath. */}
        {item.afterSrc && (
          <Image
            src={item.afterSrc}
            alt={item.afterAlt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
            draggable={false}
          />
        )}

        {/* Before — clipped to the handle position. `inset` keeps the image at
            full frame width so the two never scale differently as it moves;
            clipping the wrapper, not the image, is what keeps them registered. */}
        {item.beforeSrc && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <Image
              src={item.beforeSrc}
              alt={item.beforeAlt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
              draggable={false}
            />
          </div>
        )}

        {/* Corner labels. They fade on approach so the handle never sits on top
            of a word. */}
        <span
          className={cn(
            "pointer-events-none absolute bottom-3 left-3 rounded-pill border border-line-strong bg-surface/70 px-3 py-1 text-xs font-medium tracking-wide text-fg backdrop-blur-sm transition-opacity",
            position < 18 && "opacity-0",
          )}
        >
          Before
        </span>
        <span
          className={cn(
            "pointer-events-none absolute right-3 bottom-3 rounded-pill border border-line-strong bg-surface/70 px-3 py-1 text-xs font-medium tracking-wide text-fg backdrop-blur-sm transition-opacity",
            position > 82 && "opacity-0",
          )}
        >
          After
        </span>

        {/* The divider and its grab handle. One control: the whole frame is the
            drag surface, and this button is what focus and keyboard land on. */}
        <button
          type="button"
          role="slider"
          aria-label={`Reveal the finished ${item.vehicle.toLowerCase()}`}
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% before, ${100 - Math.round(position)}% after`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute inset-0 h-full w-full touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 w-px bg-accent/80"
            style={{ left: `${position}%` }}
          />
          <span
            aria-hidden
            className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border border-accent bg-surface/85 text-accent shadow-accent backdrop-blur-sm"
            style={{ left: `${position}%`, top: "50%" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9.5 7 5 12l4.5 5M14.5 7l4.5 5-4.5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <figcaption className="mt-3" id={labelId}>
        <span className="block text-sm font-semibold text-fg">{item.vehicle}</span>
        <span className="mt-0.5 block text-sm text-muted">{item.summary}</span>
      </figcaption>
    </figure>
  );
}
