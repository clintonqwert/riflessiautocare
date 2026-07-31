import { NERO } from "@/lib/design-tokens";
import { getCinemaActs } from "@/lib/content/cinema";

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
     * Overall length in scene units. The model is auto-fitted to this from its
     * own bounds, so the asset's native scale never matters and swapping in a
     * different car needs no measurement.
     *
     * Shape is fixed by the model — see docs/maintenance/STAGE-MODEL.md.
     */
    length: number;
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
  /**
   * Everything on the car that is not paint. The model ships without textures,
   * so these are what stop it looking unfinished.
   */
  trim: {
    glassColor: string;
    /** 0 is invisible glass — which is what a stripped transmission map gives. */
    glassOpacity: number;
    glassRoughness: number;
    rimColor: string;
    rimMetalness: number;
    rimRoughness: number;
    tyreColor: string;
    /** Emissive strength on head, brake, and signal lamps. */
    lightGlow: number;
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
    length: 6.65,
  },
  material: {
    color: "#f0f2f4",
    metalness: 0.23,
    roughnessBare: 0.19,
    roughnessCoated: 0,
    envIntensityCoated: 2.3,
  },
  trim: {
    glassColor: "#0b0f14",
    glassOpacity: 0.62,
    glassRoughness: 0.06,
    rimColor: "#c9ccd2",
    rimMetalness: 0.95,
    rimRoughness: 0.22,
    tyreColor: "#0c0c0e",
    lightGlow: 1.1,
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
    trim: { ...config.trim },
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

/* ---------------------------------------------------------------------------
 * Camera choreography
 *
 * The seven poses are content (`lib/content/cinema.ts`), but they are also the
 * thing most worth adjusting by eye. This is a mutable working copy the dev
 * panel edits; `pose.ts` samples from it. In production nothing writes to it,
 * so it stays byte-identical to the content module.
 * ------------------------------------------------------------------------- */

export interface LivePose {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  exposure: number;
  finish: number;
}

function poseFromContent(): LivePose[] {
  return getCinemaActs().map((act) => ({
    id: act.id,
    position: [...act.pose.position] as [number, number, number],
    target: [...act.pose.target] as [number, number, number],
    exposure: act.pose.exposure,
    finish: act.pose.finish,
  }));
}

export const livePoses: LivePose[] = poseFromContent();

/** Dev-panel only. Mutates a pose in place and notifies the scene. */
export function setPoseValue(
  index: number,
  key: "position" | "target",
  axis: 0 | 1 | 2,
  value: number,
): void;
export function setPoseValue(
  index: number,
  key: "exposure" | "finish",
  value: number,
): void;
export function setPoseValue(
  index: number,
  key: "position" | "target" | "exposure" | "finish",
  a: number,
  b?: number,
): void {
  const pose = livePoses[index];
  if (!pose) return;
  if (key === "position" || key === "target") pose[key][a as 0 | 1 | 2] = b ?? 0;
  else pose[key] = a;
  for (const listener of listeners) listener("camera");
}

export function resetPoses(): void {
  const fresh = poseFromContent();
  livePoses.forEach((pose, i) => Object.assign(pose, fresh[i]));
  for (const listener of listeners) listener("camera");
}

/** Serialises the live poses as a paste-ready block for `cinema.ts`. */
export function posesAsSource(): string {
  const n = (v: number) => Number(v.toFixed(3));
  return livePoses
    .map(
      (p) =>
        `// ${p.id}\npose: {\n  position: [${p.position.map(n).join(", ")}],\n  target: [${p.target.map(n).join(", ")}],\n  exposure: ${n(p.exposure)},\n  finish: ${n(p.finish)},\n},`,
    )
    .join("\n");
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
