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

### Body

The car is a licensed model, not generated geometry — see
**`STAGE-MODEL.md`** for provenance, licence, and how to replace it. Its shape
is therefore fixed; only its scale is tunable.

| Value | Range | Effect |
| --- | --- | --- |
| `length` | 3 – 12 | Overall length in scene units. The model auto-fits to this from its own bounds. |

> **Changing `length` reframes the whole sequence.** The camera poses in
> `cinema.ts` are composed for the shipped value; scale the car and every act
> is framed differently. Re-shoot before committing — see below.

### Seeing your changes

The scene can be screenshotted headlessly, which is how the camera poses were
composed. Chrome for Testing plus `puppeteer-core` driving `npm run dev`,
scrolling to a given progress, and capturing. This matters more than it sounds:
three procedural attempts at the car passed every numeric check and still
looked wrong, because geometry harnesses measure whether a mesh is *valid*, not
whether it looks good. Look at it.

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
