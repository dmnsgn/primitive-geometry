/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeStarRatio } from "../../../utils/common.js";

/**
 * The regular pentagram ({5/2} star polygon)'s inner (reflex) to outer (tip)
 * radius ratio, `1 / PHI ** 2`. Also used by great-stellated-dodecahedron.js,
 * whose own depth-1 notches sit at the same ratio's reciprocal.
 *
 * @private
 */
export const PENTAGRAM_RATIO = computeStarRatio(5, 2);

/**
 * The 5 points of a regular pentagon's "other" star layer: point i sits between
 * the given points i and i + 1, along their bisector (the sum of the two
 * centroid-relative vectors, since they're 72° apart), at `ratio` times the
 * given points' distance from their centroid. `PENTAGRAM_RATIO` (the {5/2} star
 * polygon's inner/outer radius ratio, `1 / PHI ** 2`) yields the inner (reflex)
 * pentagon of a pentagram whose tips are given; its reciprocal (`PHI ** 2`)
 * yields the tips reached by extending the given pentagon's own edges until
 * they meet (one stellation step).
 *
 * @private
 * @param {number[][]} points 5 coplanar, equidistant-from-centroid points, in
 *   consecutive (not skip-2/star-path) cyclic order
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
 * Decompose a regular pentagram (5-pointed star) face into 8 filled triangles:
 * 5 "point" triangles plus a 3-triangle fan across the inner pentagon where its
 * edges cross. The 5 vertices not given are new points, not shared with any
 * other face - two star faces only ever share the given, non-computed layer.
 *
 * @private
 * @param {number[][]} points 5 coplanar, equidistant-from-centroid points, in
 *   consecutive (not skip-2/star-path) cyclic order
 * @param {object} [options={}]
 * @param {boolean} [options.stellate=false] `false` (default): `points` are the
 *   star's outer tips, and the inner (reflex) pentagon - where the star's edges
 *   cross - is computed at the regular pentagram's fixed inner/outer radius
 *   ratio `1/phi^2`. `true`: `points` are instead the _inner_ pentagon (e.g. a
 *   convex polyhedron's own face corners), and new outer tips are computed at
 *   `phi^2` - the genuine "extend a regular pentagon's edges until they meet"
 *   stellation, which needs `points`' own radius scaled up rather than a fresh
 *   smaller pentagon scaled down.
 * @returns {import("../../../../types.js").SimplicialComplexPolygon} 10
 *   positions (tips followed by inner points, regardless of which one was
 *   `points`) and 8 triangles, local indices
 */
export function computePentagram(points, { stellate = false } = {}) {
  const other = computeStarLayer(
    points,
    stellate ? 1 / PENTAGRAM_RATIO : PENTAGRAM_RATIO,
  );

  // Point-triangle i's apex (index i) sits, by the bisector definition
  // above, between points i and i + 1 - so its flanking inner-layer corners
  // are (i, i + 1) when the apex is the *computed* layer (stellate, where
  // that edge is also the fan's own boundary, making it an internal
  // diagonal rather than the face's outer edge), but (i, i - 1) when the
  // apex is the *given* layer (its own i already lines up with the computed
  // inner_i, whose bisector partner is i + 1)
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
 * Snap near-duplicate positions (mathematically identical points that ended up
 * computed independently, from different local contexts, and so agree only to
 * within float precision rather than bit-for-bit) onto one shared
 * representative, so they weld into exact seams instead of showing up as
 * cracks. Mutates each position array in place. The tolerance is relative to
 * the largest coordinate so any `radius` welds equally well, and each point is
 * compared against the representatives found so far (no spatial hashing, so no
 * grid-boundary misses). A linear scan meant for seed-sized point sets, not
 * arbitrary meshes.
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
  const tolerance = (scale || 1) * epsilon;

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
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
 */

/**
 * Assemble per-face geometry fragments into one seed: each face is a group of
 * indices into `vertexPositions`, handed as points to `computeFace`, whose
 * local positions/cells are offset into the shared arrays. Positions that
 * coincide across faces are then welded (see above) so the seed is watertight.
 *
 * @private
 * @param {Float32Array | number[]} vertexPositions Flat xyz positions
 * @param {number[][]} faces Vertex index groups
 * @param {ComputeFaceFn} computeFace
 * @returns {import("../../../../types.js").SimplicialComplexPolygon}
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
