# Automotive Service Website Framework — V1

Riflessi Auto Care is Version 1 of a reusable website framework for local
automotive service businesses, built on the Driftpilot architecture
(github.com/clintonqwert/driftpilot-site). This doc is the reuse contract:
what stays generic, what is Riflessi-specific, and how V2 (the next client)
becomes a content + token swap.

## The three swap layers

| Layer | Location | Swap effort for a new client |
|---|---|---|
| **Theme** | `src/app/globals.css` `@theme` + `src/lib/design-tokens.ts` | Replace token *values* only. Never rename tokens; components consume semantic names (`bg-surface`, `text-accent`) exclusively. |
| **Content** | `src/lib/content/*` + `src/types/content.ts` | Rewrite the data modules (services, pricing, process, gallery, faq, stats, site facts, navigation). Pages fetch through accessors and never hardcode business facts. |
| **Fonts** | `src/app/layout.tsx` (next/font) + `--font-*` tokens | Swap the two font imports; the serif/sans split is structural. |

Everything else — components, pages, SEO builders, the lead pipeline — is the
framework and should survive re-branding untouched.

## Inherited guardrails (from Driftpilot, still binding)

1. Pages fetch through `lib/content/*` accessors; components never fetch.
2. Semantic tokens only in components; raw hex confined to
   `design-tokens.ts` consumers (currently `opengraph-image.tsx`).
3. `buildMetadata` + a `seo.ts` JSON-LD builder on every route; new schema
   types are added as builders, never inlined per-page.
4. `ScrollReveal` + `[data-reveal]` CSS is never rewritten (encodes no-JS,
   pre-hydration, reduced-motion, and transition-hijack fixes).
5. The form → server action → `crm.ts` pipeline keeps its honeypot,
   time-gate, and value-echo behavior; change the POST target, not the
   interface.
6. No new client component without a reason; third-party embeds use a
   click-to-load facade.
7. Business claims in copy must trace to `src/lib/content/site.ts` or a
   content module (the no-invention rule).
8. **Imagery carries the same burden as copy.** A stock photo is safe where it
   depicts nothing specific about the business. Where a frame stands for the
   bay, the owner, or a customer's vehicle, only genuine photography can make
   the claim it implies. Licensed photos carry a `PhotoCredit`;
   `components/shared/PhotoCredit.tsx` holds the attribution and UTM rules so
   compliance is structural rather than remembered.

   **Current status (owner decision, 2026-07-28): all 12 frames hold temporary
   stock**, so the layout can be reviewed with real photographs in it. Real
   assets land in a following PR. The paths are stable and semantic — replacing
   the files needs no code change. Full inventory, and the caveats that apply
   while this holds, live in `docs/maintenance/IMAGE-CREDITS.md`.

## Riflessi-specific additions (part of the framework going forward)

- `ui/icons.tsx` — inline SVG set, 24px grid, 1.5px stroke, currentColor.
- `ui/SectionHeading.tsx` — eyebrow + display heading + signature hairline.
- `shared/MediaFrame.tsx` — the single image treatment; gradient placeholder
  until real photography exists, so photo drops are additive.
- `shared/BeforeAfterPair.tsx` — paired labeled frames, no JS slider.
- `shared/StatsBand.tsx` + `shared/CountUp.tsx` — animated counters with
  server-rendered final values (reduced-motion/no-JS safe).
- `layout/StickyBookBar.tsx` — mobile-only persistent primary CTA
  (body carries matching bottom padding in `layout.tsx`).

## Client JS census

`"use client"` appears only in: `NavBar`, `BookingForm`, `ScrollReveal`,
`CountUp`. Keep it that way; sections and pages stay server components.

## The cinematic homepage template (`components/cinema/`)

A scroll-driven 3D stage, built to be re-skinned for other automotive trades
(PPF, tint, wrap, ceramic-coating specialists) without touching components.

### What you change to adapt it

1. **`src/lib/content/cinema.ts`** — the whole adaptation surface. Seven acts,
   each pairing its copy with a camera pose, an exposure value, and a `finish`
   value (0 = bare corrected paint, 1 = cured coating). Rewrite the acts and
   you have a different business's story on the same rig.
2. **The palette** in `globals.css` `@theme` (mirrored in `design-tokens.ts`).
   The lighting rig reads `NERO.accent` and `NERO.fg` directly, so a token swap
   re-skins the scene along with the site.
3. **Slots** — `page.tsx` passes server-rendered nodes keyed by act id. Nothing
   business-specific lives inside the sequence component itself.

Acts can be added or removed freely; `pose.ts` interpolates across whatever
length the array is.

### Rules this template must keep

1. **Copy is never trapped in the canvas.** Every act renders as an ordinary
   `<section>` with real headings and paragraphs, server-rendered. The stage is
   decoration layered behind it. Verify with `curl | grep` before shipping —
   if a headline only exists in WebGL, it does not exist.
2. **Capability gates the import, not just the render.** `capability.ts`
   decides before `next/dynamic` resolves, so a phone, a reduced-motion
   visitor, or a save-data connection never downloads three/drei/gsap/lenis.
3. **`ssr: false` stays inside a Client Component** — required for the code
   split to actually happen (`next/dist/docs/01-app/02-guides/lazy-loading.md`).
4. **One `useFrame` owner.** `StageDirector` samples the pose once per frame and
   drives camera, exposure, and material. Do not add competing render loops.
5. **Scroll progress is a mutable box, not React state** (`scroll-progress.ts`).
   Putting a per-frame value into state puts the whole tree in the animation
   loop.
6. **Lenis is homepage-scoped.** It mounts with the sequence and is destroyed on
   unmount, so every other route keeps native scrolling — which is what
   assistive tech and find-in-page behave best with.
7. **The stage pauses off screen.** An IntersectionObserver flips `frameloop`
   to `never`; the page continues for several sections below the sequence.
8. **No asset downloads.** Geometry is generated in `car-silhouette-geometry.ts`
   and the environment is baked from `Lightformer` planes. No GLB, no HDR,
   nothing licensed, nothing traced from a real manufacturer's bodywork.
9. **Winding is load-bearing.** The solid renders front-faces only, so a
   reversed triangle is an invisible hole and an inverted normal is a surface
   lit from underneath. Both are silent in a screenshot. Keep the orientation
   assertions in any geometry change.

### Tuning the look

Everything lives in `stage-config.ts` as `STAGE_DEFAULTS`, and a dev-only
panel (`StageTuner`) drags them live — `npm run dev`, panel bottom-right,
"Copy values" to paste back. Full reference and preset starting points:
**`docs/maintenance/STAGE-TUNING.md`**.

The panel never reaches production: its import sits behind a
`process.env.NODE_ENV === "development"` branch the bundler resolves at build
time. Confirm with a grep over `.next/static/chunks` after any change to that
wiring.

Two things deliberately stay out of the panel:

- **The silhouette curves** — `SILHOUETTE`, `ROCKER`, `BODY_WIDTH`,
  `ROOF_WIDTH`, and `SHOULDER_HEIGHT` in `car-silhouette-geometry.ts`. Those five keyframe arrays
  are the car; the panel exposes overall proportions instead.
- **The seven camera poses** — `src/lib/content/cinema.ts`. Those are content,
  not look: changing them changes the story. Re-run the camera-path check after
  editing so the camera never ends up inside the mesh.

Render-time values flow through React as an immutable snapshot
(`useStageSnapshot`); per-frame animation reads the live object directly in
`StageDirector`. Keep that split — putting per-frame values into state would
put the whole tree in the animation loop.

### Client JS census (updated)

`"use client"` now also appears in `components/cinema/`: `CinematicSequence`,
`PaintStage`, `capability.ts`, `useScrollStory.ts`. All of it is homepage-only
and all of the heavy half is behind a dynamic import. Every other route's eager
JS is unchanged.
