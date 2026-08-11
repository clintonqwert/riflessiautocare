# Where to put your photos and video

Drop files here with the exact names below and they appear on the site. No code
changes needed for the six gallery images or the film.

This file is documentation only — it is not served as a page.

---

## 1. Before / after photos → `public/gallery/`

Six files. **The names must match exactly**, lowercase, `.jpg`:

```
daily-driver-interior-before.jpg
daily-driver-interior-after.jpg
suv-exterior-gloss-before.jpg
suv-exterior-gloss-after.jpg
coupe-ceramic-before.jpg
coupe-ceramic-after.jpg
```

### The one rule that matters

**Shoot each pair from the same position.** The slider wipes one image over the
other, so if the camera moved between the two shots the car appears to jump as
you drag and the comparison stops being readable. Tripod if you have one; if
not, mark where you stood and do not move.

Also keep both frames of a pair the same aspect ratio. They are cropped to 4:3,
centred — so a portrait photo will lose its top and bottom.

### Specs

| | |
| --- | --- |
| Aspect | 4:3 (landscape). Others get centre-cropped. |
| Size | 1600 × 1200 or larger. Smaller will look soft on a retina screen. |
| Format | `.jpg` |
| Weight | Aim under 400 KB each — run them through `npm run optimise-assets` (below) and this is handled. |

### Different vehicles than these three?

The names come from `src/lib/content/gallery.ts`. Change the vehicle, summary
and alt text there and rename the files to match the `slug`. Alt text is not
optional — it is what a blind visitor and a search engine read.

---

## 2. The film → `public/video/`

```
detail-demo.mp4     the film itself
detail-demo-poster.jpg   a still frame, 16:9
```

The video does **not** load until someone presses play — only the poster does.
So a large file costs nothing to visitors who scroll past.

Even so, keep it **under ~30 MB** and around **60–90 seconds**. Anything longer
and most people leave before the point lands.

| | |
| --- | --- |
| Aspect | 16:9 |
| Resolution | 1920 × 1080 is plenty; 4K is wasted here |
| Codec | H.264 / AAC in an `.mp4` — the one combination every browser plays |
| Poster | Same 16:9 framing, ideally a frame from the film itself |

**If anyone speaks in the film**, add captions as `public/video/detail-demo.vtt`
and tell me — it needs one line wiring up, and without it the film is
inaccessible to deaf visitors and its content is invisible to search.

---

## 3. Then run

```bash
npm run optimise-assets
```

Resizes, crops to the right aspect, strips camera EXIF (which includes GPS —
your home address, if the photos were taken there) and compresses. It reports
what it did and leaves your originals untouched.

Keep your originals somewhere outside the repo. The versions here are
web-sized and not worth archiving.

---

## What is here now

Placeholder stock, which the site currently treats as temporary — see
`docs/maintenance/IMAGE-CREDITS.md`. Your photos replace it entirely, and once
they do, that file and the footer's stock credit should both be cleaned up.
Tell me when you have dropped them in and I will do that pass.
