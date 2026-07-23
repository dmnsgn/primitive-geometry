/** @module rectangle */

import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} RectangleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 */

/**
 * @alias module:rectangle
 * @param {RectangleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function rectangle({ sx = 1, sy = 0.5 } = {}) {
  checkArguments(arguments);

  const x = sx * 0.5;
  const y = sy * 0.5;

  return {
    // prettier-ignore
    positions:  Float32Array.of(
      -x, -y, 0,
      x, -y, 0,
      x, y, 0,
      -x, y, 0,
    ),
    cells: [[0, 1, 2, 3]],
  };
}
