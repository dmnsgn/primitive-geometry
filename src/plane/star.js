/** @module star */
import { concentric } from "../mappings.js";
import {
  TAU,
  computeStarRatio,
} from "../utils/common.js";
import {
  computePolarGeometry,
  computePolarPathGeometry,
} from "../utils/polar.js";

/**
 * @typedef {object} StarOptions
 * @property {number} [points=5]
 * @property {number} [density=2] Schläfli "skip" factor: must be `< points /
 *   2` (and coprime with `points` for a genuine, non-compound star polygon)
 *   or the auto-computed `notchRadius` degenerates.
 * @property {number} [radius=0.5]
 * @property {number} [notchRadius=radius*computeStarRatio(points,density)]
 *   Radius of the points/tips' flanking concave vertices, ie. how deep the
 *   star's notches cut in.
 * @property {number} [innerRadius=0] Like `annulus`'s: a hole radius the fill
 *   stops at instead of reaching the center. `0` (default): no hole, fill
 *   reaches the center (subject to `mergeCentroid`).
 * @property {boolean} [circularHole=false] Only relevant when `innerRadius`
 *   is non-zero: `false` (default) traces the hole as a smaller, self-similar
 *   copy of the outer star; `true` traces it as a plain circle.
 * @property {number} [innerSegments=16]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [mergeCentroid] Defaults to `true` (fill to center)
 *   when `innerRadius` is `0`, `false` (leave the hole open) otherwise.
 * @property {Function} [mapping=mappings.concentric]
 */

/**
 * Regular {points/density} star polygon: `points` outer tips alternating
 * with `points` inner notches. `notchRadius` defaults to the tips' own
 * `{points/density}` ratio, so e.g. the default `star()` traces a regular
 * pentagram.
 * @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
 * @alias module:star
 * @param {StarOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 */
export function star({
  points = 5,
  density = 2,
  radius = 0.5,
  notchRadius = radius * computeStarRatio(points, density),
  innerRadius = 0,
  circularHole = false,
  innerSegments = 16,
  theta = TAU,
  thetaOffset = 0,
  mergeCentroid = innerRadius === 0,
  mapping = concentric,
} = {}) {
  // points * 2 so each tip/notch is sampled exactly once and edges come out
  // straight rather than curved.
  const segments = points * 2;
  const notchScale = radius === 0 ? 0 : notchRadius / radius;

  return computePolarGeometry({
    sx: 1,
    sy: 1,
    radius,
    segments,
    innerSegments,
    theta,
    thetaOffset,
    mergeCentroid,
    mapping,
    equation: ({ cosTheta, sinTheta, s, t }) => {
      const isTip =
        Math.round(((t - thetaOffset) / theta) * segments) % 2 === 0;

      const outerR = isTip ? radius : notchRadius;
      const holeR =
        circularHole || isTip ? innerRadius : innerRadius * notchScale;
      const r = holeR + (outerR - holeR) * s;

      return [r * cosTheta, r * sinTheta];
    },
  });
}

/**
 * @typedef {object} StarPathOptions
 * @property {number} [points=5]
 * @property {number} [density=2]
 * @property {number} [radius=0.5]
 * @property {number} [notchRadius=radius*computeStarRatio(points,density)]
 * @property {number} [theta=TAU]
 * @property {number} [thetaOffset=0]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `star`: `points` outer tips alternating with `points`
 * inner notches, connected by straight edges.
 * @alias module:starPath
 * @param {StarPathOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplexPath} `points * 2`
 *   positions and a single path cell of that many indices (`+ 1`, repeating
 *   index `0`, when `closed`)
 */
export function starPath({
  points = 5,
  density = 2,
  radius = 0.5,
  notchRadius = radius * computeStarRatio(points, density),
  theta = TAU,
  thetaOffset = 0,
  closed = false,
} = {}) {
  return computePolarPathGeometry({
    segments: points * 2,
    theta,
    thetaOffset,
    closed,
    // One vertex per tip/notch, no radial subdivision to interpolate
    // across, so tip/notch is just the sample's parity.
    equation: (t, i) => {
      const r = i % 2 === 0 ? radius : notchRadius;
      return [r * Math.cos(t), r * Math.sin(t)];
    },
  });
}
