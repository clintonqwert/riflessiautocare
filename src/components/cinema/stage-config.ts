import { NERO } from "@/lib/design-tokens";

/**
 * Every tunable value for the homepage stage, in one place.
 *
 * These are the shipped defaults. In development the tuning panel
 * (`StageTuner`) mutates a live copy so the scene can be adjusted by hand;
 * "Copy values" there prints a block to paste back over `STAGE_DEFAULTS`.
 * Production always uses the defaults — the panel is compiled out.
 */

export interface StageConfig {
  form: {
    /** Nose-to-tail length in scene units. */
    length: number;
    /** Overall width multiplier. */
    widthScale: number;
    /** How high the dome crowns at its peak. */
    crownHeight: number;
    /** Height of the near-vertical wall where the top rolls over. */
    edgeHeight: number;
    /**
     * How steeply the dome meets the silhouette. Below ~0.75 the top drops
     * away almost vertically and fights the rim crease; above ~1.1 it flattens
     * toward a tabletop.
     */
    archExponent: number;
    /** Multiplies every sculpted scoop and haunch. 0 = a plain dome. */
    featureDepth: number;
  };
  material: {
    /** Base paint colour. Reflections do most of the work, so keep it dark. */
    color: string;
    metalness: number;
    /** Surface at the start of the scroll — bare, freshly corrected paint. */
    roughnessBare: number;
    /** Surface at the end — a cured ceramic coating. */
    roughnessCoated: number;
    /** Reflection strength once coated. The main "gloss" dial. */
    envIntensityCoated: number;
  };
  light: {
    /** Overhead softbox. */
    key: number;
    /** The long strips whose highlights travel across the form. */
    sweepLeft: number;
    sweepRight: number;
    /** Brand accent rim, separating the form from the backdrop. */
    bronzeRim: number;
    /** Raising this is the fastest way to flatten the whole image. */
    fill: number;
    keyColor: string;
    bronzeColor: string;
  };
  camera: {
    /** Lower is more telephoto and flatter; higher is wider and more dramatic. */
    fov: number;
  };
  backdrop: {
    /** Percent of the centre pool mixed toward white. 100 = no lift. */
    lift: number;
  };
}

export const STAGE_DEFAULTS: StageConfig = {
  form: {
    length: 4.6,
    widthScale: 1.32,
    crownHeight: 0.94,
    edgeHeight: 0.28,
    archExponent: 0.9,
    featureDepth: 1,
  },
  material: {
    color: NERO.raised,
    metalness: 0.65,
    roughnessBare: 0.42,
    roughnessCoated: 0.045,
    envIntensityCoated: 2.3,
  },
  light: {
    key: 6.5,
    sweepLeft: 4.2,
    sweepRight: 2.6,
    bronzeRim: 4.8,
    fill: 0.3,
    keyColor: "#fffaf2",
    bronzeColor: NERO.accent,
  },
  camera: { fov: 38 },
  backdrop: { lift: 82 },
};

export function cloneStageConfig(config: StageConfig = stageConfig): StageConfig {
  return clone(config);
}

function clone(config: StageConfig): StageConfig {
  return {
    form: { ...config.form },
    material: { ...config.material },
    light: { ...config.light },
    camera: { ...config.camera },
    backdrop: { ...config.backdrop },
  };
}

/**
 * The values the scene actually reads. Identical to the defaults unless the
 * dev panel has changed something.
 */
export const stageConfig: StageConfig = clone(STAGE_DEFAULTS);

type Listener = (changed: keyof StageConfig) => void;
const listeners = new Set<Listener>();

export function subscribeToStageConfig(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Applies a change and notifies the scene. Dev-panel only. */
export function setStageValue<G extends keyof StageConfig, K extends keyof StageConfig[G]>(
  group: G,
  key: K,
  value: StageConfig[G][K],
): void {
  stageConfig[group][key] = value;
  for (const listener of listeners) listener(group);
}

export function resetStageConfig(): void {
  const fresh = clone(STAGE_DEFAULTS);
  for (const group of Object.keys(fresh) as (keyof StageConfig)[]) {
    Object.assign(stageConfig[group], fresh[group]);
    for (const listener of listeners) listener(group);
  }
}

/** Serialises the live values as a paste-ready `STAGE_DEFAULTS` block. */
export function stageConfigAsSource(): string {
  const body = (Object.keys(stageConfig) as (keyof StageConfig)[])
    .map((group) => {
      const entries = Object.entries(stageConfig[group])
        .map(([k, v]) => `    ${k}: ${typeof v === "string" ? `"${v}"` : v},`)
        .join("\n");
      return `  ${group}: {\n${entries}\n  },`;
    })
    .join("\n");
  return `export const STAGE_DEFAULTS: StageConfig = {\n${body}\n};`;
}
