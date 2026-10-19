/**
 * @module primitiveGeometry
 * @ignore
 */
import { getCellsTypedArray } from "../../utils/common.js";
import { PLANE_DIRECTIONS, computePlane } from "../../utils/plane-grid.js";

const AXES = ["x", "y", "z"];
const DIRECTIONS = ["x", "-x", "y", "-y", "z", "-z"];

/**
 * One off-center box's 6 faces, uvs remapped so outer faces tile one continuous
 * 0-1 square per direction, like `cube`'s.
 *
 * @private
 */
function computeBox(geometry, indices, { dims, center, faces }, fullSize) {
  for (const direction of faces) {
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
        const signs = [su, sv, sw];
        // Inward faces are covered by the 3 adjacent beams' end caps
        const inward = new Set(
          signs.map((s, i) => (s > 0 ? "-" : "") + AXES[i]),
        );
        boxes.push({
          dims: [t, t, t],
          center: signs.map((s, i) => s * (half[i] - t / 2)),
          faces: DIRECTIONS.filter((d) => !inward.has(d)),
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

        // Both end caps are covered by the corner boxes
        const ends = new Set([AXES[axis], `-${AXES[axis]}`]);
        boxes.push({
          dims,
          center,
          faces: DIRECTIONS.filter((d) => !ends.has(d)),
        });
      }
    }
  }

  const faceCount = boxes.reduce((sum, { faces }) => sum + faces.length, 0);
  const size = faceCount * 4;

  const geometry = {
    positions: new Float32Array(size * 3),
    normals: new Float32Array(size * 3),
    uvs: new Float32Array(size * 2),
    cells: new (getCellsTypedArray(size))(faceCount * 2 * 3),
  };

  const indices = { vertex: 0, cell: 0 };

  // 20 blocks without their shared faces: a closed surface, vertices unwelded
  // along the beam/corner seams like the cube's edges
  for (const box of boxes) computeBox(geometry, indices, box, fullSize);

  return geometry;
}
