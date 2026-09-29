import { RiflessiMark } from "@/components/ui/RiflessiMark";

/**
 * The brand lockup from the owner's logo: the "R" mark, then the name as
 * live text in the site's own Fraunces and Figtree, so it stays sharp and
 * readable. Callers wrap it in a link that carries the accessible name.
 */
export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <RiflessiMark className="h-[18px] w-auto shrink-0 text-fg" />
      <span className="font-serif text-xl font-medium tracking-tight text-fg">
        Riflessi
        <span className="ml-2 align-middle text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent">
          Auto Care
        </span>
      </span>
    </span>
  );
}
