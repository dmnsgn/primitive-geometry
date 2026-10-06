/**
 * @module primitiveGeometry
 * @ignore
 */

import { rectanglePath } from "./plane.js";
import { triangulateFaces } from "../../utils/common.js";

/**
 * @typedef {object} QuadOptions
 * @property {number} [scale=1] Side length.
 */

/**
 * A square, filled with 2 triangles.
 *
 * @param {QuadOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function quad({ scale = 1 } = {}) {
  const { positions, cells } = squarePath({ scale });

  return {
    positions,
    // prettier-ignore
    normals: Float32Array.of(
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ),
    // prettier-ignore
    uvs: Float32Array.of(
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ),
    cells: triangulateFaces(cells, 4),
  };
}

/**
 * @typedef {object} SquarePathOptions
 * @property {number} [scale=1] Side length.
 * @property {import("../../../types.js").PositiveInteger} [nx=1] Segments along the bottom/top edges
 * @property {import("../../../types.js").PositiveInteger} [ny=nx] Segments along the left/right edges
 */

/**
 * Outline dual of `quad`: `rectanglePath` with `sx = sy = scale`, same as
 * `quad` itself is built from it.
 *
 * @param {SquarePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function squarePath({ scale = 1, nx = 1, ny = nx } = {}) {
  return rectanglePath({ sx: scale, sy: scale, nx, ny });
}
