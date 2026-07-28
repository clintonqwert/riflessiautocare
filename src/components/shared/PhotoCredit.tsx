import type { PhotoCredit as PhotoCreditData } from "@/types/content";

/**
 * Attribution line for a licensed photograph.
 *
 * Unsplash's API guidelines require crediting the photographer and the source,
 * both as links, with a UTM parameter identifying the referring app. Keeping
 * that in one component means any future stock image stays compliant by
 * construction rather than by someone remembering the rule.
 */

const UTM = "utm_source=riflessi_auto_care&utm_medium=referral";

function withUtm(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${UTM}`;
}

export function PhotoCredit({ credit }: { credit: PhotoCreditData }) {
  const linkClass =
    "underline underline-offset-2 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <p className="mt-3 text-xs text-muted">
      Photo by{" "}
      <a
        href={withUtm(credit.profileUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {credit.photographer}
      </a>{" "}
      on{" "}
      <a
        href={withUtm(credit.photoUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {credit.source}
      </a>
    </p>
  );
}
