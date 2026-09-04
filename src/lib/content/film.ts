import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * The demo film, if one has been supplied.
 *
 * Presence is detected from the filesystem at build time rather than gated
 * behind a flag someone has to remember to flip: drop the two files into
 * `public/video/` and the section appears; leave them out and the homepage
 * renders exactly as it does today. See `public/gallery/README.md`.
 *
 * This module is server-only — it reads the filesystem, and pages are static,
 * so the check runs once at build and never in a browser.
 */

const VIDEO = "/video/detail-demo.mp4";
const POSTER = "/video/detail-demo-poster.jpg";
const CAPTIONS = "/video/detail-demo.vtt";

export interface DemoFilm {
  src: string;
  poster: string;
  captionsSrc?: string;
  eyebrow: string;
  heading: string;
  lede: string;
  /** What the film shows, for anyone not watching it — and for search. */
  description: string;
}

function publicFileExists(urlPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", urlPath));
}

export function getDemoFilm(): DemoFilm | null {
  // Both are required. A video with no poster would force a download before
  // anyone chose to watch, which is the thing the facade exists to prevent.
  if (!publicFileExists(VIDEO) || !publicFileExists(POSTER)) return null;

  return {
    src: VIDEO,
    poster: POSTER,
    ...(publicFileExists(CAPTIONS) && { captionsSrc: CAPTIONS }),
    eyebrow: "Il Film",
    heading: "A detail, start to finish.",
    lede: "What actually happens between drop-off and pickup — condensed, but nothing skipped.",
    description:
      "A walkthrough of a full detail in the Riflessi bay: the arrival assessment, two-bucket hand wash, decontamination and machine polish, interior extraction, and the final walkthrough in daylight before the car goes home.",
  };
}
