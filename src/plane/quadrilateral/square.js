/** @module square */

import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} SquareOptions
 * @property {number} [scale=0.5]
 */

/**
 * @param {SquareOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function square({ scale = 0.5 } = {}) {
  checkArguments(arguments);

  return {
    // prettier-ignore
    positions:  Float32Array.of(
      -scale, -scale, 0,
      scale, -scale, 0,
      scale, scale, 0,
      -scale, scale, 0,
    ),
    cells: [[0, 1, 2, 3]],
  };
}
