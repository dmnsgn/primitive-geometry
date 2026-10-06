/**
 * @module primitiveGeometry
 * @ignore
 */
import { roundedRectangle, roundedRectanglePath } from "./rounded-rectangle.js";

/**
 * @typedef {object} StadiumOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {import("../../../types.js").PositiveInteger} [nx=1]
 * @property {import("../../../types.js").PositiveInteger} [ny=nx]
 * @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
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
 * @property {import("../../../types.js").PositiveInteger} [nx=1]
 * @property {import("../../../types.js").PositiveInteger} [ny=nx]
 * @property {import("../../../types.js").PositiveInteger} [roundSegments=8]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `stadium`.
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
