import { BufferGeometry, BufferAttribute } from "three";

/**
 * A procedurally sculpted body panel — the crowned, tapering compound curve of
 * a hood or fender, complete with a character line down its length.
 *
 * Everything here is generated in code. There is no model file to download, no
 * asset to license, and nothing traced from a real manufacturer's bodywork.
 * The compound curvature is the entire point: a flat surface reflects a light
 * strip as a flat band, while a crowned one bends it into the long sweeping
 * highlight that reads as "finished paint".
 */

const SEGMENTS_U = 128; // along the length
const SEGMENTS_V = 88; // across the width
const LENGTH = 4.6;

/** Width tapers toward both ends, fullest just past the middle. */
function halfWidth(u: number): number {
  return 1.26 * (0.4 + 0.6 * Math.sin(Math.PI * (0.12 + 0.76 * u)));
}

/** How high the panel crowns at a given point along its length. */
function crown(u: number): number {
  return 0.66 * Math.pow(Math.sin(Math.PI * (0.06 + 0.88 * u)), 0.85);
}

export function createPanelGeometry(): BufferGeometry {
  const cols = SEGMENTS_U + 1;
  const rows = SEGMENTS_V + 1;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);

  for (let i = 0; i < cols; i++) {
    const u = i / SEGMENTS_U;
    const width = halfWidth(u);
    const height = crown(u);
    const lengthwiseRise = 0.12 * Math.sin(Math.PI * u);

    for (let j = 0; j < rows; j++) {
      const v = j / SEGMENTS_V;
      const s = v * 2 - 1; // -1 at one edge, +1 at the other

      // Dome across the width, falling to zero at both edges.
      const arch = Math.pow(Math.max(0, 1 - s * s), 0.62);

      // The character line: a narrow ridge running the length of the panel.
      // Small enough to read as a crease rather than a fin.
      const crease =
        0.055 * Math.exp(-Math.pow((s - 0.45) / 0.11, 2)) * Math.sin(Math.PI * u);

      const offset = (i * rows + j) * 3;
      positions[offset] = LENGTH * (u - 0.5);
      positions[offset + 1] = height * arch + crease + lengthwiseRise;
      positions[offset + 2] = width * s;

      const uvOffset = (i * rows + j) * 2;
      uvs[uvOffset] = u;
      uvs[uvOffset + 1] = v;
    }
  }

  const indices = new Uint32Array(SEGMENTS_U * SEGMENTS_V * 6);
  let cursor = 0;
  for (let i = 0; i < SEGMENTS_U; i++) {
    for (let j = 0; j < SEGMENTS_V; j++) {
      const a = i * rows + j;
      const b = a + rows;
      indices[cursor++] = a;
      indices[cursor++] = b;
      indices[cursor++] = a + 1;
      indices[cursor++] = b;
      indices[cursor++] = b + 1;
      indices[cursor++] = a + 1;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  // Smooth normals are what make the highlight travel continuously across the
  // surface instead of stepping from facet to facet.
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}
