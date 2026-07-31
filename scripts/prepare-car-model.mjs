#!/usr/bin/env node
/**
 * Prepares a raw car GLB for the homepage stage.
 *
 *   node scripts/prepare-car-model.mjs <input.glb> [basename]
 *
 * Writes public/models/<basename>-<contenthash>.glb, rewrites CAR_MODEL_URL in
 * CarModel.tsx to match, and deletes any older model. The hash matters:
 * /models/* is served immutable for a year, so reusing a filename means
 * returning visitors keep the old car indefinitely.
 *
 * Marketplace car models are built for offline rendering: full interiors,
 * dozens of 2–4K textures, often 50 MB+. None of that survives contact with a
 * homepage. This does four things, in order of how much they save:
 *
 *   1. Drops anything never visible from outside (interior, engine, wipers).
 *   2. Strips every texture — the stage assigns all materials from
 *      `stage-config.ts`, so maps are pure weight. This also removes any
 *      badges, plates or logos baked into textures, which matters because
 *      those are trademarks the model's licence does not cover.
 *   3. Welds, dedupes, prunes, reorders, quantizes.
 *   4. EXT_meshopt_compression, decoded by the decoder already bundled in
 *      three-stdlib so nothing extra is fetched at runtime.
 *
 * It deliberately does NOT simplify the mesh. Decimating a car makes it read as
 * unfinished long before it makes a useful dent in the file size.
 *
 * After running, check the report: if paint materials are not detected the
 * stage cannot recolour the car, and `PAINT_MATERIAL` in `CarModel.tsx` needs
 * adjusting to match the new asset's naming.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import {
  dedup,
  prune,
  quantize,
  reorder,
  simplifyPrimitive,
  weld,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const input = process.argv[2];
/**
 * Basename only — the content hash and extension are appended. `/models/*` is
 * served immutable for a year, so the filename MUST change when the bytes do.
 * Overwriting a fixed name means returning visitors keep the old car forever;
 * that bug shipped once already.
 */
const name = process.argv[3] ?? "car";
const outputDir = "public/models";

if (!input) {
  console.error("usage: node scripts/prepare-car-model.mjs <input.glb> [output.glb]");
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`not found: ${input}`);
  process.exit(1);
}

/** Never visible from outside a closed car — matched on node name. */
const DROP = /^Interior|Wiper|Engine|Seat|Pedal|Dashboard|Steering|Floormat/i;

/**
 * Matched on *material* name, because plenty of models name their nodes
 * `Object_41` and put all the meaning in materials.
 *
 * Two groups: cabin trim that is never seen from outside, and manufacturer
 * badging. The badging is not optional — a CC licence covers the modeller's
 * work, never the marque's trademarks, so any mesh that is a logo or a model
 * name goes.
 */
const DROP_MATERIALS =
  /^(CUIR|leather|Plastic_Dash|Seat_?Belt|Display|Vents|Steering|LOGO|EMBLEM|BADGE|CENTENARIO|Interior)/i;

/**
 * Materials worth decimating hard: high vertex counts spent on things nobody
 * looks at. Tyre tread is the usual offender — one model spent 63% of its
 * entire budget on it.
 */
const DECIMATE_MATERIALS = /^(pneu|tire|tyre|tread)/i;
const DECIMATE_RATIO = 0.12;

/** The stage recolours anything matching this — see CarModel.tsx. */
const PAINT = /^Paint|body.*colou?r|carpaint|Carbon_R/i;

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const doc = await io.read(input);
const root = doc.getRoot();

// Leaves only, repeated: disposing a parent takes its children with it, which
// silently empties the whole scene.
let dropped = 0;
for (let pass = 0; pass < 8; pass++) {
  for (const node of root.listNodes()) {
    const name = node.getName();
    if (name && DROP.test(name) && node.listChildren().length === 0) {
      node.dispose();
      dropped++;
    }
  }
}

// Cabin trim and badging, matched on material.
let droppedPrims = 0;
let droppedVerts = 0;
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const name = prim.getMaterial()?.getName() ?? "";
    if (!DROP_MATERIALS.test(name)) continue;
    droppedVerts += prim.getAttribute("POSITION")?.getCount() ?? 0;
    prim.dispose();
    droppedPrims++;
  }
}

// Decimate the vertex sinks nobody looks at, before welding merges them into
// their neighbours.
let decimatedFrom = 0;
let decimatedTo = 0;
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const name = prim.getMaterial()?.getName() ?? "";
    if (!DECIMATE_MATERIALS.test(name)) continue;
    const before = prim.getAttribute("POSITION")?.getCount() ?? 0;
    if (before < 4000) continue;
    simplifyPrimitive(prim, {
      simplifier: MeshoptSimplifier,
      ratio: DECIMATE_RATIO,
      error: 0.01,
      lockBorder: false,
    });
    decimatedFrom += before;
    decimatedTo += prim.getAttribute("POSITION")?.getCount() ?? 0;
  }
}

const textures = root.listTextures().length;
for (const texture of root.listTextures()) texture.dispose();

await doc.transform(
  weld(),
  dedup(),
  prune(),
  reorder({ encoder: MeshoptEncoder }),
  quantize(),
);

doc
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

fs.mkdirSync(outputDir, { recursive: true });
const tmp = path.join(outputDir, `.${name}.tmp.glb`);
await io.write(tmp, doc);

const hash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(tmp))
  .digest("hex")
  .slice(0, 8);
const output = path.join(outputDir, `${name}-${hash}.glb`);
fs.renameSync(tmp, output);

// Point the app at the new file and drop every older model, so nothing stale
// lingers in the bundle or the repo.
const modelSource = "src/components/cinema/CarModel.tsx";
const src = fs.readFileSync(modelSource, "utf8");
const url = `/models/${name}-${hash}.glb`;
const updated = src.replace(
  /export const CAR_MODEL_URL = "[^"]*";/,
  `export const CAR_MODEL_URL = "${url}";`,
);
if (updated !== src) {
  fs.writeFileSync(modelSource, updated);
  console.log(`\n  CAR_MODEL_URL → ${url}`);
}
for (const file of fs.readdirSync(outputDir)) {
  if (file.endsWith(".glb") && file !== path.basename(output)) {
    fs.unlinkSync(path.join(outputDir, file));
    console.log(`  removed stale ${file}`);
  }
}

const materials = root.listMaterials().map((m) => m.getName()).filter(Boolean);
const paint = materials.filter((n) => PAINT.test(n));
const verts = root
  .listMeshes()
  .flatMap((m) => m.listPrimitives())
  .reduce((sum, p) => sum + (p.getAttribute("POSITION")?.getCount() ?? 0), 0);

const before = fs.statSync(input).size;
const after = fs.statSync(output).size;
const mb = (n) => (n / 1048576).toFixed(2);

console.log(`\n  ${input} → ${output}`);
console.log(`  dropped ${dropped} hidden nodes, ${droppedPrims} trim/badge meshes (${droppedVerts.toLocaleString()} verts), ${textures} textures`);
if (decimatedFrom) {
  console.log(`  decimated tyres ${decimatedFrom.toLocaleString()} → ${decimatedTo.toLocaleString()} verts`);
}
console.log(`  ${verts.toLocaleString()} verts · ${root.listMeshes().length} meshes · ${materials.length} materials`);
console.log(`  ${mb(before)} MB → ${mb(after)} MB\n`);

if (paint.length) {
  console.log(`  paint materials detected: ${paint.join(", ")}`);
} else {
  console.log("  WARNING: no paint materials matched /^Paint|body.*paint|carpaint/i.");
  console.log("  The stage will not be able to recolour this car. Materials present:");
  console.log(`    ${materials.join(", ")}`);
  console.log("  Adjust PAINT_MATERIAL in src/components/cinema/CarModel.tsx to match.");
}
console.log("\n  Remember: update the footer credit and docs/maintenance/STAGE-MODEL.md.\n");
