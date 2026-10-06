/**
 * @module primitiveGeometry
 * @ignore
 */
import { rectangular } from "../mappings.js";
import { TAU } from "../utils/common.js";
import {
  computeOutlineEdge,
  computePolarGeometry,
  computePolarPathGeometry,
} from "../utils/polar.js";

const CORNER_COUNT = 12;

// CCW from the right arm's bottom-right corner: 2 outer + 1 inner per arm
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
 * @property {number} [armWidth=radius/3] Half-width of each arm. The default
 *   makes 5 equal squares.
 * @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {import("../../types.js").PositiveInteger} [innerSegments=16]
 * @property {number} [innerRadius=0] Hole radius, traced as a scaled cross. `0`
 *   fills to the center.
 * @property {boolean} [mergeCentroid="innerRadius === 0"]
 * @property {boolean} [mergeSeam=true] `false` splits the full turn's wrap edge
 *   for mappings wrapping there (eg. `mappings.polar`).
 * @property {import("../mappings.js").MappingFn} [mapping=mappings.rectangular]
 */

/**
 * A Greek cross: 4 equal arms around a square center.
 *
 * @param {CrossOptions} [options={}]
 * @returns {import("../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Greek Cross]{@link https://mathworld.wolfram.com/GreekCross.html}
 */
export function cross({
  radius = 0.5,
  armWidth = radius / 3,
  edgeSegments = 1,
  innerSegments = 16,
  innerRadius = 0,
  mergeCentroid = innerRadius === 0,
  mergeSeam = true,
  mapping = rectangular,
} = {}) {
  const r = radius;
  const w = armWidth;
  const outline = computeCrossOutline(r, w);

  return computePolarGeometry({
    sx: 1,
    sy: 1,
    radius: r,
    segments: CORNER_COUNT * edgeSegments,
    innerSegments,
    innerRadius,
    mergeCentroid,
    mergeSeam,
    mapping,
    equation: ({ rx, t }) => {
      // Each ring is a scaled copy of the outline
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
 * @property {import("../../types.js").PositiveInteger} [edgeSegments=1]
 * @property {boolean} [closed=false]
 */

/**
 * Outline dual of `cross`.
 *
 * @param {CrossPathOptions} [options={}]
 * @returns {import("../../types.js").PolylineComplex}
 */
export function crossPath({
  radius = 0.5,
  armWidth = radius / 3,
  edgeSegments = 1,
  closed = false,
} = {}) {
  const outline = computeCrossOutline(radius, armWidth);

  return computePolarPathGeometry({
    segments: CORNER_COUNT * edgeSegments,
    theta: TAU,
    thetaOffset: 0,
    closed,
    equation: (t) => computeOutlineEdge(outline, 0, t),
  });
}
