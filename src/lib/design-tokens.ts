/**
 * Nero Lucido palette as TS constants — the ONLY sanctioned raw-hex consumer
 * path, for the places Tailwind classes can't reach: next/og inline styles
 * (opengraph-image.tsx). Components must use the semantic tokens in
 * globals.css instead.
 */
export const NERO = {
  surface: "#0a0a0b",
  raised: "#121214",
  overlay: "#17171a",
  fg: "#f5f2ec",
  muted: "#9a958c",
  accent: "#c8a96a",
  accentFg: "#1a150c",
  line: "#26262a",
  lineStrong: "#34343a",
} as const;
