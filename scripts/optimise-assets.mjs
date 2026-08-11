#!/usr/bin/env node
/**
 * Prepares owner-supplied photography for the web.
 *
 *   npm run optimise-assets
 *
 * For every image: crops to the aspect the layout expects, resizes down if
 * oversized, blurs any declared licence plates, strips all metadata, and
 * recompresses.
 *
 * Two things here are about privacy rather than performance.
 *
 * The metadata strip: camera and phone JPEGs carry EXIF, and EXIF routinely
 * includes GPS. These photos are taken at a home address the site deliberately
 * withholds until a booking is confirmed, so shipping originals would publish
 * the one fact the copy protects.
 *
 * The plate blur: a customer's registration is their information, not the
 * business's, and it appears in photos they never agreed to have published.
 * Regions come from `public/gallery/redactions.json` — see scripts/lib/redact.mjs
 * for why they are declared rather than detected.
 *
 * Originals are moved to `public/gallery/_originals/` (gitignored) on first
 * run and every optimised file is regenerated from them. That makes the script
 * safely re-runnable: mark a plate you missed, run again, and the result is a
 * single clean pass rather than a recompression of a recompression.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { applyRedactions, loadManifest, unreviewed } from "./lib/redact.mjs";

const ORIGINALS = "public/gallery/_originals";

const TARGETS = [
  {
    dir: "public/gallery",
    match: /-(before|after)\.jpe?g$/i,
    width: 1600,
    height: 1200,
    label: "before/after (4:3)",
  },
  {
    dir: "public/gallery/showcase",
    match: /\.jpe?g$/i,
    width: 1600,
    height: 1200,
    label: "showcase (4:3)",
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
const manifest = loadManifest();

let processed = 0;
const problems = [];
const seen = [];

fs.mkdirSync(ORIGINALS, { recursive: true });

for (const target of TARGETS) {
  if (!fs.existsSync(target.dir)) continue;

  for (const file of fs.readdirSync(target.dir)) {
    if (!target.match.test(file)) continue;
    const live = path.join(target.dir, file);
    if (!fs.statSync(live).isFile()) continue;

    seen.push(file);

    // Keep a pristine copy the first time we see a file, and always work from
    // it thereafter, so repeated runs never stack lossy passes.
    const original = path.join(ORIGINALS, file);
    if (!fs.existsSync(original)) fs.copyFileSync(live, original);

    const source = fs.readFileSync(original);
    const meta = await sharp(source).metadata();
    const boxes = manifest[file]?.plates ?? [];

    if ((meta.width ?? 0) < target.width * 0.75) {
      problems.push(
        `${file} is only ${meta.width}px wide — it will look soft. Re-export at ${target.width}px or larger.`,
      );
    }

    // withMetadata() is deliberately never called — that is what would carry
    // EXIF, and with it GPS, into the published file.
    let buffer = await sharp(source)
      .resize(target.width, target.height, {
        fit: "cover",
        position: "centre",
        // Never invent pixels: a small source stays small and gets flagged
        // above rather than inflated into a larger, softer file.
        withoutEnlargement: true,
      })
      .toBuffer();

    buffer = await applyRedactions(buffer, boxes);

    const out = await sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    fs.writeFileSync(live, out);

    const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
    const notes = [
      meta.exif ? "EXIF stripped" : null,
      boxes.length ? `${boxes.length} plate${boxes.length > 1 ? "s" : ""} blurred` : null,
    ].filter(Boolean);
    console.log(
      `  ${file.padEnd(40)} ${target.label.padEnd(20)} ${kb(source.length)} → ${kb(out.length)}` +
        (notes.length ? `  (${notes.join(", ")})` : ""),
    );
    if (out.length > MAX_BYTES) {
      problems.push(`${file} is ${kb(out.length)} after compression — heavier than ideal.`);
    }
    processed++;
  }
}

// Video passes through untouched: re-encoding needs ffmpeg and would be a lossy
// round trip. Report weight only.
if (fs.existsSync("public/video")) {
  for (const file of fs.readdirSync("public/video")) {
    if (!/\.mp4$/i.test(file)) continue;
    const mb = fs.statSync(path.join("public/video", file)).size / 1048576;
    console.log(`  ${file.padEnd(40)} ${mb.toFixed(1)} MB`);
    if (mb > 30) {
      problems.push(
        `${file} is ${mb.toFixed(0)} MB. It only downloads on play, but that is a long wait — consider re-exporting at 1080p / ~8 Mbps.`,
      );
    }
  }
}

console.log(`\n  ${processed} image${processed === 1 ? "" : "s"} processed`);

// The important report. Anything not in the manifest has had no human decision
// recorded about whether a plate is visible in it.
const pending = unreviewed(seen, manifest);
if (pending.length) {
  console.log(`\n  ⚠ ${pending.length} image(s) not yet checked for licence plates:`);
  for (const f of pending) console.log(`      ${f}`);
  console.log(
    `\n    Open scripts/redact-tool.html in a browser, drag a box over any plate,\n` +
      `    and paste the result into public/gallery/redactions.json. If a photo has\n` +
      `    no plate in it, record that explicitly:\n\n` +
      `      "${pending[0]}": { "plates": [], "note": "no plate visible" }\n\n` +
      `    Then run this again. Until a file appears in that manifest, nobody has\n` +
      `    actually looked.`,
  );
}

if (problems.length) {
  console.log("\n  Worth a look:");
  for (const p of problems) console.log(`    - ${p}`);
}
if (!processed) {
  console.log("\n  Nothing found. See public/gallery/README.md for filenames.");
}
console.log("");
