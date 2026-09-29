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
 * @property {number} [points=5]
 * @property {number} [density=2] Schläfli "skip" factor: must be `< points / 2`
 *   (and coprime with `points` for a genuine, non-compound star polygon) or the
 *   auto-computed `notchRadius` degenerates.
 * @property {number} [radius=0.5]
 * @property {number} [notchRadius=radius*computeStarRatio(points,density)]
 *   Radius of the points/tips' flanking concave vertices, ie. how deep the star's
 *   notches cut in.
 * @property {number} [innerRadius=0] Like `annulus`'s: a hole radius the fill
 *   stops at instead of reaching the center. `0` (default): no hole, fill
 *   reaches the center (subject to `mergeCentroid`).
 * @property {boolean} [circularHole=false] Only relevant when `innerRadius` is
 *   non-zero: `false` (default) traces the hole as a smaller, self-similar copy
 *   of the outer star; `true` traces it as a plain circle.
 * @property {number} [edgeSegments=1]
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid=innerRadius===0]
 * @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
 */

/**
 * Regular {points/density} star polygon: `points` outer tips alternating with
 * `points` inner notches. `notchRadius` defaults to the tips' own
 * `{points/density}` ratio, so e.g. the default `star()` traces a regular
 * pentagram.
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
 * @property {number} [points=5]
 * @property {number} [density=2]
 * @property {number} [radius=0.5]
 * @property {number} [notchRadius=radius*computeStarRatio(points,density)]
 * @property {number} [edgeSegments=1]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `star`: `points` outer tips alternating with `points` inner
 * notches, connected by straight edges.
 *
 * @param {StarPathOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplexPath} `edgeSegments *
 *   points * 2` positions (`+ 1` for a partial `theta`) and a single path cell
 *   of that many indices (`+ 1`, repeating index `0`, when `closed`)
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
