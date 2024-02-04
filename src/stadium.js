/** @module stadium */
import roundedRectangle from "./rounded-rectangle.js";
import { checkArguments } from "./utils.js";

/**
 * @typedef {object} StadiumOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 */

/**
 * @alias module:stadium
 * @param {StadiumOptions} [options={}]
 * @returns {import("../types.js").SimplicialComplex}
 */
function stadium({
  sx = 1,
  sy = 0.5,
  nx,
  ny,
  roundSegments,
  edgeSegments,
} = {}) {
  checkArguments(arguments);

  return roundedRectangle({
    sx,
    sy,
    nx,
    ny,
    radius: Math.min(sx, sy) * 0.5,
    roundSegments,
    edgeSegments,
  });
}

export default stadium;
