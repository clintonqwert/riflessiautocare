import type { GalleryItem } from "@/types/content";

/**
 * Before/after work, curated — array order is display order.
 * Items without beforeSrc/afterSrc render as MediaFrame placeholders; real
 * photography drops in by adding paths under /public, no layout change.
 * No fabricated photos: placeholders are honest gradient frames.
 */
const items: GalleryItem[] = [
  {
    slug: "daily-driver-interior",
    vehicle: "Daily-driver sedan",
    service: "interior-detailing",
    summary: "A commuter cabin after steam, extraction, and leather care.",
    beforeAlt: "Sedan interior before detailing",
    afterAlt: "Sedan interior after a full interior detail",
  },
  {
    slug: "suv-exterior-gloss",
    vehicle: "Family SUV",
    service: "exterior-detailing",
    summary: "Swirled paint decontaminated, polished, and sealed.",
    beforeAlt: "SUV paint with swirl marks before polishing",
    afterAlt: "SUV paint reflecting cleanly after machine polish",
  },
  {
    slug: "coupe-ceramic",
    vehicle: "Weekend coupe",
    service: "ceramic-coating",
    summary: "Full prep and ceramic coating, cured under cover.",
    beforeAlt: "Coupe paint before decontamination and coating",
    afterAlt: "Coupe with a deep gloss after ceramic coating",
  },
];

export function getGalleryItems(): GalleryItem[] {
  return items;
}
