/**
 * @module primitiveGeometry
 * @ignore
 */
import { lamé } from "../../mappings.js";
import { TAU } from "../../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
} from "../../utils/polar.js";

// Boundary point at angle t, scaled by rx/ry
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
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.lamé]
 * @property {number} [m=2]
 * @property {number} [n=m]
 */

/**
 * A superellipse (Lamé curve).
 *
 * Special cases: squircle (m = 4), rectellipse (m = 4, sx != sy), astroid (m =
 * 2/3), diamond (m = 1), Piet Hein's superellipse (m = 5/2).
 *
 * @param {SuperellipseOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Superellipse]{@link https://mathworld.wolfram.com/Superellipse.html}
 * @see [Wikipedia – Superellipse]{@link https://en.wikipedia.org/wiki/Superellipse}
 */
export function superellipse({
  sx = 1,
  sy = 0.5,
  radius = 0.5,
  segments = 32,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
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
    innerRadius,
    theta,
    thetaOffset,
    mergeCentroid,
    mergeSeam,
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
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {number} [m=2]
 * @property {number} [n=m]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `superellipse`.
 *
 * @param {SuperellipsePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
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
