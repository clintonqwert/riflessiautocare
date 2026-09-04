import type { GalleryItem } from "@/types/content";

/**
 * Before/after work, curated — array order is display order.
 *
 * Paths resolve to `public/gallery/<slug>-before.jpg` and `-after.jpg`.
 * Dropping the owner's photography in under those names is the whole swap;
 * see `public/gallery/README.md`, which is written for that purpose.
 *
 * Both halves of a pair must be shot from the same camera position. The
 * comparison slider wipes one over the other, so any movement between shots
 * makes the car appear to jump as the handle is dragged.
 *
 * STILL TEMPORARY until those files land: what is here is licensed stock, not
 * this bay's work. See docs/maintenance/IMAGE-CREDITS.md.
 */
const items: GalleryItem[] = [
  {
    slug: "daily-driver-interior",
    vehicle: "Daily-driver sedan",
    service: "interior-detailing",
    summary: "A commuter cabin after steam, extraction, and leather care.",
    beforeSrc: "/gallery/daily-driver-interior-before.jpg",
    afterSrc: "/gallery/daily-driver-interior-after.jpg",
    beforeAlt: "Sedan interior before detailing",
    afterAlt: "Sedan interior after a full interior detail",
  },
  {
    slug: "suv-exterior-gloss",
    vehicle: "Family SUV",
    service: "exterior-detailing",
    summary: "Swirled paint decontaminated, polished, and sealed.",
    beforeSrc: "/gallery/suv-exterior-gloss-before.jpg",
    afterSrc: "/gallery/suv-exterior-gloss-after.jpg",
    beforeAlt: "SUV paint with swirl marks before polishing",
    afterAlt: "SUV paint reflecting cleanly after machine polish",
  },
  {
    slug: "suv-ceramic",
    vehicle: "Compact SUV",
    service: "ceramic-coating",
    summary: "Full prep and ceramic coating, cured under cover.",
    beforeSrc: "/gallery/suv-ceramic-before.jpg",
    afterSrc: "/gallery/suv-ceramic-after.jpg",
    beforeAlt: "White compact SUV before decontamination and coating",
    afterAlt: "White compact SUV with a deep gloss after ceramic coating",
  },
];

export function getGalleryItems(): GalleryItem[] {
  return items;
}
