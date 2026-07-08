import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaFrameProps {
  /** Real photo path under /public; absent -> paint-reflection placeholder */
  src?: string;
  alt: string;
  /** Aspect ratio of the frame */
  ratio?: "4/3" | "16/9";
  /** Small caption chip rendered inside the frame's lower-left corner */
  label?: string;
  className?: string;
}

/**
 * The site's single image treatment: rounded frame, inner hairline, dark
 * scrim for legible labels. Until real photography lands, frames render the
 * paint-reflection gradient — swapping in a photo is adding `src`, no layout
 * change. Never use raw <img>/<Image> in sections; use this.
 */
export function MediaFrame({
  src,
  alt,
  ratio = "4/3",
  label,
  className,
}: MediaFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-line",
        ratio === "4/3" ? "aspect-[4/3]" : "aspect-video",
        !src && "paint-reflection",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      ) : (
        // Placeholder frames still describe what will live here.
        <span className="sr-only">{alt}</span>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 rounded-pill border border-line-strong bg-surface/70 px-3 py-1 text-xs font-medium tracking-wide text-fg backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
