import mark from "@/lib/riflessi-mark.json";

type RiflessiMarkProps = Omit<React.SVGProps<SVGSVGElement>, "viewBox" | "fill">;

/**
 * The Riflessi "R", traced from the owner's logo. Filled with currentColor
 * and decorative: the link or text around it carries the name. The icon
 * files are built from the same path (scripts/build-brand-icons.mjs).
 */
export function RiflessiMark(props: RiflessiMarkProps) {
  return (
    <svg viewBox={mark.viewBox} fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d={mark.path} />
    </svg>
  );
}
