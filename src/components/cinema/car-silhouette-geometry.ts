import { BufferGeometry, BufferAttribute } from "three";
import { STAGE_DEFAULTS, type StageConfig } from "./stage-config";

/**
 * A sports-coupe body, generated as a loft: a closed cross-section swept along
 * a silhouette profile from nose to tail.
 *
 * The proportions are the front-engine 2+2 coupe genre — long hood,
 * cab-rearward greenhouse, fastback roofline, wide rear haunches. Those are
 * genre proportions, not any manufacturer's design: there is no grille, no
 * lamps, no badging, and no panel work traced from a real car. It reads as a
 * design-studio clay buck, which is also why it has no wheels — this is a
 * surface for showing paint, not a vehicle.
 *
 * Everything is driven by the keyframe curves below. Editing those changes the
 * car; no other file needs to know.
 */

const SEGMENTS_T = 200; // stations along the length
const SEGMENTS_U = 96; // points around each cross-section

type Form = StageConfig["form"];

interface Key {
  t: number;
  v: number;
}

/**
 * Catmull-Rom through keyframes, endpoints clamped. Smooth enough that the
 * body has no facet lines, and local enough that moving one key does not
 * distort the whole car.
 */
function sampleCurve(keys: Key[], t: number): number {
  const clamped = Math.min(Math.max(t, keys[0].t), keys[keys.length - 1].t);
  let i = 0;
  while (i < keys.length - 2 && clamped > keys[i + 1].t) i++;

  const p1 = keys[i];
  const p2 = keys[i + 1];
  const p0 = keys[i - 1] ?? p1;
  const p3 = keys[i + 2] ?? p2;

  const span = p2.t - p1.t;
  const s = span > 0 ? (clamped - p1.t) / span : 0;
  const s2 = s * s;
  const s3 = s2 * s;

  return (
    0.5 *
    (2 * p1.v +
      (-p0.v + p2.v) * s +
      (2 * p0.v - 5 * p1.v + 4 * p2.v - p3.v) * s2 +
      (-p0.v + 3 * p1.v - 3 * p2.v + p3.v) * s3)
  );
}

/** The side view. This single curve is what makes it read as a coupe. */
const SILHOUETTE: Key[] = [
  { t: 0.0, v: 0.05 }, // nose tip, close to the ground
  { t: 0.05, v: 0.26 },
  { t: 0.13, v: 0.34 }, // hood over the front axle
  { t: 0.26, v: 0.4 },
  { t: 0.34, v: 0.46 }, // cowl — base of the windscreen
  { t: 0.43, v: 0.76 }, // windscreen header, steeply raked
  { t: 0.53, v: 0.88 }, // roof peak, set back
  { t: 0.63, v: 0.86 },
  { t: 0.75, v: 0.7 }, // fastback falling away
  { t: 0.87, v: 0.55 }, // rear deck
  { t: 0.95, v: 0.5 },
  { t: 1.0, v: 0.34 }, // tail
];

/** Plan-view half width: pinched nose, front arches, waisted doors, wide hips. */
const BODY_WIDTH: Key[] = [
  { t: 0.0, v: 0.06 },
  { t: 0.04, v: 0.42 },
  { t: 0.13, v: 0.84 }, // front arch
  { t: 0.22, v: 0.88 },
  { t: 0.42, v: 0.82 }, // door waist
  { t: 0.6, v: 0.85 },
  { t: 0.74, v: 1.0 }, // rear haunch — the widest point
  { t: 0.85, v: 0.94 },
  { t: 0.95, v: 0.7 },
  { t: 1.0, v: 0.08 },
];

/** Greenhouse half width, as a fraction of body width. Zero outside the cabin. */
const ROOF_WIDTH: Key[] = [
  { t: 0.0, v: 0.0 },
  { t: 0.3, v: 0.0 },
  { t: 0.37, v: 0.26 },
  { t: 0.5, v: 0.54 },
  { t: 0.62, v: 0.52 },
  { t: 0.74, v: 0.26 },
  { t: 0.82, v: 0.0 },
  { t: 1.0, v: 0.0 },
];

/** Belt line — where the flank turns over into the glass. */
const SHOULDER_HEIGHT: Key[] = [
  { t: 0.0, v: 0.03 },
  { t: 0.13, v: 0.24 },
  { t: 0.34, v: 0.32 },
  { t: 0.58, v: 0.34 },
  { t: 0.8, v: 0.32 },
  { t: 1.0, v: 0.18 },
];

/** Extra hip over the rear axle, scaled by `haunch`. */
function haunchBulge(t: number): number {
  return 0.1 * Math.exp(-Math.pow((t - 0.74) / 0.1, 2));
}

interface SectionPoint {
  y: number;
  z: number;
}

/**
 * One cross-section, as a Catmull-Rom through four control points: sill,
 * shoulder (widest), roof edge, centreline. `v` runs 0 at the sill to 1 at the
 * centreline.
 */
function section(t: number, v: number, form: Form): SectionPoint {
  const halfWidth =
    form.width * (sampleCurve(BODY_WIDTH, t) + haunchBulge(t) * form.haunch);
  const top = form.height * sampleCurve(SILHOUETTE, t);
  const roofFraction = sampleCurve(ROOF_WIDTH, t);
  const shoulder = form.height * sampleCurve(SHOULDER_HEIGHT, t);

  // How much of a greenhouse this station has: 0 over the hood and deck, 1
  // through the middle of the cabin.
  const cabin = Math.min(1, roofFraction / 0.3);
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

  // The third control point is the shoulder-to-crest transition. It must never
  // land on the centreline: with a zero-width roof the spline's last segment
  // degenerates, and the hood and deck end up with sideways normals.
  //
  // Over the hood and deck it sits wide, giving a broad crown. Through the
  // cabin it pinches in — that pinch is the tumblehome.
  const crownZ = halfWidth * 0.58;
  const glassZ = halfWidth * Math.max(roofFraction, 0.2) * (1 - 0.35 * form.tumblehome);
  const floorY = shoulder + 0.02 * form.height;
  const crownY = Math.max(floorY, top - 0.11 * form.height);
  const glassY = Math.max(floorY, top - 0.04 * form.height);

  const controls: SectionPoint[] = [
    { z: halfWidth * form.sillTuck, y: 0 },
    { z: halfWidth, y: shoulder },
    { z: lerp(crownZ, glassZ, cabin), y: lerp(crownY, glassY, cabin) },
    { z: 0, y: top },
  ];

  // Pad the ends so the spline is defined across all three segments.
  const padded = [controls[0], ...controls, controls[3]];
  const segments = controls.length - 1;
  const scaled = Math.min(Math.max(v, 0), 1) * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  const s = scaled - index;
  const s2 = s * s;
  const s3 = s2 * s;

  const blend = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);

  const [p0, p1, p2, p3] = [
    padded[index],
    padded[index + 1],
    padded[index + 2],
    padded[index + 3],
  ];

  return {
    z: Math.max(0, blend(p0.z, p1.z, p2.z, p3.z)),
    y: Math.max(0, blend(p0.y, p1.y, p2.y, p3.y)),
  };
}

export function createCarSilhouetteGeometry(
  form: Form = STAGE_DEFAULTS.form,
): BufferGeometry {
  const cols = SEGMENTS_T + 1;
  const rows = SEGMENTS_U + 1;

  // Body ring vertices, plus one centre vertex for each end cap.
  const bodyCount = cols * rows;
  const noseCentre = bodyCount;
  const tailCentre = bodyCount + 1;
  const vertexCount = bodyCount + 2;

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);

  const put = (i: number, x: number, y: number, z: number, u: number, v: number) => {
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  };

  for (let i = 0; i < cols; i++) {
    const t = i / SEGMENTS_T;
    const x = form.length * (t - 0.5);

    for (let j = 0; j < rows; j++) {
      // u sweeps right sill → over the roof → left sill.
      const u = j / SEGMENTS_U;
      const side = u < 0.5 ? 1 : -1;
      const v = u < 0.5 ? u * 2 : (1 - u) * 2;
      const point = section(t, v, form);
      put(i * rows + j, x, point.y, point.z * side, t, u);
    }
  }

  const noseTop = form.height * sampleCurve(SILHOUETTE, 0);
  const tailTop = form.height * sampleCurve(SILHOUETTE, 1);
  put(noseCentre, form.length * -0.5, noseTop * 0.45, 0, 0, 0.5);
  put(tailCentre, form.length * 0.5, tailTop * 0.45, 0, 1, 0.5);

  const triangles = SEGMENTS_T * SEGMENTS_U * 2 + SEGMENTS_T * 2 + rows * 2;
  const indices = new Uint32Array(triangles * 3);
  let cursor = 0;
  const tri = (a: number, b: number, c: number) => {
    indices[cursor++] = a;
    indices[cursor++] = b;
    indices[cursor++] = c;
  };

  // Body shell. Wound so normals face outward, away from the centreline.
  for (let i = 0; i < SEGMENTS_T; i++) {
    for (let j = 0; j < SEGMENTS_U; j++) {
      const a = i * rows + j;
      const b = a + rows;
      tri(a, b, a + 1);
      tri(b, b + 1, a + 1);
    }
  }

  // Flat underside, between the two sill edges. Outward is -y.
  for (let i = 0; i < SEGMENTS_T; i++) {
    const rightSill = i * rows;
    const leftSill = i * rows + rows - 1;
    tri(rightSill, leftSill, rightSill + rows);
    tri(leftSill, leftSill + rows, rightSill + rows);
  }

  // End caps, fanned from a centre vertex around the closed section loop.
  for (let j = 0; j < rows; j++) {
    const next = (j + 1) % rows;
    tri(noseCentre, j, next); // outward is -x
    tri(tailCentre, SEGMENTS_T * rows + next, SEGMENTS_T * rows + j); // +x
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}
