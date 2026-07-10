'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global observer for [data-reveal] elements (styles in globals.css).
 * Renders nothing; mounted once in the root layout. Re-runs per route so
 * client navigations get entrances too.
 *
 * Once an entrance finishes, the data-reveal attribute is removed — the
 * reveal rule's transition would otherwise permanently override the
 * element's own transition utilities (e.g. card border hovers).
 */

// 350ms transition + max stagger delay + margin.
const CLEANUP_MS = 900;

function cleanup(el: Element) {
  el.removeAttribute('data-reveal');
  el.classList.remove('is-revealed');
}

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)'),
    );
    // Anything already in the viewport never needs an entrance: release it
    // from the reveal selector *before* html.js enables the hidden state —
    // visible content never flashes and keeps its own transitions.
    const below: HTMLElement[] = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        cleanup(el);
      } else {
        below.push(el);
      }
    }
    document.documentElement.classList.add('js');

    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
            timers.push(setTimeout(() => cleanup(entry.target), CLEANUP_MS));
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );
    for (const el of below) io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
