#!/usr/bin/env node
/**
 * Prepares a raw car GLB for the homepage stage.
 *
 *   node scripts/prepare-car-model.mjs <input.glb> [output.glb]
 *
 * Defaults the output to public/models/car-concept.glb, which is what
 * `CarModel.tsx` loads.
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

import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, quantize, reorder, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const input = process.argv[2];
const output = process.argv[3] ?? "public/models/car-concept.glb";

if (!input) {
  console.error("usage: node scripts/prepare-car-model.mjs <input.glb> [output.glb]");
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`not found: ${input}`);
  process.exit(1);
}

/** Never visible from outside a closed car. */
const DROP = /^Interior|Wiper|Engine|Seat|Pedal|Dashboard|Steering|Floormat/i;
/** The stage recolours anything matching this — see CarModel.tsx. */
const PAINT = /^Paint|body.*paint|carpaint/i;

await MeshoptEncoder.ready;

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

fs.mkdirSync(path.dirname(output), { recursive: true });
await io.write(output, doc);

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
console.log(`  dropped ${dropped} hidden nodes, ${textures} textures`);
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
