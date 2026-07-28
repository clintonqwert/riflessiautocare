import { MediaFrame } from "@/components/shared/MediaFrame";
import type { GalleryItem } from "@/types/content";

/**
 * Before/after presented as paired labeled frames — deliberately not a JS
 * slider (zero client JS, works everywhere, reads honestly).
 */
export function BeforeAfterPair({
  item,
  sizes = "(min-width: 768px) 25vw, 50vw",
}: {
  item: GalleryItem;
  /** Each frame is half of a pair, so the default is half the pair's width. */
  sizes?: string;
}) {
  return (
    <figure>
      <div className="grid grid-cols-2 gap-2">
        <MediaFrame
          src={item.beforeSrc}
          alt={item.beforeAlt}
          label="Before"
          sizes={sizes}
        />
        <MediaFrame
          src={item.afterSrc}
          alt={item.afterAlt}
          label="After"
          sizes={sizes}
        />
      </div>
      <figcaption className="mt-3">
        <span className="block text-sm font-semibold text-fg">
          {item.vehicle}
        </span>
        <span className="mt-0.5 block text-sm text-muted">{item.summary}</span>
      </figcaption>
    </figure>
  );
}
