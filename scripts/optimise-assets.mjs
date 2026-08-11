#!/usr/bin/env node
/**
 * Prepares owner-supplied photography for the web.
 *
 *   npm run optimise-assets
 *
 * Reads whatever is in public/gallery and public/video, and for each image:
 * crops to the aspect the layout expects, resizes down if oversized, strips
 * all metadata, and recompresses.
 *
 * The metadata strip is the part that matters most. Phone and camera JPEGs
 * carry EXIF, and EXIF routinely includes GPS coordinates. These photos are
 * taken at a home address that the site deliberately does not publish — the
 * booking flow says the address is shared only after a booking is confirmed —
 * so shipping the originals would hand out the one fact the copy withholds.
 * sharp drops all metadata unless explicitly told to keep it; this is not
 * relying on that default silently, it is the reason the script exists.
 *
 * Idempotent: already-optimised files are detected by size and skipped, so it
 * is safe to re-run after adding one new photo.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const TARGETS = [
  {
    dir: "public/gallery",
    match: /-(before|after)\.jpe?g$/i,
    width: 1600,
    height: 1200,
    label: "gallery pair (4:3)",
  },
  {
    dir: "public/video",
    match: /-poster\.jpe?g$/i,
    width: 1920,
    height: 1080,
    label: "video poster (16:9)",
  },
];

const MAX_BYTES = 420 * 1024;
let processed = 0;
let skipped = 0;
const problems = [];

for (const target of TARGETS) {
  if (!fs.existsSync(target.dir)) continue;

  for (const file of fs.readdirSync(target.dir)) {
    if (!target.match.test(file)) continue;
    const full = path.join(target.dir, file);
    const before = fs.statSync(full).size;

    const meta = await sharp(full).metadata();
    // Already at (or capped below) the target aspect and weight, with nothing
    // sensitive left in it.
    const aspect = (meta.width ?? 0) / (meta.height ?? 1);
    const wantAspect = target.width / target.height;
    const alreadyRight =
      Math.abs(aspect - wantAspect) < 0.01 &&
      (meta.width ?? 0) <= target.width &&
      before <= MAX_BYTES &&
      !meta.exif;

    if (alreadyRight) {
      skipped++;
      continue;
    }

    if ((meta.width ?? 0) < target.width * 0.75) {
      problems.push(
        `${file} is only ${meta.width}px wide — it will look soft. Re-export at ${target.width}px or larger.`,
      );
    }

    const tmp = `${full}.tmp`;
    await sharp(full)
      // withMetadata() is deliberately NOT called: that is what would carry
      // EXIF, and with it GPS, through to the public file.
      // withoutEnlargement: never invent pixels. A 1000px source stays 1000px
      // wide — upscaling adds bytes and no detail, and the width warning above
      // already tells the owner to re-export.
      .resize(target.width, target.height, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(tmp);

    fs.renameSync(tmp, full);
    const after = fs.statSync(full).size;
    const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
    console.log(
      `  ${file.padEnd(42)} ${target.label.padEnd(20)} ${kb(before)} → ${kb(after)}${meta.exif ? "  (EXIF stripped)" : ""}`,
    );
    processed++;
  }
}

// Video is passed through untouched — re-encoding needs ffmpeg and would be a
// lossy round trip. Just report if it is heavy enough to be worth compressing.
const videoDir = "public/video";
if (fs.existsSync(videoDir)) {
  for (const file of fs.readdirSync(videoDir)) {
    if (!/\.mp4$/i.test(file)) continue;
    const mb = fs.statSync(path.join(videoDir, file)).size / 1048576;
    console.log(`  ${file.padEnd(42)} ${mb.toFixed(1)} MB`);
    if (mb > 30) {
      problems.push(
        `${file} is ${mb.toFixed(0)} MB. It only downloads on play, but that is a long wait — consider re-exporting at 1080p / ~8 Mbps.`,
      );
    }
  }
}

console.log(`\n  ${processed} processed, ${skipped} already optimised`);
if (problems.length) {
  console.log("\n  Worth a look:");
  for (const p of problems) console.log(`    - ${p}`);
}
if (!processed && !skipped) {
  console.log("\n  Nothing found. See public/gallery/README.md for filenames.");
}
console.log("");
