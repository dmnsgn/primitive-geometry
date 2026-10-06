/**
 * @module primitiveGeometry
 * @ignore
 */
import { getCellsTypedArray } from "../../utils/common.js";
import { PLANE_DIRECTIONS, computePlane } from "../../utils/plane-grid.js";

const DIRECTIONS = ["x", "-x", "y", "-y", "z", "-z"];

/**
 * One off-center box's 6 faces, uvs remapped so outer faces tile one continuous
 * 0-1 square per direction, like `cube`'s.
 *
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
 * @property {number} [thickness=sx*0.2] Beam size, below half the smallest of
 *   sx/sy/sz.
 */

/**
 * A cube with a square hole through each face, like a Menger sponge cell.
 *
 * @param {HollowCubeOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function hollowCube({
  sx = 1,
  sy = sx,
  sz = sx,
  thickness = sx * 0.2,
} = {}) {
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

  // 20 disjoint blocks, no boolean union: the faces where beams meet corners
  // are hidden, so they only cost a few triangles
  for (const { dims, center } of boxes) {
    computeBox(geometry, indices, dims, center, fullSize);
  }

  return geometry;
}
