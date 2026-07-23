/** @module square */

import { rectangle } from "./rectangle.js";
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

  return rectangle({ sx: scale * 2, sy: scale * 2 });
}
