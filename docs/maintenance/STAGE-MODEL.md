# The homepage 3D model

`public/models/car-concept.glb` — the car on the homepage stage.

## Provenance and licence

**"Car Concept"**, © 2024 Darmstadt Graphics Group GmbH, model and textures by
Eric Chadwick. Licensed **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
Source: [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept).

**CC BY requires attribution that reaches visitors**, so the credit is rendered
in the site footer, not only here. If the model is ever replaced, update both
`SiteFooter.tsx` and this file together — or remove the credit if the
replacement does not require one.

The original also carried Khronos and 3D Commerce logos and a licence plate,
which are trademarks rather than CC-licensed content. Those were removed during
preparation, along with every texture, so nothing trademarked ships.

## Why a licensed model rather than procedural geometry

Three attempts were made at generating the car in code. All three read as a
blob. A convincing car needs separate glass, crisp feature lines, real arch
openings, lights and mirrors — that is modelling work, not parameter tuning.
The procedural approach is preserved in git history if it is ever wanted back.

## How it was prepared

Reduced from **11.2 MB to 1.14 MB** (0.86 MB gzipped) with
[glTF-Transform](https://gltf-transform.dev):

1. **Dropped the interior and the wipers.** Seats, dashboard, pedals, steering,
   floor, cage — none of it is visible from outside, and the wipers alone were
   30k vertices. Only leaf nodes were disposed; disposing a parent takes its
   children with it and empties the scene.
2. **Stripped all 14 textures.** The paint material is generated and animated in
   code, and glass and lights only need flat colours. This also removed the
   trademarked logos and plate.
3. `weld()`, `dedup()`, `prune()`, `reorder()`, `quantize()`, then
   **`EXT_meshopt_compression`** — which halved it again, from 2.3 MB to
   1.14 MB, with no geometry removed.

Roughly 99k vertices and 23 materials remain. Deliberately **not** simplified:
decimating the mesh made an already-sparse model look worse, and meshopt gets
the size down without touching detail.

`useGLTF` decodes meshopt with the decoder bundled in `three-stdlib`, so
nothing extra is fetched. `next.config.ts` serves `/models/*` with a one-year
immutable cache — without it the asset was revalidated on every visit, which
was most of why the stage felt slow.

The asset is only fetched by visitors who pass the capability gate in
`capability.ts` — desktop, fine pointer, no reduced-motion preference, 4+ cores,
WebGL available — and only after the dynamic import resolves. Everyone else
gets the CSS fallback and downloads none of it.

## How it is wired in

`CarModel.tsx` loads it and **auto-fits it to `form.length` from its own
bounds**, so the asset's native units never matter. Dropping in a different car
needs no measurement — only that its body materials are named so the paint swap
finds them.

Meshes whose material name matches `/^Paint/i` get replaced with a single
shared `MeshPhysicalMaterial`, which `StageDirector` animates from bare
corrected paint to a cured coating across the scroll.

**Every other material is reassigned too**, from the `trim` block in
`stage-config.ts`. Stripping the textures left glass, rims, tyres and lamps as
flat placeholders — and the glass in particular kept its
`KHR_materials_transmission` with no map, which renders it *completely
invisible*. That is why the windshield appeared to be missing. It is now plain
tinted transparency, which also skips three's separate transmission render
pass, the most expensive thing this scene could do.

## Replacing it

Preparation is a single command:

```bash
node scripts/prepare-car-model.mjs path/to/raw.glb
```

It drops hidden geometry, strips textures, compresses with meshopt, writes to
`public/models/car-concept.glb`, and reports whether it found paint materials —
if it did not, the stage cannot recolour the car and `PAINT_MATERIAL` in
`CarModel.tsx` needs adjusting to the new asset's naming. Verified against the
current asset: it reproduces the shipped 1.14 MB file exactly.

Then:

1. **Check the licence covers commercial use.** CC BY and CC0 do;
   **NonCommercial and Editorial do not** and cannot be used on this site.
2. **Check for trademarks.** A model licence covers the modeller's work, never
   the manufacturer's marks or design rights. Stripping textures removes baked
   badges and plates; anything modelled as geometry has to be deleted by hand.
3. Update the footer credit and this file.
4. Re-shoot the sequence (see `STAGE-TUNING.md`) — a different car will need the
   camera poses in `cinema.ts` reframed, and the tuner's camera editor is the
   fastest way to do it.

### Sketchfab specifically

Downloads need authentication even for CC BY models, so the file has to be
fetched with an account and handed over — the API returns 401 without a token.
