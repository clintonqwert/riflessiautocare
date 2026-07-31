# The homepage 3D model

`public/models/car-concept.glb` — the car on the homepage stage.

## Provenance and licence

**"Lamborghini Centenario LP-770 Interior SDC"** (https://skfb.ly/6Z9tX) by
**SDC PERFORMANCE™**, licensed **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.

**CC BY requires attribution that reaches visitors**, so the credit is rendered
in the site footer, not only here. If the model is ever replaced, update both
`SiteFooter.tsx` and this file together.

### Trademarks

A CC licence covers the modeller's work. It does not, and cannot, cover
Lamborghini's marks or design rights — no modeller is able to license those.

Preparation deletes every mesh that *is* a trademark: the `LOGO`,
`CENTENARIO`, and `Steering_Wheel_Logo` materials, plus all textures, which
takes any baked-in badging with them. What remains is the vehicle's shape,
which is a recognisable Lamborghini. Using it is a business decision the owner
has taken knowingly; it is recorded here so nobody has to rediscover the
question later.

The marque-neutral alternative — a concept car with no manufacturer identity —
is in git history if that trade ever needs revisiting.

## Why a licensed model rather than procedural geometry

Three attempts were made at generating the car in code. All three read as a
blob. A convincing car needs separate glass, crisp feature lines, real arch
openings, lights and mirrors — that is modelling work, not parameter tuning.
The procedural approach is preserved in git history if it is ever wanted back.

## How it was prepared

Reduced from **19.07 MB to 2.05 MB** by `scripts/prepare-car-model.mjs`:

1. **Dropped cabin trim and badging by material name.** This asset names every
   node `Object_41`, so node-name matching finds nothing — all the meaning is in
   the materials (`CUIR`, `Plastic_Dash`, `Seat_Belt`, `LOGO`, `CENTENARIO`).
2. **Decimated the tyres**, which were **63% of the entire model** — 205k
   vertices of tread, reduced to 96k. Nothing else is simplified; decimating
   bodywork reads as unfinished long before it saves anything useful.
3. **Stripped all 7 textures.** Every material is assigned from `stage-config.ts`.
4. `weld()`, `dedup()`, `prune()`, `reorder()`, `quantize()`, then
   **`EXT_meshopt_compression`**.

Roughly 206k vertices and 35 materials remain.

The body is the `Carbon_R` material — despite the name, its bounding box spans
the whole car. `Body_Colour` exists but carries **31 vertices**, so it is some
offcut rather than the paint. This is exactly why the prep script reports which
materials it matched: guessing from names alone would have silently broken
recolouring.

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
