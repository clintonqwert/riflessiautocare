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
    /**
     * Overall dimensions in scene units — literal, not multipliers. Every
     * profile curve is normalised against these, so a real car's proportions
     * can be dialled in directly. A coupe sits near 6.6 × 2.8 × 2.0.
     */
    length: number;
    width: number;
    height: number;
    /** Wheel and tyre scale. 1 fills the arches. */
    wheelSize: number;
    /**
     * How far the greenhouse pulls in above the belt line. 0 = glass sits flush
     * with the flanks, 1 = a strongly tapered cabin.
     */
    tumblehome: number;
    /** Extra width over the rear axle. 0 removes the hips entirely. */
    haunch: number;
    /** How far the sills tuck under the widest point. 1 = slab sided. */
    sillTuck: number;
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
    // Real coupe proportions: width 0.42 of length, height 0.31, wheelbase
    // 0.62. Getting these right is most of what makes it read as a car.
    length: 6.65,
    width: 2.78,
    height: 2.04,
    wheelSize: 1,
    tumblehome: 0.45,
    haunch: 1,
    sillTuck: 0.88,
  },
  material: {
    color: "#f0f2f4",
    metalness: 0.23,
    roughnessBare: 0.19,
    roughnessCoated: 0,
    envIntensityCoated: 2.3,
  },
  light: {
    key: 10.4,
    sweepLeft: 4.2,
    sweepRight: 4.4,
    bronzeRim: 8.2,
    fill: 0.85,
    keyColor: "#fffaf2",
    bronzeColor: NERO.accent,
  },
  camera: { fov: 30 },
  backdrop: { lift: 86 },
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
