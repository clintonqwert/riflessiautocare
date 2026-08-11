import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Plate redaction.
 *
 * Regions are declared by hand in `public/gallery/redactions.json` rather than
 * detected automatically. That is a deliberate choice, not a shortcut: reliable
 * plate detection needs a trained model, and a detector that misses one plate
 * in twenty is worse than no detector at all, because it manufactures
 * confidence that every photo has been cleared. A customer's plate leaking
 * because a tool "usually" catches them is not a tradeoff worth taking on
 * someone else's behalf.
 *
 * `scripts/redact-tool.html` draws the boxes; this applies them.
 */

export const MANIFEST = "public/gallery/redactions.json";

/**
 * @typedef {{[file: string]: {plates: number[][], note?: string}}} Manifest
 * Boxes are [x, y, w, h] normalised 0–1 against the *final* image, so they
 * survive any resize.
 */

export function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch (error) {
    throw new Error(
      `${MANIFEST} is not valid JSON (${error.message}). Fix or delete it — ` +
        `carrying on would silently skip every redaction in it.`,
    );
  }
}

/**
 * Pixelates then blurs each region, irreversibly.
 *
 * Pixelation first is what makes it safe: a blur alone is a reversible
 * convolution in principle and is often plainly readable in practice. Dropping
 * the region to a handful of pixels destroys the information outright; the
 * blur afterwards is only so the result looks intentional rather than broken.
 */
export async function applyRedactions(pipelineBuffer, boxes) {
  if (!boxes?.length) return pipelineBuffer;

  const base = sharp(pipelineBuffer);
  const { width, height } = await base.metadata();
  if (!width || !height) return pipelineBuffer;

  const overlays = [];
  for (const [nx, ny, nw, nh] of boxes) {
    // Clamp so a box drawn slightly outside the frame cannot throw.
    const left = Math.max(0, Math.round(nx * width));
    const top = Math.max(0, Math.round(ny * height));
    const w = Math.min(width - left, Math.max(8, Math.round(nw * width)));
    const h = Math.min(height - top, Math.max(8, Math.round(nh * height)));
    if (w <= 0 || h <= 0) continue;

    // Collapse the region to a handful of blocks regardless of how large it
    // is on screen. An earlier version scaled the block size to the region
    // (w / 26), which on a big plate still left ~20 blocks across — enough
    // that the characters were plainly readable in the output. The block count
    // has to be fixed and small, or the redaction only looks like one.
    const BLOCKS_ACROSS = 5;
    const tinyW = Math.max(2, BLOCKS_ACROSS);
    const tinyH = Math.max(2, Math.round((h / w) * BLOCKS_ACROSS));

    const region = await sharp(pipelineBuffer)
      .extract({ left, top, width: w, height: h })
      .resize(tinyW, tinyH, { fit: "fill" })
      .resize(w, h, { fit: "fill", kernel: "nearest" })
      .blur(Math.max(4, Math.round(Math.min(w, h) / 4)))
      .modulate({ brightness: 0.85 })
      .toBuffer();

    overlays.push({ input: region, left, top });
  }

  if (!overlays.length) return pipelineBuffer;
  return sharp(pipelineBuffer).composite(overlays).toBuffer();
}

/** Files the manifest has no opinion about — reported so nothing ships unreviewed. */
export function unreviewed(files, manifest) {
  return files.filter((f) => !(path.basename(f) in manifest));
}
