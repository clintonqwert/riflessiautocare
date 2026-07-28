"use client";

import { useEffect, useRef, type RefObject } from "react";
import { stageProgress } from "./scroll-progress";

/**
 * Drives the sequence from scroll position.
 *
 * GSAP ScrollTrigger owns progress; Lenis owns the feel of the scroll itself.
 * Both are dynamically imported so they land in the same lazy chunk as the
 * scene — a visitor on the static fallback never downloads either.
 *
 * Lenis runs only while this sequence is mounted, which means it is scoped to
 * the homepage. Every other route keeps native scrolling, and native scrolling
 * is what assistive tech and "find in page" behave best with.
 */
export function useScrollStory(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onVisibilityChange: (visible: boolean) => void,
): void {
  // Held in a ref so a new callback identity never tears down the driver.
  const onVisibility = useRef(onVisibilityChange);
  useEffect(() => {
    onVisibility.current = onVisibilityChange;
  }, [onVisibilityChange]);

  useEffect(() => {
    const container = containerRef.current;
    // `enabled` is false on the static fallback, so neither Lenis nor GSAP is
    // ever fetched for visitors who are not getting the scene.
    if (!container || !enabled) return;

    let disposed = false;
    let teardown = () => {};

    // Visibility is observed directly rather than inferred from the trigger,
    // so the render loop stops the moment the sequence leaves the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => onVisibility.current(entry.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    observer.observe(container);

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      const tick = (time: number) => lenis.raf(time * 1000);

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      // GSAP's lag smoothing fights Lenis' own frame pacing.
      gsap.ticker.lagSmoothing(0);

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          stageProgress.current = self.progress;
        },
      });

      teardown = () => {
        trigger.kill();
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    })();

    return () => {
      disposed = true;
      observer.disconnect();
      teardown();
    };
  }, [containerRef, enabled]);
}
