import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import type { GalleryItem } from "@/types/content";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  return (
    <section className="bg-raised py-24 md:py-32" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="gallery-heading"
          eyebrow="Il Lavoro"
          heading="Every detail is documented."
          lede="Drag to wipe between before and after. Every pair is judged in the same daylight it was finished in."
        />
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {items.slice(0, 3).map((item, i) => (
            <div key={item.slug} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
              {/* Three across on desktop. */}
              <BeforeAfterSlider item={item} sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
          ))}
        </div>
        <div className="mt-12" data-reveal>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            See the gallery <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
