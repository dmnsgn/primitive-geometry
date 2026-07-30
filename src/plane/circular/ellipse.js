/** @module ellipse */
import { elliptical } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
} from "../../utils/polar.js";

/**
 * @typedef {object} EllipseOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [innerRadius=0] Like `annulus`'s: a hole radius the
 *   fill stops at instead of reaching the center. `0` (default): no hole,
 *   fill reaches the center (subject to `mergeCentroid`).
 * @property {boolean} [mergeCentroid=innerRadius === 0]
 * @property {Function} [mapping=mappings.elliptical]
 * @property {Function} [equation] Maps each (rx, ry, cosTheta, sinTheta)
 *   sample to its [x, y] position, defaulting to an ellipse's arc.
 */

/**
 * An ellipse (or circle when `sx = sy`).
 * @alias module:ellipse
 * @param {EllipseOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function ellipse({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  innerRadius = 0,
  mergeCentroid = innerRadius === 0,
  mapping = elliptical,
  equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta],
} = {}) {
  return computePolarGeometry({
    sx,
    sy,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    innerRadius,
    mergeCentroid,
    mapping,
    equation,
  });
}

/**
 * @typedef {object} EllipsePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `ellipse`: sx/sy independently scale the two axes, same as
 * `circlePath` with sx = sy = 1.
 * @alias module:ellipsePath
 * @param {EllipsePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath} `segments`
 *   positions and a single path cell of `segments` indices (`segments + 1`,
 *   repeating index `0`, when `closed`)
 */
export function ellipsePath({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments,
    theta,
    thetaOffset,
    closed,
    equation: (t) => [sx * radius * Math.cos(t), sy * radius * Math.sin(t)],
  });
}
