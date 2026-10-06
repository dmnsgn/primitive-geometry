/**
 * @module primitiveGeometry
 * @ignore
 */
import { fgSquircular } from "../../mappings.js";
import { HALF_PI, SQRT2, TAU } from "../../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
} from "../../utils/polar.js";

// Fernández-Guasti squircle boundary point at angle t, already scaled by
// rx/ry - shared by squircle's radial fill (rx/ry vary per ring) and
// squirclePath's outline (rx/ry fixed at sx * radius/sy * radius, no ring
// interpolation).
function computeSquircleEdge(rx, ry, cosTheta, sinTheta, t, squareness) {
  // Fix singularities
  // https://codereview.stackexchange.com/questions/233496/handling-singularities-in-squircle-parametric-equations
  switch (t) {
    case 0:
    case TAU: {
      return [rx, 0];
    }
    case HALF_PI: {
      return [0, ry];
    }
    case Math.PI: {
      return [-rx, 0];
    }
    case TAU - HALF_PI: {
      return [0, -ry];
    }
    default: {
      const sqrt = Math.sqrt(
        1 - Math.sqrt(1 - squareness ** 2 * Math.sin(2 * t) ** 2),
      );

      return [
        ((rx * Math.sign(cosTheta)) /
          (squareness * SQRT2 * Math.abs(sinTheta))) *
          sqrt,
        ((ry * Math.sign(sinTheta)) /
          (squareness * SQRT2 * Math.abs(cosTheta))) *
          sqrt,
      ];
    }
  }
}

/**
 * @typedef {object} SquircleOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=128]
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap
 *   edge for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.fgSquircular]
 * @property {number} [squareness=0.95] Squareness (0 < s <= 1)
 */

/**
 * Fernández-Guasti squircle
 *
 * @param {SquircleOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Squircular Calculations – Chamberlain Fong]{@link https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf}
 */
export function squircle({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 128,
  innerSegments = 16,
  innerRadius = 0,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
  mapping = fgSquircular,
  squareness = 0.95,
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
    equation: ({ rx, ry, cosTheta, sinTheta, t }) =>
      computeSquircleEdge(rx, ry, cosTheta, sinTheta, t, squareness),
  });
}

/**
 * @typedef {object} SquirclePathOptions
 * @property {number} [sx=1]
 * @property {number} [sy=1]
 * @property {number} [radius=0.5]
 * @property {import("../../../types.js").PositiveInteger} [segments=128]
 * @property {import("../../../types.js").Angle} [theta=TAU]
 * @property {import("../../../types.js").Angle} [thetaOffset=0]
 * @property {number} [squareness=0.95]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `squircle`: the same Fernández-Guasti curve, sampled directly
 * with no radial fill.
 *
 * @param {SquirclePathOptions} [options={}]
 * @returns {import("../../../types.js").PolylineComplex}
 */
export function squirclePath({
  sx = 1,
  sy = 1,
  radius = 0.5,
  segments = 128,
  theta = TAU,
  thetaOffset = 0,
  squareness = 0.95,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments,
    theta,
    thetaOffset,
    closed,
    equation: (t) =>
      computeSquircleEdge(
        sx * radius,
        sy * radius,
        Math.cos(t),
        Math.sin(t),
        t,
        squareness,
      ),
  });
}
