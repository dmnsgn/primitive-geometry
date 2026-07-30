/** @module parallelogram */
import { trapezoid, trapezoidPath } from "./trapezoid.js";

/**
 * @typedef {object} ParallelogramOptions
 * @property {number} [sx=0.5] Narrower than `trapezoid`'s own default (`1`)
 *   so that, combined with the default `shear`, the sheared top edge still
 *   fits within the unit box (`sx + shear` reaching past `1` would push it
 *   out).
 * @property {number} [sy=1]
 * @property {number} [shear=0.3] Horizontal shift of the top edge's center,
 *   as a fraction of `sx` (`trapezoid`'s `topOffset`, renamed since fixing
 *   `topRatio` to `1` leaves no width left to describe as a ratio).
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.rectangular]
 */

/**
 * A parallelogram: `trapezoid` with `topRatio` fixed to `1` (top and bottom
 * edges the same width) and shifted sideways by `shear`.
 * @alias module:parallelogram
 * @param {ParallelogramOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function parallelogram({
  sx = 0.5,
  sy = 1,
  shear = 0.3,
  radius,
  edgeSegments,
  innerSegments,
  innerRadius,
  theta,
  thetaOffset,
  mergeCentroid,
  mapping,
} = {}) {
  return trapezoid({
    sx,
    sy,
    topRatio: 1,
    topOffset: shear,
    radius,
    edgeSegments,
    innerSegments,
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
  });
}

/**
 * @typedef {object} ParallelogramPathOptions
 * @property {number} [sx=0.5]
 * @property {number} [sy=1]
 * @property {number} [shear=0.3]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `parallelogram`: `trapezoidPath` with `topRatio` fixed to
 * `1`, shifted sideways by `shear`.
 * @alias module:parallelogramPath
 * @param {ParallelogramPathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function parallelogramPath({
  sx = 0.5,
  sy = 1,
  shear = 0.3,
  radius,
  edgeSegments,
  theta,
  thetaOffset,
  closed,
} = {}) {
  return trapezoidPath({
    sx,
    sy,
    topRatio: 1,
    topOffset: shear,
    radius,
    edgeSegments,
    theta,
    thetaOffset,
    closed,
  });
}
