# Image credits

Every photograph currently on the site, and where it came from.

## Status: temporary stock, pending real photography

**All twelve images below are licensed stock, not Riflessi's own work.** They
were added (owner decision, 2026-07-28) so the layout could be reviewed with
real photographs in the frames instead of gradient placeholders.

Two consequences worth being explicit about while this holds:

- **The gallery is not a portfolio.** The before/after pairs are unrelated
  stock photographs of other people's vehicles. They are scaffolding.
- **The bay and craftsman frames are not this bay or this owner.**

Until real photography replaces them, avoid promoting the gallery as proof of
work — in ads, on Google Business Profile, or in any listing that points at it.

### Selection constraints, for whoever picks the next batch

Two rules were applied when choosing these, and they apply to real photography
too:

- **No indoor-facility imagery.** The vocabulary rule in
  `src/lib/content/site.ts` forbids claiming an indoor or controlled facility,
  and the `/about` copy says "outdoor detailing bay" in as many words. Three
  first-pass picks (a tiled detailing shop, a paint spray booth, a mechanic's
  workshop with lifts) were rejected for contradicting the copy beside them.
- **No third-party branding.** One rejected pick carried a large SWISSVAX sign,
  which reads as either a sponsor or a competitor's premises.

## Replacing them

The paths are stable and semantic. **Replace the files in place and no code
changes are needed.** Aspect ratio is 4:3 throughout.

| Path | Displayed at | Recommended source size |
| --- | --- | --- |
| `/images/*.jpg` | ~570 px wide | 1600 × 1200 |
| `/images/gallery/*.jpg` | ~285 px wide | 1000 × 750 |

When a file is replaced with genuine photography:

1. Delete its row from the table below.
2. Remove the `credit` field from its entry in `src/lib/content/about.ts` if it
   has one (only the `/about` abstract frame does).
3. When the table is empty, delete this file and reinstate the honesty note in
   `src/app/gallery/page.tsx` only if placeholders return.

## Attributions

All photographs are from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license). Unsplash's API guidelines ask
that the download endpoint be triggered when a photo is used; that was done for
every image here at the time it was added.

| File | Photographer | Source |
| --- | --- | --- |
| `/images/polished-paint-reflection.jpg` | Quentin Martinez | [view](https://unsplash.com/photos/a-close-up-view-of-a-shiny-surface-V8H-K2032Kc) |
| `/images/about-bay.jpg` | Christian Tan | [view](https://unsplash.com/photos/a-black-car-parked-on-a-road-OP40j3_hO00) |
| `/images/about-craft.jpg` | Vitali Adutskevich | [view](https://unsplash.com/photos/a-man-using-a-car-B7hVEFTFUWs) |
| `/images/why-bay.jpg` | noe fornells | [view](https://unsplash.com/photos/two-cars-parked-in-front-of-a-garage-3ER5mAisgRo) |
| `/images/why-single-vehicle.jpg` | Tuomas Nylund | [view](https://unsplash.com/photos/silver-coupe-inside-building-VNAQPOkc5Yg) |
| `/images/why-craftsman.jpg` | Erik Mclean | [view](https://unsplash.com/photos/white-porsche-911-parked-near-white-house-u7B2HTbzVko) |
| `/images/gallery/daily-driver-interior-before.jpg` | Sami Boudjelti | [view](https://unsplash.com/photos/the-interior-of-a-car-OqQcBlq9Kf4) |
| `/images/gallery/daily-driver-interior-after.jpg` | Haryo Ramadantyo | [view](https://unsplash.com/photos/black-leather-car-seat-in-car-bjx6NQFNJLA) |
| `/images/gallery/suv-exterior-gloss-before.jpg` | Colton Sturgeon | [view](https://unsplash.com/photos/rear-view-photo-of-black-alfa-romeo-459-1ScqCRoNvfA) |
| `/images/gallery/suv-exterior-gloss-after.jpg` | Zulfahmi Khani | [view](https://unsplash.com/photos/a-black-and-white-photo-of-a-car-DRgp9FYsjIQ) |
| `/images/gallery/coupe-ceramic-before.jpg` | JavyGo | [view](https://unsplash.com/photos/two-cars-parked-in-a-parking-space-next-to-each-other-w21aHNxINjs) |
| `/images/gallery/coupe-ceramic-after.jpg` | GoGoNano | [view](https://unsplash.com/photos/gray-microfiber-cloth-on-a-black-car-hood-Df9XCGX9Y2U) |
