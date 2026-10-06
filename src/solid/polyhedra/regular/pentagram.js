/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeStarRatio } from "../../../utils/common.js";

/**
 * Regular pentagram inner to outer radius ratio, `1 / PHI ** 2`.
 *
 * @private
 */
export const PENTAGRAM_RATIO = computeStarRatio(5, 2);

/**
 * A pentagon's other star layer: point i on the bisector of points i and i + 1,
 * at `ratio` times their radius. `PENTAGRAM_RATIO` gives a pentagram's inner
 * pentagon, its reciprocal the stellated tips.
 *
 * @private
 * @param {number[][]} points 5 coplanar points, equidistant from their
 *   centroid, in cyclic order
 * @param {number} ratio
 * @returns {number[][]}
 */
export function computeStarLayer(points, ratio) {
  const centroid = [0, 0, 0];
  for (const p of points) {
    centroid[0] += p[0];
    centroid[1] += p[1];
    centroid[2] += p[2];
  }
  centroid[0] /= 5;
  centroid[1] /= 5;
  centroid[2] /= 5;

  const vectors = points.map((p) => [
    p[0] - centroid[0],
    p[1] - centroid[1],
    p[2] - centroid[2],
  ]);
  const radius = Math.hypot(...vectors[0]) * ratio;

  return vectors.map((v, i) => {
    const w = vectors[(i + 1) % 5];
    const bx = v[0] + w[0];
    const by = v[1] + w[1];
    const bz = v[2] + w[2];
    const scale = radius / (Math.hypot(bx, by, bz) || 1);
    return [
      centroid[0] + bx * scale,
      centroid[1] + by * scale,
      centroid[2] + bz * scale,
    ];
  });
}

/**
 * Split a pentagram face into 8 triangles: 5 points and a 3-triangle fan across
 * the inner pentagon. Computed vertices aren't shared with other faces.
 *
 * @private
 * @param {number[][]} points 5 coplanar points, equidistant from their
 *   centroid, in cyclic order
 * @param {object} [options={}]
 * @param {boolean} [options.stellate=false] `points` are the inner pentagon,
 *   tips are computed, rather than the reverse
 * @returns {import("../../../../types.js").PolygonalComplex} 10 positions, tips
 *   first, and 8 triangles
 */
export function computePentagram(points, { stellate = false } = {}) {
  const other = computeStarLayer(
    points,
    stellate ? 1 / PENTAGRAM_RATIO : PENTAGRAM_RATIO,
  );

  // Computed point i sits between given points i and i + 1, so a tip's inner
  // corners are (i, i + 1) when tips are computed, (i, i - 1) otherwise
  const cells = [];
  for (let i = 0; i < 5; i++) {
    cells.push(
      stellate ? [i, 5 + ((i + 1) % 5), 5 + i] : [i, 5 + i, 5 + ((i + 4) % 5)],
    );
  }
  cells.push([5, 6, 7], [5, 7, 8], [5, 8, 9]);

  return {
    positions: stellate ? [...other, ...points] : [...points, ...other],
    cells,
  };
}

/**
 * Snap near-duplicate positions onto one representative so seams weld exactly.
 * Mutates in place.
 *
 * @private
 * @param {number[][]} positions
 * @param {number} [epsilon=1e-5] Relative tolerance
 */
export function weldNearDuplicates(positions, epsilon = 1e-5) {
  let scale = 0;
  for (const p of positions) {
    scale = Math.max(scale, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
  }
  // Relative so any radius welds alike
  const tolerance = (scale || 1) * epsilon;

  // Linear scan: seeds are small, and no hashing means no grid-boundary misses
  const canonical = [];
  for (const p of positions) {
    const match = canonical.find(
      (q) =>
        Math.abs(p[0] - q[0]) <= tolerance &&
        Math.abs(p[1] - q[1]) <= tolerance &&
        Math.abs(p[2] - q[2]) <= tolerance,
    );
    if (match === undefined) canonical.push(p);
    else {
      p[0] = match[0];
      p[1] = match[1];
      p[2] = match[2];
    }
  }
}

/**
 * @private
 * @callback ComputeFaceFn
 * @param {number[][]} points The face's xyz vertices
 * @returns {import("../../../../types.js").PolygonalComplex}
 */

/**
 * Assemble per-face fragments into one welded seed.
 *
 * @private
 * @param {Float32Array | number[]} vertexPositions Flat xyz positions
 * @param {number[][]} faces Vertex index groups
 * @param {ComputeFaceFn} computeFace
 * @returns {import("../../../../types.js").PolygonalComplex}
 */
export function assembleFaces(vertexPositions, faces, computeFace) {
  const point = (i) => [
    vertexPositions[i * 3],
    vertexPositions[i * 3 + 1],
    vertexPositions[i * 3 + 2],
  ];

  const positions = [];
  const cells = [];
  for (const face of faces) {
    const fragment = computeFace(face.map(point));
    const offset = positions.length;
    positions.push(...fragment.positions);
    for (const cell of fragment.cells) cells.push(cell.map((i) => i + offset));
  }

  weldNearDuplicates(positions);

  return { positions: Float32Array.of(...positions.flat()), cells };
}
