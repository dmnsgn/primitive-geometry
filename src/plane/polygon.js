/** @module polygon */
import { concentric } from "../mappings.js";
import {
  checkArguments,
  computePolarGeometry,
  computePolygonEdge,
  TAU,
} from "../utils.js";

/**
 * @typedef {object} PolygonOptions
 * @property {number} [sides=6]
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * A regular polygon: sides corners evenly spaced around a circle, connected
 * by straight edges rather than ellipse's elliptical arc (rhombus is this
 * shape's sides=4 case). computePolygonEdge locates which side a sample
 * falls on and linearly interpolates between that side's two corners, so
 * edgeSegments subdivides each side into evenly spaced points. sx/sy
 * independently scale the two axes; equal values keep it regular, different
 * values stretch it into an ellipse-inscribed polygon.
 * @alias module:polygon
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
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = true,
  mapping = concentric,
} = {}) {
  checkArguments(arguments);

  return computePolarGeometry({
    sx,
    sy,
    radius,
    segments: edgeSegments * sides,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, ry, t }) => computePolygonEdge(thetaOffset, sides, rx, ry, t),
  });
}
