/** @module quad */

import { squarePath } from "./square-path.js";
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
    normals: Int8Array.of(
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ),
    // prettier-ignore
    uvs: Uint8Array.of(
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ),
    cells: triangulateFaces(cells, 4),
  };
}
