/** @module squarePath */

import { rectanglePath } from "./rectangle-path.js";
import { checkArguments } from "../../utils.js";

/**
 * @typedef {object} SquarePathOptions
 * @property {number} [scale=0.5]
 * @property {number} [nx=1] Segments along the bottom/top edges
 * @property {number} [ny=nx] Segments along the left/right edges
 */

/**
 * @param {SquarePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function squarePath({ scale = 0.5, nx = 1, ny = nx } = {}) {
  checkArguments(arguments);

  return rectanglePath({ sx: scale * 2, sy: scale * 2, nx, ny });
}
