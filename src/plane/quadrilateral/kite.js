/**
 * @module primitiveGeometry
 * @ignore
 */
import { concentric } from "../../mappings.js";
import { HALF_PI, TAU } from "../../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
  computePolygonEdge,
} from "../../utils/polar.js";

/**
 * @typedef {object} KiteOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [ratio=0.5] Bottom vertex distance from the center, as a
 *   fraction of the top's.
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A kite: a rhombus with its bottom vertex pulled toward the center.
 *
 * Special cases: rhombus (ratio = 1).
 *
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
  mergeSeam = true,
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
    mergeSeam,
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
 * @property {import("../../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=HALF_PI]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `kite`.
 *
 * @param {KitePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
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
