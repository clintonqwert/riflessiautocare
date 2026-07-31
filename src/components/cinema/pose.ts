import { Vector3, MathUtils } from "three";
import { livePoses } from "./stage-config";

/** Reused every frame — allocating vectors in the render loop causes GC hitches. */
export interface SampledPose {
  position: Vector3;
  target: Vector3;
  exposure: number;
  finish: number;
}

export function createSampledPose(): SampledPose {
  const opening = livePoses[0];
  return {
    position: new Vector3(...opening.position),
    target: new Vector3(...opening.target),
    exposure: opening.exposure,
    finish: opening.finish,
  };
}

/** Smoothstep — eases each act into the next so the camera never snaps. */
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Reads the pose for a given scroll position by interpolating between the two
 * acts it falls between. Writes into `out` and returns it.
 *
 * Sampled from the live poses so the dev panel's camera edits apply on the next
 * frame. In production those are identical to the content module.
 */
export function samplePose(progress: number, out: SampledPose): SampledPose {
  const segments = livePoses.length - 1;
  const scaled = MathUtils.clamp(progress, 0, 1) * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  const t = ease(scaled - index);

  const from = livePoses[index];
  const to = livePoses[index + 1];

  out.position.set(
    MathUtils.lerp(from.position[0], to.position[0], t),
    MathUtils.lerp(from.position[1], to.position[1], t),
    MathUtils.lerp(from.position[2], to.position[2], t),
  );
  out.target.set(
    MathUtils.lerp(from.target[0], to.target[0], t),
    MathUtils.lerp(from.target[1], to.target[1], t),
    MathUtils.lerp(from.target[2], to.target[2], t),
  );
  out.exposure = MathUtils.lerp(from.exposure, to.exposure, t);
  out.finish = MathUtils.lerp(from.finish, to.finish, t);

  return out;
}
