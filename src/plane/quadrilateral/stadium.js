/** @module stadium */
import { roundedRectangle, roundedRectanglePath } from "./rounded-rectangle.js";

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
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function stadium({
  sx = 1,
  sy = 0.5,
  nx,
  ny,
  roundSegments,
  edgeSegments,
} = {}) {
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

/**
 * @typedef {object} StadiumPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=sx]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [roundSegments=8]
 * @property {number} [edgeSegments=1]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `stadium`: `roundedRectanglePath` with `radius` fixed to
 * half the shorter side, collapsing that axis's straight section to 0 (two
 * semicircular caps joined by straight edges).
 * @alias module:stadiumPath
 * @param {StadiumPathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function stadiumPath({
  sx = 1,
  sy = 0.5,
  nx,
  ny,
  roundSegments,
  edgeSegments,
  closed,
} = {}) {
  return roundedRectanglePath({
    sx,
    sy,
    nx,
    ny,
    radius: Math.min(sx, sy) * 0.5,
    roundSegments,
    edgeSegments,
    closed,
  });
}
