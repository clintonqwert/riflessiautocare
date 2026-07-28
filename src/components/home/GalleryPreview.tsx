import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfterPair } from "@/components/shared/BeforeAfterPair";
import type { GalleryItem } from "@/types/content";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  return (
    <section className="bg-raised py-24 md:py-32" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <SectionHeading
          id="gallery-heading"
          eyebrow="Il Lavoro"
          heading="Every detail is documented."
          lede="Before-and-after photos land here as vehicles roll out — judged in the same daylight they were finished in."
        />
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {items.slice(0, 3).map((item, i) => (
            <div key={item.slug} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
              {/* Three pairs across on desktop, so each frame is ~1/6 of the row. */}
              <BeforeAfterPair item={item} sizes="(min-width: 768px) 17vw, 50vw" />
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
