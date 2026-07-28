import type { GalleryItem } from "@/types/content";

/**
 * Before/after work, curated — array order is display order.
 *
 * TEMPORARY (owner decision): these paths currently hold licensed stock
 * standing in for photography that has not been shot yet, so the layout can be
 * reviewed with real images in the frames. They are NOT this bay's work.
 *
 * Replace the files in place — the paths are stable and semantic, so swapping
 * in genuine before/after photography needs no code change. Until that
 * happens, treat every frame here as scaffolding rather than a portfolio.
 * Attributions: docs/maintenance/IMAGE-CREDITS.md.
 */
const items: GalleryItem[] = [
  {
    slug: "daily-driver-interior",
    vehicle: "Daily-driver sedan",
    service: "interior-detailing",
    summary: "A commuter cabin after steam, extraction, and leather care.",
    beforeSrc: "/images/gallery/daily-driver-interior-before.jpg",
    afterSrc: "/images/gallery/daily-driver-interior-after.jpg",
    beforeAlt: "Sedan interior before detailing",
    afterAlt: "Sedan interior after a full interior detail",
  },
  {
    slug: "suv-exterior-gloss",
    vehicle: "Family SUV",
    service: "exterior-detailing",
    summary: "Swirled paint decontaminated, polished, and sealed.",
    beforeSrc: "/images/gallery/suv-exterior-gloss-before.jpg",
    afterSrc: "/images/gallery/suv-exterior-gloss-after.jpg",
    beforeAlt: "SUV paint with swirl marks before polishing",
    afterAlt: "SUV paint reflecting cleanly after machine polish",
  },
  {
    slug: "coupe-ceramic",
    vehicle: "Weekend coupe",
    service: "ceramic-coating",
    summary: "Full prep and ceramic coating, cured under cover.",
    beforeSrc: "/images/gallery/coupe-ceramic-before.jpg",
    afterSrc: "/images/gallery/coupe-ceramic-after.jpg",
    beforeAlt: "Coupe paint before decontamination and coating",
    afterAlt: "Coupe with a deep gloss after ceramic coating",
  },
];

export function getGalleryItems(): GalleryItem[] {
  return items;
}
