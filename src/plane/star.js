/**
 * @module primitiveGeometry
 * @ignore
 */
import { concentric } from "../mappings.js";
import { TAU, computeStarRatio } from "../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
} from "../utils/polar.js";

// Point on the tip/notch outline at angle t. Corners are spread over theta (not
// TAU) so a partial sweep compresses the whole star rather than cutting it.
function computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t) {
  const cornerCount = points * 2;
  const local = ((t - thetaOffset) / theta) * cornerCount;
  const corner = Math.floor(local);
  const frac = local - corner;

  const cornerPoint = (k) => {
    const r = k % 2 === 0 ? radius : notchRadius;
    const angle = thetaOffset + (k / cornerCount) * theta;
    return [r * Math.cos(angle), r * Math.sin(angle)];
  };
  const [x0, y0] = cornerPoint(corner);
  const [x1, y1] = cornerPoint(corner + 1);

  return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}

/**
 * @typedef {object} StarOptions
 * @property {import("../../types.js").PositiveInteger} [points=5]
 * @property {import("../../types.js").PositiveInteger} [density=2] Schläfli
 *   skip factor: `< points / 2`, coprime with `points` for a non-compound
 *   star.
 * @property {number} [radius=0.5]
 * @property {number} [notchRadius=radius*computeStarRatio(points,density)]
 *   Radius of the concave vertices between tips.
 * @property {number} [innerRadius=0] Hole radius. `0` fills to the center.
 * @property {boolean} [circularHole=false] Trace the hole as a circle instead
 *   of a scaled star.
 * @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../types.js").PositiveInteger} [innerSegments=16]
 * @property {import("../../types.js").Angle} [theta=TAU]
 * @property {import("../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * A regular {points/density} star polygon: the default is a pentagram.
 *
 * @param {StarOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
 */
export function star({
  points = 5,
  density = 2,
  radius = 0.5,
  notchRadius = radius * computeStarRatio(points, density),
  innerRadius = 0,
  circularHole = false,
  edgeSegments = 1,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
  mapping = concentric,
} = {}) {
  const holeScale = radius === 0 ? 0 : innerRadius / radius;

  return computePolarGeometry({
    sx: 1,
    sy: 1,
    radius,
    segments: points * 2 * edgeSegments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mergeSeam,
    mapping,
    equation: ({ cosTheta, sinTheta, s, t }) => {
      const [x, y] = computeStarEdge(
        points,
        radius,
        notchRadius,
        theta,
        thetaOffset,
        t,
      );
      const [hx, hy] = circularHole
        ? [innerRadius * cosTheta, innerRadius * sinTheta]
        : [x * holeScale, y * holeScale];

      return [hx + (x - hx) * s, hy + (y - hy) * s];
    },
  });
}

/**
 * @typedef {object} StarPathOptions
 * @property {import("../../types.js").PositiveInteger} [points=5]
 * @property {import("../../types.js").PositiveInteger} [density=2]
 * @property {number} [radius=0.5]
 * @property {number} [notchRadius=radius*computeStarRatio(points,density)]
 * @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../types.js").Angle} [theta=TAU]
 * @property {import("../../types.js").Angle} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `star`.
 *
 * @param {StarPathOptions} [options={}]
 * @returns {import("../../types.js").PolylineComplex}
 */
export function starPath({
  points = 5,
  density = 2,
  radius = 0.5,
  notchRadius = radius * computeStarRatio(points, density),
  edgeSegments = 1,
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments: points * 2 * edgeSegments,
    theta,
    thetaOffset,
    closed,
    equation: (t) =>
      computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t),
  });
}
