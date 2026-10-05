/**
 * @module primitiveGeometry
 * @ignore
 */
import { roundedRectangle, roundedRectanglePath } from "./rounded-rectangle.js";

/**
 * @typedef {object} StadiumOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [roundSegments=8]
 */

/**
 * A stadium (discorectangle): `roundedRectangle` with `radius` fixed to half
 * the shorter side.
 *
 * @param {StadiumOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function stadium({ sx = 1, sy = 0.5, nx, ny, roundSegments } = {}) {
  return roundedRectangle({
    sx,
    sy,
    nx,
    ny,
    radius: Math.min(sx, sy) * 0.5,
    roundSegments,
  });
}

/**
 * @typedef {object} StadiumPathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [nx=1]
 * @property {number} [ny=nx]
 * @property {number} [roundSegments=8]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `stadium`: `roundedRectanglePath` with `radius` fixed to half
 * the shorter side, collapsing that axis's straight section to 0 (two
 * semicircular caps joined by straight edges).
 *
 * @param {StadiumPathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function stadiumPath({
  sx = 1,
  sy = 0.5,
  nx,
  ny,
  roundSegments,
  closed,
} = {}) {
  return roundedRectanglePath({
    sx,
    sy,
    nx,
    ny,
    radius: Math.min(sx, sy) * 0.5,
    roundSegments,
    closed,
  });
}
