import type { Stat } from "@/types/content";

/**
 * Stats band figures. Only structurally-true facts of the service model —
 * no invented volume or review counts.
 * The hours figure is owner-confirmed (ai-context/08-decisions.md). Add real
 * counts (vehicles detailed, years) only once the owner wants them published.
 */
const stats: Stat[] = [
  { value: 1, label: "Vehicle in the bay at a time" },
  { value: 100, suffix: "%", label: "Hand wash — never a tunnel or brush" },
  { value: 6, suffix: "h+", label: "Hours of work in a Signature Full Detail" },
];

export function getStats(): Stat[] {
  return stats;
}
