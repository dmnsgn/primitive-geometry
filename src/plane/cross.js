/** @module cross */
import { rectangular } from "../mappings.js";
import { TAU } from "../utils/common.js";
import {
  computeOutlineEdge,
  computePolarGeometry,
  computePolarPathGeometry,
} from "../utils/polar.js";

const CORNER_COUNT = 12;

// CCW from the right arm's bottom-right corner, 2 outer + 1 inner corner per
// arm - shared by cross's radial fill (self-similar copy scaled per ring)
// and crossPath's outline (this exact boundary, no scaling needed).
function computeCrossOutline(r, w) {
  return [
    [r, -w],
    [r, w],
    [w, w],
    [w, r],
    [-w, r],
    [-w, w],
    [-r, w],
    [-r, -w],
    [-w, -w],
    [-w, -r],
    [w, -r],
    [w, -w],
  ];
}

/**
 * @typedef {object} CrossOptions
 * @property {number} [radius=0.5] Distance from the center to each arm's tip.
 * @property {number} [armWidth=radius/3] Half-width of each arm. Defaults to a
 *   third of `radius`, the classic Greek cross made of 5 equal squares.
 * @property {number} [segments=1] Column count per outline edge (the cross is a
 *   12-sided, non-regular dodecagon), swept around the outline.
 * @property {number} [innerSegments=16] Row count between the center and the
 *   outline at each column.
 * @property {number} [innerRadius=0] Like `star`'s: a hole radius the fill
 *   stops at instead of reaching the center, traced as a smaller, self- similar
 *   copy of the outer cross. `0` (default): no hole, fill reaches the center.
 * @property {boolean} [mergeCentroid=true]
 * @property {import("../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.
 */

/**
 * Greek cross: a plus-sign shaped non-regular dodecagon - 4 equal arms
 * extending from a square center, filled with a fan from the center.
 *
 * @param {CrossOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 * @alias module:cross
 * @see [Wolfram MathWorld – Greek Cross]{@link https://mathworld.wolfram.com/GreekCross.html}
 */
export function cross({
  radius = 0.5,
  armWidth = radius / 3,
  segments = 1,
  innerSegments = 16,
  innerRadius = 0,
  mergeCentroid = innerRadius === 0,
  mapping = rectangular,
} = {}) {
  const r = radius;
  const w = armWidth;
  const outline = computeCrossOutline(r, w);

  return computePolarGeometry({
    sx: 1,
    sy: 1,
    radius: r,
    segments: CORNER_COUNT * segments,
    innerSegments,
    innerRadius,
    mergeCentroid,
    mapping,
    equation: ({ rx, t }) => {
      // rx is the ring's interpolated radius (innerRadius..radius); scale
      // the full-size outline by its fraction of radius, a self-similar
      // copy of the outer cross at every ring, down to innerRadius.
      const scale = rx / r;
      const [x, y] = computeOutlineEdge(outline, 0, t);
      return [scale * x, scale * y];
    },
  });
}

/**
 * @typedef {object} CrossPathOptions
 * @property {number} [radius=0.5]
 * @property {number} [armWidth=radius/3]
 * @property {number} [segments=1]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `cross`: the same 12-corner outline, walked directly instead
 * of fanned from the center.
 *
 * @param {CrossPathOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplexPath}
 * @alias module:crossPath
 */
export function crossPath({
  radius = 0.5,
  armWidth = radius / 3,
  segments = 1,
  closed = false,
} = {}) {
  const outline = computeCrossOutline(radius, armWidth);

  return computePolarPathGeometry({
    segments: CORNER_COUNT * segments,
    theta: TAU,
    thetaOffset: 0,
    closed,
    equation: (t) => computeOutlineEdge(outline, 0, t),
  });
}
