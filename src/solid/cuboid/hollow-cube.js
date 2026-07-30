/** @module hollowCube */
import {
  computePlane,
  getCellsTypedArray,
  PLANE_DIRECTIONS,
} from "../../utils.js";

const DIRECTIONS = ["x", "-x", "y", "-y", "z", "-z"];

/**
 * Emit one box's 6 faces (`cube`'s own per-face computePlane calls,
 * generalized to an off-center box), with each face's uvScale/uvOffset
 * remapped so it lands exactly where it'd fall within a *single* computePlane
 * call spanning the whole hollow cube's face (fullSize) - ie. every piece's
 * outer face tiles into one continuous 0-1 UV square per direction, like a
 * plain `cube`'s, instead of each small piece getting its own independent
 * 0-1 range. Applied uniformly to every face (not just the ones that end up
 * on the outer boundary): interior/tunnel-facing faces get a well-defined,
 * harmless UV this way too, since they're never visible.
 * @private
 */
function computeBox(geometry, indices, dims, center, fullSize) {
  for (const direction of DIRECTIONS) {
    const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];
    const su = dims[u];
    const sv = dims[v];
    const pw = (direction[0] === "-" ? -0.5 : 0.5) * dims[w];

    const uvScale = [su / fullSize[u], sv / fullSize[v]];
    const uvOffset = [
      (1 - uvScale[0]) / 2 + (center[u] * flipU) / fullSize[u],
      (1 - uvScale[1]) / 2 - (center[v] * flipV) / fullSize[v],
    ];

    computePlane(
      geometry,
      indices,
      su,
      sv,
      1,
      1,
      direction,
      pw,
      uvScale,
      uvOffset,
      center,
    );
  }
}

/**
 * @typedef {object} HollowCubeOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [sz=sx]
 * @property {number} [thickness=sx*0.2] Uniform beam/wall size (must stay <
 * half of the smallest of sx/sy/sz for positive-length beams)
 */

/**
 * A cube with a square hole through the center of each face, like a single
 * cell of a Menger sponge: the 8 corners stay solid (t x t x t blocks) and
 * the 12 edges become beams of the same cross-section running between them.
 * Each of the 20 blocks is disjoint (no CSG/boolean union) and contributes
 * its own 6 faces via `computePlane`, offset into place - the only faces
 * that touch (each beam's 2 ends, flush against its 2 corner blocks) are
 * interior and never exposed by a hole, so the redundant back-to-back
 * surface there costs a few extra triangles but is never visible.
 * @alias module:hollowCube
 * @param {HollowCubeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function hollowCube({ sx = 1, sy = sx, sz = sx, thickness = sx * 0.2 } = {}) {

  const fullSize = [sx, sy, sz];
  const half = [sx * 0.5, sy * 0.5, sz * 0.5];
  const t = thickness;

  const boxes = [];

  for (const su of [-1, 1]) {
    for (const sv of [-1, 1]) {
      for (const sw of [-1, 1]) {
        boxes.push({
          dims: [t, t, t],
          center: [
            su * (half[0] - t / 2),
            sv * (half[1] - t / 2),
            sw * (half[2] - t / 2),
          ],
        });
      }
    }
  }

  for (let axis = 0; axis < 3; axis++) {
    const [u, v] = [0, 1, 2].filter((i) => i !== axis);

    for (const su of [-1, 1]) {
      for (const sv of [-1, 1]) {
        const dims = [t, t, t];
        dims[axis] = fullSize[axis] - 2 * t;

        const center = [0, 0, 0];
        center[u] = su * (half[u] - t / 2);
        center[v] = sv * (half[v] - t / 2);

        boxes.push({ dims, center });
      }
    }
  }

  const size = boxes.length * 6 * 4;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(boxes.length * 6 * 2 * 3),
  };

  const indices = { vertex: 0, cell: 0 };

  for (const { dims, center } of boxes) {
    computeBox(geometry, indices, dims, center, fullSize);
  }

  return geometry;
}
