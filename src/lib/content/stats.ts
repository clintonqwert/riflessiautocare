import type { Stat } from "@/types/content";

/**
 * Stats band figures. Only structurally-true facts of the studio model —
 * no invented volume or review counts.
 * TODO(owner): confirm the hours figure; swap in real counts (vehicles
 * detailed, years) once you want them published.
 */
const stats: Stat[] = [
  { value: 1, label: "Vehicle in the studio at a time" },
  { value: 100, suffix: "%", label: "Hand wash — never a tunnel or brush" },
  { value: 6, suffix: "h+", label: "Studio time in a Signature Full Detail" },
];

export function getStats(): Stat[] {
  return stats;
}
