import { BufferGeometry, BufferAttribute } from "three";
import { STAGE_DEFAULTS, type StageConfig } from "./stage-config";

/**
 * A sports-coupe body, generated as a loft: a closed cross-section swept along
 * a silhouette profile from nose to tail, with wheel arches cut into the
 * rocker line and wheels sitting in them.
 *
 * Proportions follow the front-engine 2+2 coupe genre — long dash-to-axle,
 * cab-rearward greenhouse, fastback roofline, wide rear hips, and a wheelbase
 * of roughly 0.62 of overall length. Genre proportions, not a manufacturer's
 * design: there is no grille, no lamps, no badging, and no panel work traced
 * from a real vehicle.
 *
 * All curves below are normalised 0–1 against the overall dimension they
 * describe, so `length`, `width`, and `height` in the config are literal scene
 * units rather than arbitrary multipliers.
 */

const SEGMENTS_T = 216; // stations along the length
const SEGMENTS_U = 88; // points around each cross-section

type Form = StageConfig["form"];

interface Key {
  t: number;
  v: number;
}

/** Catmull-Rom through keyframes, endpoints clamped. */
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

/** Where the axles sit along the length. Wheelbase ≈ 0.62 of overall length. */
export const FRONT_AXLE = 0.16;
export const REAR_AXLE = 0.78;
/** Wheel radius as a fraction of overall height. */
const WHEEL_RADIUS = 0.22;

/** The roofline, as a fraction of overall height. Peak is 1.0 by definition. */
const SILHOUETTE: Key[] = [
  { t: 0.0, v: 0.4 }, // nose, bumper height
  { t: 0.06, v: 0.52 },
  { t: 0.14, v: 0.58 }, // hood over the front axle
  { t: 0.26, v: 0.6 },
  { t: 0.36, v: 0.64 }, // cowl — base of the windscreen
  { t: 0.45, v: 0.86 }, // header, steeply raked
  { t: 0.56, v: 1.0 }, // roof peak, set well back
  { t: 0.64, v: 0.98 },
  { t: 0.76, v: 0.88 }, // rear glass falling fast
  { t: 0.88, v: 0.78 }, // deck lid
  { t: 1.0, v: 0.66 }, // tail
];

/**
 * The rocker line — the bottom edge of the bodywork. Low between the axles,
 * arching up over each wheel. This curve is what makes it read as a car rather
 * than a shape: without the arches the eye never finds the wheels.
 */
const ROCKER: Key[] = [
  { t: 0.0, v: 0.2 }, // front overhang, under the bumper
  { t: 0.08, v: 0.15 },
  { t: FRONT_AXLE - 0.05, v: 0.3 },
  { t: FRONT_AXLE, v: 0.46 }, // front arch crown
  { t: FRONT_AXLE + 0.05, v: 0.3 },
  { t: 0.3, v: 0.12 },
  { t: 0.5, v: 0.1 }, // sill, the lowest point
  { t: 0.68, v: 0.12 },
  { t: REAR_AXLE - 0.05, v: 0.3 },
  { t: REAR_AXLE, v: 0.46 }, // rear arch crown
  { t: REAR_AXLE + 0.05, v: 0.3 },
  { t: 0.92, v: 0.15 },
  { t: 1.0, v: 0.21 },
];

/** Plan-view width, as a fraction of overall width. */
const BODY_WIDTH: Key[] = [
  { t: 0.0, v: 0.34 },
  { t: 0.05, v: 0.66 },
  { t: 0.14, v: 0.92 }, // front arch
  { t: 0.24, v: 0.94 },
  { t: 0.45, v: 0.9 }, // doors
  { t: 0.62, v: 0.94 },
  { t: 0.76, v: 1.0 }, // rear hip — widest
  { t: 0.88, v: 0.94 },
  { t: 0.96, v: 0.78 },
  { t: 1.0, v: 0.44 },
];

/** Greenhouse width, as a fraction of body width at that station. */
const ROOF_WIDTH: Key[] = [
  { t: 0.0, v: 0.0 },
  { t: 0.32, v: 0.0 },
  { t: 0.4, v: 0.42 },
  { t: 0.52, v: 0.62 },
  { t: 0.64, v: 0.6 },
  { t: 0.76, v: 0.4 },
  { t: 0.84, v: 0.0 },
  { t: 1.0, v: 0.0 },
];

/** Belt line, as a fraction of overall height. */
const SHOULDER_HEIGHT: Key[] = [
  { t: 0.0, v: 0.32 },
  { t: 0.14, v: 0.5 },
  { t: 0.36, v: 0.6 },
  { t: 0.58, v: 0.62 },
  { t: 0.8, v: 0.6 },
  { t: 1.0, v: 0.5 },
];

/** Extra hip over the rear axle, scaled by `haunch`. */
function haunchBulge(t: number): number {
  return 0.07 * Math.exp(-Math.pow((t - REAR_AXLE) / 0.11, 2));
}

export function bodyHalfWidth(t: number, form: Form): number {
  return (
    (form.width / 2) * (sampleCurve(BODY_WIDTH, t) + haunchBulge(t) * form.haunch)
  );
}

interface SectionPoint {
  y: number;
  z: number;
}

/**
 * One cross-section: a Catmull-Rom through four control points — rocker,
 * shoulder (widest), crown, centreline. `v` runs 0 at the rocker to 1 at the
 * centreline.
 */
function section(t: number, v: number, form: Form): SectionPoint {
  const halfWidth = bodyHalfWidth(t, form);
  const top = form.height * sampleCurve(SILHOUETTE, t);
  const bottom = form.height * sampleCurve(ROCKER, t);
  const shoulder = form.height * sampleCurve(SHOULDER_HEIGHT, t);
  const roofFraction = sampleCurve(ROOF_WIDTH, t);

  const cabin = Math.min(1, roofFraction / 0.3);
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

  // The crown control must never land on the centreline: with a zero-width
  // roof the spline's last segment degenerates and the hood and deck come out
  // with sideways normals. Wide over the hood and deck, pinched through the
  // cabin — that pinch is the tumblehome.
  const crownZ = halfWidth * 0.6;
  const glassZ = halfWidth * Math.max(roofFraction, 0.2) * (1 - 0.35 * form.tumblehome);
  const floorY = Math.max(shoulder, bottom) + 0.02 * form.height;
  const crownY = Math.max(floorY, top - 0.1 * form.height);
  const glassY = Math.max(floorY, top - 0.04 * form.height);

  const controls: SectionPoint[] = [
    { z: halfWidth * form.sillTuck, y: bottom },
    { z: halfWidth, y: Math.max(shoulder, bottom + 0.01 * form.height) },
    { z: lerp(crownZ, glassZ, cabin), y: lerp(crownY, glassY, cabin) },
    { z: 0, y: top },
  ];

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
    y: blend(p0.y, p1.y, p2.y, p3.y),
  };
}

export function createCarBodyGeometry(
  form: Form = STAGE_DEFAULTS.form,
): BufferGeometry {
  const cols = SEGMENTS_T + 1;
  const rows = SEGMENTS_U + 1;

  const bodyCount = cols * rows;
  const noseCentre = bodyCount;
  const tailCentre = bodyCount + 1;

  const positions = new Float32Array((bodyCount + 2) * 3);
  const uvs = new Float32Array((bodyCount + 2) * 2);

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
      const u = j / SEGMENTS_U;
      const side = u < 0.5 ? 1 : -1;
      const v = u < 0.5 ? u * 2 : (1 - u) * 2;
      const point = section(t, v, form);
      put(i * rows + j, x, point.y, point.z * side, t, u);
    }
  }

  const noseY = form.height * (sampleCurve(SILHOUETTE, 0) + sampleCurve(ROCKER, 0)) * 0.5;
  const tailY = form.height * (sampleCurve(SILHOUETTE, 1) + sampleCurve(ROCKER, 1)) * 0.5;
  put(noseCentre, form.length * -0.5, noseY, 0, 0, 0.5);
  put(tailCentre, form.length * 0.5, tailY, 0, 1, 0.5);

  const triangles = SEGMENTS_T * SEGMENTS_U * 2 + SEGMENTS_T * 2 + rows * 2;
  const indices = new Uint32Array(triangles * 3);
  let cursor = 0;
  const tri = (a: number, b: number, c: number) => {
    indices[cursor++] = a;
    indices[cursor++] = b;
    indices[cursor++] = c;
  };

  // Body shell, wound so normals face outward.
  for (let i = 0; i < SEGMENTS_T; i++) {
    for (let j = 0; j < SEGMENTS_U; j++) {
      const a = i * rows + j;
      const b = a + rows;
      tri(a, b, a + 1);
      tri(b, b + 1, a + 1);
    }
  }

  // Underside, spanning the two rocker edges. Outward is -y.
  for (let i = 0; i < SEGMENTS_T; i++) {
    const right = i * rows;
    const left = i * rows + rows - 1;
    tri(right, left, right + rows);
    tri(left, left + rows, right + rows);
  }

  // End caps, fanned around the closed section loop.
  for (let j = 0; j < rows; j++) {
    const next = (j + 1) % rows;
    tri(noseCentre, j, next);
    tri(tailCentre, SEGMENTS_T * rows + next, SEGMENTS_T * rows + j);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

/**
 * Four wheels as flat cylinders, sitting in the arches. Rendered as a separate
 * mesh with a dark material — the tonal break between body and wheel is a
 * large part of what makes the silhouette read.
 */
export function createWheelsGeometry(
  form: Form = STAGE_DEFAULTS.form,
): BufferGeometry {
  const RADIAL = 40;
  const radius = WHEEL_RADIUS * form.height * form.wheelSize;
  const halfTread = 0.055 * form.width * form.wheelSize;

  const axles = [FRONT_AXLE, REAR_AXLE];
  const perWheel = RADIAL * 2 + 2; // rim ring on each face, plus two hub centres
  const positions = new Float32Array(axles.length * 2 * perWheel * 3);
  const indices: number[] = [];

  let vertex = 0;
  const push = (x: number, y: number, z: number) => {
    positions[vertex * 3] = x;
    positions[vertex * 3 + 1] = y;
    positions[vertex * 3 + 2] = z;
    return vertex++;
  };

  for (const t of axles) {
    const x = form.length * (t - 0.5);
    // Tuck the tread just inside the bodywork so the wheel sits in the arch.
    const trackZ = bodyHalfWidth(t, form) - halfTread - 0.02 * form.width;

    for (const side of [1, -1]) {
      const outer = trackZ * side;
      const inner = (trackZ - halfTread * 2) * side;
      const start = vertex;

      for (let k = 0; k < RADIAL; k++) {
        const a = (k / RADIAL) * Math.PI * 2;
        const cy = radius + Math.cos(a) * radius;
        const cx = x + Math.sin(a) * radius;
        push(cx, cy, outer);
        push(cx, cy, inner);
      }
      const hubOuter = push(x, radius, outer);
      const hubInner = push(x, radius, inner);

      for (let k = 0; k < RADIAL; k++) {
        const a0 = start + k * 2;
        const a1 = start + ((k + 1) % RADIAL) * 2;
        const o0 = a0;
        const i0 = a0 + 1;
        const o1 = a1;
        const i1 = a1 + 1;

        // Tread band. Winding flips with the side so normals face outward.
        if (side > 0) {
          indices.push(o0, i0, o1, i0, i1, o1);
          indices.push(hubOuter, o1, o0);
          indices.push(hubInner, i0, i1);
        } else {
          indices.push(o0, o1, i0, i0, o1, i1);
          indices.push(hubOuter, o0, o1);
          indices.push(hubInner, i1, i0);
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}
