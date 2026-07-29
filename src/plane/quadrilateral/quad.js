/** @module quad */

import { rectanglePath } from "./plane.js";
import { checkArguments, triangulateFaces } from "../../utils.js";

/**
 * @typedef {object} QuadOptions
 * @property {number} [scale=0.5]
 */

/**
 * @alias module:quad
 * @param {QuadOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function quad({ scale = 0.5 } = {}) {
  checkArguments(arguments);

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
 * @property {number} [scale=0.5]
 * @property {number} [nx=1] Segments along the bottom/top edges
 * @property {number} [ny=nx] Segments along the left/right edges
 */

/**
 * Outline dual of `quad`: `rectanglePath` with equal sx/sy, same as `quad`
 * itself is built from it.
 * @alias module:squarePath
 * @param {SquarePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function squarePath({ scale = 0.5, nx = 1, ny = nx } = {}) {
  checkArguments(arguments);

  return rectanglePath({ sx: scale * 2, sy: scale * 2, nx, ny });
}
