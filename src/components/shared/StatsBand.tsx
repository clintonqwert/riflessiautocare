import { CountUp } from "@/components/shared/CountUp";
import type { Stat } from "@/types/content";

/**
 * Horizontal stats strip with animated counters (the only motion beyond
 * scroll reveals). Figures come from content — never hardcode claims here.
 */
export function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-1 gap-8 border-y border-line py-10 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="text-center"
          data-reveal
          style={{ "--reveal-i": i } as React.CSSProperties}
        >
          <dd className="font-serif text-display-sm font-medium text-accent">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </dd>
          <dt className="mt-2 text-sm leading-snug text-muted">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}
