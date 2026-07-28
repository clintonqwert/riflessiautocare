/**
 * What every visitor sees when the WebGL stage is not loaded — reduced-motion,
 * phones, low-core devices, save-data, no WebGL, and the first paint on every
 * device before the capability check runs.
 *
 * It is not an apology for the 3D scene: the same obsidian-and-bronze
 * reflection language, rendered with gradients that cost nothing. Server
 * rendered, zero JavaScript.
 */
export function StageFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="paint-reflection absolute inset-0" />
      {/* A slow bronze sheen travelling the way a light strip would. Held to
          motion-safe, so reduced-motion visitors get the still surface. */}
      <div
        className="absolute inset-0 opacity-0 motion-safe:opacity-100 motion-safe:animate-[sheenSweep_14s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(105deg, transparent 32%, color-mix(in oklab, var(--color-accent) 16%, transparent) 48%, transparent 64%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 hero-glow" />
    </div>
  );
}
