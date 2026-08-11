import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Finished work — cars as they left the bay. Not before/after pairs; just the
 * result.
 *
 * Discovered from the filesystem rather than listed in code, so adding a photo
 * is dropping a file into `public/gallery/showcase/`. Captions are optional and
 * live in `captions.json` beside the images; anything without one still shows,
 * with alt text derived from its filename.
 *
 * Server-only — reads the filesystem, and the pages are static, so this runs
 * once at build.
 */

const DIR = "public/gallery/showcase";
const CAPTIONS = path.join(DIR, "captions.json");

export interface ShowcaseItem {
  src: string;
  alt: string;
  /** Shown under the photo. Optional. */
  caption?: string;
}

/**
 * `daily-driver-sedan.jpg` -> `Daily driver sedan`. A filename is a poor
 * substitute for written alt text, but it is far better than an empty string
 * or a generic "car photo" repeated twenty times.
 */
function altFromFilename(file: string): string {
  const base = path.basename(file, path.extname(file)).replace(/[-_]+/g, " ").trim();
  return base ? `${base.charAt(0).toUpperCase()}${base.slice(1)}, detailed by Riflessi` : "A vehicle detailed by Riflessi";
}

function loadCaptions(): Record<string, string> {
  if (!fs.existsSync(CAPTIONS)) return {};
  try {
    return JSON.parse(fs.readFileSync(CAPTIONS, "utf8"));
  } catch {
    // A malformed captions file should cost captions, never the gallery.
    return {};
  }
}

export function getShowcase(): ShowcaseItem[] {
  const dir = path.join(process.cwd(), DIR);
  if (!fs.existsSync(dir)) return [];

  const captions = loadCaptions();

  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map((file) => ({
      src: `/gallery/showcase/${file}`,
      alt: captions[file] ?? altFromFilename(file),
      ...(captions[file] && { caption: captions[file] }),
    }));
}
