/** @module arbelos */
import { sweptArc } from "./swept-arc.js";
import { rectangular } from "../../mappings.js";
import { checkArguments, concatGeometries } from "../../utils.js";

/**
 * @typedef {object} ArbelosOptions
 * @property {number} [radius=0.5] Outer (enclosing) semicircle's radius:
 *   half the total baseline width.
 * @property {number} [innerRadius=radius*0.25] Radius of the left of the 2
 *   inner semicircles, both bulging the *same* way as the enclosing one
 *   (up, above the baseline) and tangent to each other where they meet it:
 *   `innerRadius` and `radius - innerRadius` apart from the enclosing
 *   semicircle's left/right ends, respectively.
 * @property {number} [segments=32] Column count, swept left to right.
 * @property {number} [innerSegments=16] Row count between the bottom and top
 *   boundary at each column.
 * @property {Function} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap; pass a function using
 *   `uRatio`/`vRatio` (the swept parametrization) to follow the arcs
 *   instead.
 */

/**
 * Arbelos ("shoemaker's knife"): the region inside a big semicircle and
 * outside 2 smaller ones, all sharing the same baseline and each pair
 * tangent where their diameters meet. Its area equals `pi * innerRadius *
 * (radius - innerRadius)` for any split point.
 * @see [Wolfram MathWorld – Arbelos]{@link https://mathworld.wolfram.com/Arbelos.html}
 * @alias module:arbelos
 * @param {ArbelosOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function arbelos({
  radius = 0.5,
  innerRadius = radius * 0.25,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {
  checkArguments(arguments);

  const R = radius;
  const r1 = innerRadius;
  const r2 = R - r1;
  const leftCenter = -R + r1;
  const rightCenter = r1;
  const splitX = leftCenter + r1;

  const outer = (x) => Math.sqrt(Math.max(R * R - x * x, 0));
  // Exactly 0 at the shared tangent point, rather than 2 formulas that
  // agree only up to floating-point noise.
  const leftInner = (x) =>
    x === splitX
      ? 0
      : Math.sqrt(Math.max(r1 * r1 - (x - leftCenter) ** 2, 0));
  const rightInner = (x) =>
    x === splitX
      ? 0
      : Math.sqrt(Math.max(r2 * r2 - (x - rightCenter) ** 2, 0));

  const center = [0, R / 2];
  const sx = R;
  const sy = R / 2;
  const point = (x, y) => [x, y];

  return concatGeometries([
    sweptArc({
      segments,
      innerSegments,
      uMin: -R,
      uMax: splitX,
      mapping,
      center,
      sx,
      sy,
      bounds: (x) => [leftInner(x), outer(x)],
      point,
    }),
    sweptArc({
      segments,
      innerSegments,
      uMin: splitX,
      uMax: R,
      mapping,
      center,
      sx,
      sy,
      bounds: (x) => [rightInner(x), outer(x)],
      point,
    }),
  ]);
}
