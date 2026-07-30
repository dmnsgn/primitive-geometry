/** @module superellipse */
import { lamé } from "../../mappings.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
  TAU,
} from "../../utils.js";

// Lamé curve boundary point at angle t, already scaled by rx/ry - shared by
// superellipse's radial fill (rx/ry vary per ring) and superellipsePath's
// outline (rx/ry fixed at sx * radius/sy * radius, no ring interpolation).
function computeSuperellipseEdge(rx, ry, cosTheta, sinTheta, m, n) {
  return [
    rx * Math.abs(cosTheta) ** (2 / m) * Math.sign(cosTheta),
    ry * Math.abs(sinTheta) ** (2 / n) * Math.sign(sinTheta),
  ];
}

/**
 * @typedef {object} SuperellipseOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=true]
 * @property {Function} [mapping=mappings.lamé]
 * @property {number} [m=2]
 * @property {number} [n=m]
 */

/**
 * Lamé curve
 * See elliptical-mapping example for a few special cases
 * @see [Wolfram MathWorld – Superellipse]{@link https://mathworld.wolfram.com/Superellipse.html}
 * @see [Wikipedia – Superellipse]{@link https://en.wikipedia.org/wiki/Superellipse}
 * @alias module:superellipse
 * @param {SuperellipseOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function superellipse({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = true,
  mapping = lamé,
  m = 2,
  n = m,
} = {}) {
  return computePolarGeometry({
    sx,
    sy,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ rx, ry, cosTheta, sinTheta }) =>
      computeSuperellipseEdge(rx, ry, cosTheta, sinTheta, m, n),
  });
}

/**
 * @typedef {object} SuperellipsePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=0.5]
 * @property {number} [radius=0.5]
 * @property {number} [segments=32]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {number} [m=2]
 * @property {number} [n=m]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `superellipse`: the same Lamé curve, sampled directly with
 * no radial fill.
 * @alias module:superellipsePath
 * @param {SuperellipsePathOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplexPath}
 */
export function superellipsePath({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  theta = TAU,
  thetaOffset = 0,
  m = 2,
  n = m,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments,
    theta,
    thetaOffset,
    closed,
    equation: (t) =>
      computeSuperellipseEdge(
        sx * radius,
        sy * radius,
        Math.cos(t),
        Math.sin(t),
        m,
        n,
      ),
  });
}
