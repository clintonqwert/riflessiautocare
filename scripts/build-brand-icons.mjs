#!/usr/bin/env node
/**
 * Builds every icon file from the one traced mark.
 *
 *   npm run brand-icons
 *
 * Source: src/lib/riflessi-mark.json, the Riflessi "R" as a single SVG path.
 * The header and footer render the same path inline (components/ui/RiflessiMark),
 * so a change to the mark is one JSON edit plus a re-run of this script.
 *
 * Outputs (all committed):
 *   src/app/icon.svg               browser tab, any size (Next.js file convention)
 *   src/app/favicon.ico            16/32/48 px fallback for browsers without SVG icons
 *   src/app/apple-icon.png         180 px home-screen icon (iOS rounds the corners)
 *   public/brand/riflessi-logo-512.png   the `logo` in the site's JSON-LD
 *
 * Every icon is the warm-white mark on the obsidian surface, so it stays
 * visible on light and dark browser chrome alike.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const mark = JSON.parse(fs.readFileSync(path.join(ROOT, "src/lib/riflessi-mark.json"), "utf8"));

// MIRROR: NERO.surface and NERO.fg in src/lib/design-tokens.ts.
const SURFACE = "#0a0a0b";
const MARK = "#f5f2ec";

const round = (n) => Math.round(n * 10) / 10;

/**
 * A square icon with the mark centred. `fill` is the share of the icon's
 * width the mark spans: tab icons need a big mark to read at 16 px, while
 * home-screen and logo images get more breathing room.
 */
function iconSvg(fill) {
  const [, , w, h] = mark.viewBox.split(" ").map(Number);
  const side = w / fill;
  const x = (side - w) / 2;
  const y = (side - h) / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(side)} ${round(side)}">`,
    `<rect width="100%" height="100%" fill="${SURFACE}"/>`,
    `<path transform="translate(${round(x)} ${round(y)})" fill="${MARK}" d="${mark.path}"/>`,
    `</svg>`,
  ].join("");
}

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** An .ico holding PNG frames, which every current browser reads. */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + 16 * frames.length;
  const entries = frames.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]);
}

function write(relative, data) {
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`${relative}  ${(data.length / 1024).toFixed(1)} KB`);
}

const TAB_FILL = 0.78;
const ROOMY_FILL = 0.62;

write("src/app/icon.svg", `${iconSvg(TAB_FILL)}\n`);

const tabSvg = iconSvg(TAB_FILL);
const frames = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tabSvg, size) })));
write("src/app/favicon.ico", ico(frames));

write("src/app/apple-icon.png", await png(iconSvg(ROOMY_FILL), 180));
write("public/brand/riflessi-logo-512.png", await png(iconSvg(ROOMY_FILL), 512));
