/** @module parallelogram */
import { trapezoid } from "./trapezoid.js";
import { checkArguments } from "../../utils.js";

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
  theta,
  thetaOffset,
  mergeCentroid,
  mapping,
} = {}) {
  checkArguments(arguments);

  return trapezoid({
    sx,
    sy,
    topRatio: 1,
    topOffset: shear,
    radius,
    edgeSegments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
  });
}
