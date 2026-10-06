/**
 * @module primitiveGeometry
 * @ignore
 */
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
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {number} [innerRadius=0] Hole radius. `0` fills to the center.
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.elliptical]
 * @property {EllipseEquationFn} [equation] Sample to [x, y] position. Defaults
 *   to the ellipse's arc.
 */

/**
 * @callback EllipseEquationFn
 * @param {object} sample
 * @param {number} sample.rx Scaled ring radius along x
 * @param {number} sample.ry Scaled ring radius along y
 * @param {number} sample.cosTheta
 * @param {number} sample.sinTheta
 * @param {number} sample.s Radius ratio (0..1, innerRadius to radius)
 * @param {number} sample.t Angle
 * @returns {[x, y]}
 */

/**
 * An ellipse (or circle when `sx = sy`).
 *
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
  mergeSeam = true,
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
    mergeSeam,
    mapping,
    equation,
  });
}

/**
 * @typedef {object} EllipsePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `ellipse`.
 *
 * @param {EllipsePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
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
