# Tuning the homepage 3D stage

Every value lives in `src/components/cinema/stage-config.ts` as
`STAGE_DEFAULTS`. In development a control panel lets you drag them live.

## Using the panel

```bash
npm run dev            # then open http://localhost:3000
```

The panel appears bottom-right. Drag, then **Copy values** and paste the result
over `STAGE_DEFAULTS`. **Reset** restores the shipped values.

**If the panel does not appear**, the 3D stage is not active — the panel is
only useful alongside it. `capability.ts` requires all of:

- viewport ≥ 768 px wide
- a fine pointer (mouse/trackpad, not touch)
- `prefers-reduced-motion` not set
- ≥ 4 CPU cores, ≥ 4 GB device memory
- data saver off, and WebGL available

Widen the window or check your OS "reduce motion" setting first.

The panel is compiled out of production builds — the import sits behind a
`process.env.NODE_ENV === "development"` branch that the bundler resolves at
build time. Verified by grepping the production chunks.

## What each dial does

### Body — rebuilds the mesh

The shape is a loft: a closed cross-section swept along a silhouette profile
from nose to tail. Proportions are the front-engine coupe genre — long hood,
cab-rearward greenhouse, fastback roofline, wide rear hips. No wheels: it reads
as a design-studio clay buck, which is what it is — a surface for showing paint.

| Value | Range | Effect |
| --- | --- | --- |
| `length` | 3 – 9 | Nose to tail. |
| `width` | 0.6 – 2.6 | Overall width. |
| `height` | 0.8 – 2.6 | Scales the whole silhouette, so the roofline keeps its shape as the car gets taller. |
| `tumblehome` | 0 – 1 | How far the glasshouse pulls in above the belt line. 0 = glass flush with the flanks, 1 = a strongly tapered cabin. |
| `haunch` | 0 – 2.5 | Extra width over the rear axle. 0 removes the hips and the car reads as a hatchback. |
| `sillTuck` | 0.5 – 1 | 1 = slab sided; lower pulls the sills under so the body appears to float. |

The silhouette itself — hood line, windscreen rake, roof peak, fastback fall —
is the `SILHOUETTE` keyframe array in `car-silhouette-geometry.ts`, alongside
`BODY_WIDTH`, `ROOF_WIDTH`, and `SHOULDER_HEIGHT`. Those four curves are the
car. Editing them changes the model; nothing else needs to know.

> **After changing anything under Body, re-run the camera-path check.** Growing
> the car can put a camera pose inside the mesh, and because the body renders
> front-faces only it simply vanishes at that point in the scroll rather than
> looking obviously broken. The `craft` act rakes across the rear haunch and is
> the tightest pose in the sequence — it will always fail first. The mesh
> centres itself vertically from its own bounds, so `height` alone is safe;
> `length` and `width` are the risky ones.

### Material — applies next frame

| Value | Range | Effect |
| --- | --- | --- |
| `color` | — | Base paint. Keep it dark; reflections do the work. Lifting it past ~`#2a2a30` starts looking grey rather than black. |
| `metalness` | 0 – 1 | Flake. ~0.6 reads as metallic paint, below 0.3 as solid colour. |
| `roughnessBare` | 0 – 1 | The surface at the top of the scroll, before correction. |
| `roughnessCoated` | 0 – 0.4 | The surface at the end, coated. Lower is sharper. |
| `envIntensityCoated` | 0.2 – 5 | **The main shine dial.** Reflection strength once coated. |

### Light — re-bakes the environment map

| Value | Range | Effect |
| --- | --- | --- |
| `key` | 0 – 20 | Overhead softbox, the main brightness. |
| `sweepLeft` / `sweepRight` | 0 – 15 | The long strips whose highlights travel across the form as the camera moves. Asymmetry between them is what makes it look lit rather than rendered. |
| `bronzeRim` | 0 – 15 | Brand accent rim. Raises separation from the backdrop. |
| `fill` | 0 – 4 | **Raising this flattens everything.** Keep low for contrast. |
| `keyColor` / `bronzeColor` | — | Warm key + bronze rim is the brand look. |

### Camera & backdrop

| Value | Range | Effect |
| --- | --- | --- |
| `fov` | 18 – 70 | Low = telephoto, compressed, product-shot. High = wide, dramatic, more perspective distortion. |
| `backdrop.lift` | 40 – 100 | Percent of the centre pool mixed toward white. **Lower = brighter backdrop = more separation.** 100 removes the lift. |

## Starting points

Each block below overrides only the values listed — everything else stays at
its default.

**Showroom gloss** — wetter, higher contrast, the most "new car" of the set.

```
material.envIntensityCoated  3.4      material.roughnessCoated  0.02
material.metalness           0.72     light.key                 9
light.bronzeRim              6.5      light.fill                0.2
backdrop.lift                70
```

**Satin / stealth** — matte, understated, closer to a wrap than a coating.

```
material.roughnessBare  0.62    material.roughnessCoated  0.28
material.metalness      0.35    material.envIntensityCoated  1.1
light.key               7.5     light.fill                0.5
```

**Wide-body** — hips and shoulders pushed out, cabin pinched in.

```
form.width       1.85   form.haunch     2.0
form.tumblehome  0.8    form.sillTuck   0.78
camera.fov       44
```

**Long and low** — stretched and flattened, closer to a GT than a compact coupe.

```
form.length  7.8    form.height     1.35
form.width   1.45   form.tumblehome 0.45
camera.fov   30
```

**Maximum contrast** — hard key, near-zero fill, bright backdrop.

```
light.key        11     light.sweepLeft   6      light.sweepRight  1.4
light.bronzeRim  7      light.fill        0.1
backdrop.lift    62     material.envIntensityCoated  3.0
```

**Bronze-forward** — leans into the brand accent rather than neutral white.

```
light.bronzeColor  "#d8b878"   light.bronzeRim  7.5
light.keyColor     "#fff4e2"   material.color   "#14110d"
```

## Camera choreography is separate

The seven scroll poses — where the camera sits for each act, plus its exposure
and finish values — live in `src/lib/content/cinema.ts`, not in the panel. They
are content, and changing them changes the story rather than the look. If you
edit them, re-run the camera-path check so the camera does not end up inside
the mesh (see `docs/maintenance/FRAMEWORK.md`).
