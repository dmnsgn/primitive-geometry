/** @module kite */
import { concentric } from "../../mappings.js";
import {
  checkArguments,
  computePolarGeometry,
  computePolygonEdge,
  HALF_PI,
  TAU,
} from "../../utils.js";

/**
 * @typedef {object} KiteOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [ratio=0.9] Bottom vertex distance from center, as a
 *   fraction of the top vertex's (sy). `ratio=1` is a rhombus, `ratio=0`
 *   collapses the bottom to the center.
 * @property {number} [radius=1]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid=true]
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
  theta = TAU,
  thetaOffset = HALF_PI,
  mergeCentroid = true,
  mapping = concentric,
} = {}) {
  checkArguments(arguments);

  return computePolarGeometry({
    sx,
    sy,
    radius,
    segments: edgeSegments * 4,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, ry, t }) =>
      computePolygonEdge(thetaOffset, 4, rx, ry, t, 1, 1, 1, ratio),
  });
}
