/** @module kite */
import { concentric } from "../../mappings.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
  computePolygonEdge,
  HALF_PI,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} KiteOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [ratio=0.5] Bottom vertex distance from center, as a
 *   fraction of the top vertex's (sy). `ratio=1` is a rhombus, `ratio=0`
 *   collapses the bottom to the center.
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid=innerRadius === 0]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * A kite: a rhombus with its bottom vertex pulled toward the center (by
 * ratio) while the top, left and right vertices stay put.
 * @alias module:kite
 * @param {KiteOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function kite({
  sx = 1,
  sy = 1,
  ratio = 0.5,
  radius = 0.5,
  edgeSegments = 1,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = HALF_PI,
  mergeCentroid = innerRadius === 0,
  mapping = concentric,
} = {}) {
  return computePolarGeometry({
    sx,
    sy,
    radius,
    segments: edgeSegments * 4,
    innerSegments,
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, ry, t }) =>
      computePolygonEdge(thetaOffset, 4, rx, ry, t, 1, 1, 1, ratio),
  });
}

/**
 * @typedef {object} KitePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [ratio=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `kite`: same shape, `ratio` pulling the bottom vertex
 * toward the center.
 * @alias module:kitePath
 * @param {KitePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function kitePath({
  sx = 1,
  sy = 1,
  ratio = 0.5,
  radius = 0.5,
  edgeSegments = 1,
  theta = TAU,
  thetaOffset = HALF_PI,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments: edgeSegments * 4,
    theta,
    thetaOffset,
    closed,
    equation: (t) =>
      computePolygonEdge(
        thetaOffset,
        4,
        sx * radius,
        sy * radius,
        t,
        1,
        1,
        1,
        ratio,
      ),
  });
}
