import { BufferGeometry, BufferAttribute } from "three";
import { STAGE_DEFAULTS, type StageConfig } from "./stage-config";

/**
 * A dealership paint tester — the sculpted display solid a body shop or
 * showroom puts a colour on so you can read it across compound curves before
 * committing to it. Car-like silhouette in plan, domed top with scooped
 * flanks and a raised haunch, sitting on a flat base.
 *
 * Generated entirely in code: no model file, nothing licensed, nothing traced
 * from a real manufacturer's bodywork. The alternating convex and concave
 * regions are the whole point — they bend a straight light strip into the
 * S-shaped highlight bands that tell you whether a finish is any good. That is
 * exactly what this business sells, and it is what the brand is named after.
 *
 * Built as three parts with consistent outward winding: the top surface, a
 * short side skirt down each flank, and a flat base cap.
 */

const SEGMENTS_T = 176; // along the length
const SEGMENTS_S = 104; // across the width

/** Base is tucked slightly inside the widest point, so the flank bulges. */
const BASE_TUCK = 0.94;
/** Keeps the tapered ends from collapsing into degenerate triangles. */
const MIN_HALF_WIDTH = 0.03;

type Form = StageConfig["form"];

/** Plan-view silhouette: blunt rounded nose, fuller toward the tail. */
function halfWidth(t: number, form: Form): number {
  const blunt = Math.pow(Math.sin(Math.PI * t), 0.45);
  return Math.max(MIN_HALF_WIDTH, form.widthScale * blunt * (0.8 + 0.3 * t));
}

/** Where the top surface meets the skirt — tapers to nothing at both ends. */
function edgeHeight(t: number, form: Form): number {
  return form.edgeHeight * Math.pow(Math.sin(Math.PI * t), 0.5);
}

/** The lengthwise crown of the dome. */
function crown(t: number, form: Form): number {
  return form.crownHeight * Math.pow(Math.sin(Math.PI * (0.02 + 0.96 * t)), 0.7);
}

/**
 * Sculpted features laid over the dome, as Gaussian bumps in (t, s).
 * Negative amplitudes are scoops. This array is the shape's personality —
 * tune it here rather than anywhere else.
 */
const FEATURES: ReadonlyArray<{
  t: number;
  s: number;
  rt: number;
  rs: number;
  amp: number;
}> = [
  // Long hollow down the front flank — the scallop that breaks the highlight.
  { t: 0.3, s: -0.44, rt: 0.17, rs: 0.3, amp: -0.17 },
  // Rear quarter scoop on the opposite flank, so the two read against each other.
  { t: 0.71, s: 0.38, rt: 0.14, rs: 0.27, amp: -0.15 },
  // Raised haunch over the rear wheel line.
  { t: 0.79, s: -0.3, rt: 0.13, rs: 0.31, amp: 0.11 },
  // Soft spine along the centre, forward of the midpoint.
  { t: 0.42, s: 0.03, rt: 0.23, rs: 0.17, amp: 0.075 },
  // Shallow dish just behind the nose.
  { t: 0.16, s: 0.16, rt: 0.11, rs: 0.34, amp: -0.07 },
];

function featureOffset(t: number, s: number, form: Form): number {
  let sum = 0;
  for (const f of FEATURES) {
    const dt = (t - f.t) / f.rt;
    const ds = (s - f.s) / f.rs;
    sum += f.amp * Math.exp(-(dt * dt + ds * ds));
  }
  return sum * form.featureDepth;
}

function topHeight(t: number, s: number, form: Form): number {
  // archExponent ~0.9 lands the dome on the silhouette at roughly a 2:1 slope.
  // Much lower and the top drops away almost vertically, which fights the rim
  // crease below it and reads as a knife edge rather than a rollover.
  const arch = Math.pow(Math.max(0, 1 - s * s), form.archExponent);
  // Features fade toward the silhouette edge so they never break the outline.
  const featureMask = Math.pow(arch, 0.5);
  // A crisp character line running the length, catching a hard highlight.
  const crease =
    0.045 * Math.exp(-Math.pow((s - 0.52) / 0.085, 2)) * Math.sin(Math.PI * t);

  return (
    edgeHeight(t, form) +
    crown(t, form) * arch +
    featureOffset(t, s, form) * featureMask +
    crease
  );
}

export function createPaintTesterGeometry(
  form: Form = STAGE_DEFAULTS.form,
): BufferGeometry {
  const cols = SEGMENTS_T + 1;
  const rows = SEGMENTS_S + 1;

  const topCount = cols * rows;
  // Per column: right-top, right-base, left-top, left-base.
  const skirtCount = cols * 4;
  const vertexCount = topCount + skirtCount;

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);

  const setVertex = (index: number, x: number, y: number, z: number, u: number, v: number) => {
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
    uvs[index * 2] = u;
    uvs[index * 2 + 1] = v;
  };

  for (let i = 0; i < cols; i++) {
    const t = i / SEGMENTS_T;
    const x = form.length * (t - 0.5);
    const w = halfWidth(t, form);
    const yEdge = edgeHeight(t, form);

    // Top surface.
    for (let j = 0; j < rows; j++) {
      const v = j / SEGMENTS_S;
      const s = v * 2 - 1;
      setVertex(i * rows + j, x, topHeight(t, s, form), w * s, t, v);
    }

    // Skirt. Its top vertices deliberately duplicate the top surface's edge so
    // the two get separate normals and the rollover reads as a crisp rim.
    const skirt = topCount + i * 4;
    setVertex(skirt, x, yEdge, w, t, 0);
    setVertex(skirt + 1, x, 0, w * BASE_TUCK, t, 1);
    setVertex(skirt + 2, x, yEdge, -w, t, 0);
    setVertex(skirt + 3, x, 0, -w * BASE_TUCK, t, 1);
  }

  const triangles = SEGMENTS_T * SEGMENTS_S * 2 + SEGMENTS_T * 6;
  const indices = new Uint32Array(triangles * 3);
  let cursor = 0;
  const tri = (a: number, b: number, c: number) => {
    indices[cursor++] = a;
    indices[cursor++] = b;
    indices[cursor++] = c;
  };

  // Top surface — wound so normals face up and out.
  for (let i = 0; i < SEGMENTS_T; i++) {
    for (let j = 0; j < SEGMENTS_S; j++) {
      const a = i * rows + j;
      const b = a + rows;
      tri(a, a + 1, b);
      tri(b, a + 1, b + 1);
    }
  }

  for (let i = 0; i < SEGMENTS_T; i++) {
    const here = topCount + i * 4;
    const next = topCount + (i + 1) * 4;
    const [rt, rb, lt, lb] = [here, here + 1, here + 2, here + 3];
    const [rtN, rbN, ltN, lbN] = [next, next + 1, next + 2, next + 3];

    // Right flank — outward is +z.
    tri(rt, rb, rtN);
    tri(rb, rbN, rtN);

    // Left flank — outward is -z, so the winding reverses.
    tri(lt, ltN, lb);
    tri(lb, ltN, lbN);

    // Base — outward is -y.
    tri(rb, lb, rbN);
    tri(lb, lbN, rbN);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  // Smooth normals are what let a highlight travel continuously across the
  // form instead of stepping from facet to facet.
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}
