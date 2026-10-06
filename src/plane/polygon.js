/**
 * @module primitiveGeometry
 * @ignore
 */
import { concentric } from "../mappings.js";
import { TAU } from "../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
  computePolygonEdge,
} from "../utils/polar.js";

/**
 * @typedef {object} PolygonOptions
 * @property {import("../../types.js").PositiveInteger} [sides=6]
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../types.js").Angle} [theta=TAU]
 * @property {import("../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap
 *   edge for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A regular polygon: sides corners evenly spaced around a circle, connected by
 * straight edges rather than ellipse's elliptical arc (rhombus is this shape's
 * sides=4 case). sx/sy independently scale the two axes; equal values keep it
 * regular, different values stretch it into an ellipse-inscribed polygon.
 *
 * @param {PolygonOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 */
export function polygon({
  sides = 6,
  sx = 1,
  sy = 1,
  radius = 0.5,
  edgeSegments = 1,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
  mapping = concentric,
} = {}) {
  return computePolarGeometry({
    sx,
    sy,
    radius,
    segments: edgeSegments * sides,
    innerSegments,
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mergeSeam,
    mapping,
    equation: ({ rx, ry, t }) =>
      computePolygonEdge(thetaOffset, sides, rx, ry, t),
  });
}

/**
 * @typedef {object} PolygonPathOptions
 * @property {import("../../types.js").PositiveInteger} [sides=6]
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../types.js").Angle} [theta=TAU]
 * @property {import("../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `polygon`: sides corners evenly spaced around a circle,
 * connected by straight edges (rhombus is this shape's sides=4 case).
 *
 * @param {PolygonPathOptions} [options={}]
 * @returns {import("../../types.js").PolylineComplex} `edgeSegments *
 *   sides` positions (`+ 1` for a partial `theta`) and a single path cell of
 *   that many indices (`+ 1`, repeating index `0`, when `closed`)
 */
export function polygonPath({
  sides = 6,
  sx = 1,
  sy = 1,
  radius = 0.5,
  edgeSegments = 1,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments: edgeSegments * sides,
    theta,
    thetaOffset,
    closed,
    equation: (t) =>
      computePolygonEdge(thetaOffset, sides, sx * radius, sy * radius, t),
  });
}
