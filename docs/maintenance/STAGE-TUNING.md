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

### Form — rebuilds the mesh

| Value | Range | Effect |
| --- | --- | --- |
| `length` | 2.5 – 7 | Nose-to-tail. Longer reads sleeker, shorter reads like a pebble. |
| `widthScale` | 0.6 – 2.2 | Overall width. Past ~1.8 it stops reading as automotive. |
| `crownHeight` | 0.3 – 1.8 | Dome height. The single biggest silhouette change. |
| `edgeHeight` | 0 – 0.8 | The vertical wall at the base. 0 removes the rim entirely. |
| `archExponent` | 0.5 – 1.6 | How the dome meets its outline. Low values drop away almost vertically for a hard shoulder; **above 1.2** it flattens toward a tabletop. Currently shipped at the minimum, 0.5, for a deliberately sharp edge — measured at a 6.8:1 slope where 0.9 gives 2:1. The geometry check flags anything past 8:1. |
| `featureDepth` | 0 – 2.5 | Scales all five scoops and the haunch. 0 = plain dome, ~1 = shipped, 2+ = heavily sculpted. |

> **After changing anything under Form, re-run the camera-path check.** Growing
> the shape can put a camera pose inside the mesh, and because the solid renders
> front-faces only the form simply vanishes at that point in the scroll rather
> than looking obviously broken. The `craft` act is the tightest pose in the
> sequence and will always fail first. The mesh centres itself vertically from
> its own bounds, so `crownHeight` alone is safe; `length` and `widthScale` are
> the risky ones.

Individual scoop positions are the `FEATURES` array in
`paint-tester-geometry.ts` — each is a Gaussian bump in (length, width) with a
radius and an amplitude. Negative amplitude is a scoop. Not in the panel
because five features × four numbers is twenty sliders.

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

**Sculpted** — deeper scoops and a taller crown; more obviously a display form.

```
form.crownHeight  1.25    form.featureDepth  1.8
form.archExponent 0.8     form.edgeHeight    0.34
camera.fov        44
```

**Long and low** — sleeker, more like a fastback profile.

```
form.length        5.6    form.widthScale   1.12
form.crownHeight   0.72   form.archExponent 1.05
camera.fov         30
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
