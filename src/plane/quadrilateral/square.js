/** @module square */

import { rectangle } from "./rectangle.js";
import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} SquareOptions
 * @property {number} [scale=0.5]
 * @property {number} [nx=1] Segments along the bottom/top edges
 * @property {number} [ny=nx] Segments along the left/right edges
 */

/**
 * @param {SquareOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function square({ scale = 0.5, nx = 1, ny = nx } = {}) {
  checkArguments(arguments);

  return rectangle({ sx: scale * 2, sy: scale * 2, nx, ny });
}
