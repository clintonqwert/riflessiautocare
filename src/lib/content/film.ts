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
  /**
   * Provenance line shown under the frame. Present while the film is
   * illustrative rather than footage of this bay's own work; drop it once
   * the film is replaced with real footage.
   */
  note?: string;
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
    lede: "What the work looks like up close — decontamination, machine polish, the final wipe-down.",
    // Deliberately describes what is on screen and nothing more. This footage
    // is illustrative, not a recording of a customer's car, so it must not be
    // written up as a walkthrough of a particular job in this bay — the
    // photographs are the proof of work, and the note below keeps the line
    // between the two visible.
    description:
      "Close-quarters footage of the craft: paint decontaminated, machine-polished, and wiped down under low light.",
    note: "Illustrative footage — not a recording of a customer's car. Every photograph on this page was taken in the bay.",
  };
}
