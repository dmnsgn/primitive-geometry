/** @module lens */
import { sweptArc } from "./swept-arc.js";
import { rectangular } from "../../mappings.js";

/**
 * @typedef {object} LensOptions
 * @property {number} [radius=0.5] Radius of the first circle, centered at
 *   `-distance / 2`.
 * @property {number} [radius2=radius] Radius of the second circle, centered
 *   at `distance / 2`. Equal to `radius` (a symmetric lens) by default.
 * @property {number} [distance=radius] Distance between the two circles'
 *   centers.
 * @property {number} [segments=32] Column count, swept left to right.
 * @property {number} [innerSegments=16] Row count between the bottom and top
 *   boundary at each column.
 * @property {Function} [mapping=mappings.rectangular] Uv mapping function.
 *   Defaults to a flat, bounding-box-relative unwrap; pass a function using
 *   `uRatio`/`vRatio` (the swept parametrization) to follow the arcs
 *   instead.
 */

/**
 * Lens: the convex region where two circles overlap, centered on the x axis
 * and offset symmetrically by `distance`. Defaults to a Vesica Piscis.
 * @see [Wolfram MathWorld – Lens]{@link https://mathworld.wolfram.com/Lens.html}
 * @see [Wolfram MathWorld – Vesica Piscis]{@link https://mathworld.wolfram.com/VesicaPiscis.html}
 * @alias module:lens
 * @param {LensOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 */
export function lens({
  radius = 0.5,
  radius2 = radius,
  distance = radius,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {

  const r1 = radius;
  const r2 = radius2;
  const c1 = -distance / 2;
  const c2 = distance / 2;

  const uMin = Math.max(c1 - r1, c2 - r2);
  const uMax = Math.min(c1 + r1, c2 + r2);

  // Intersection is always convex, so the tighter of the two arcs at each
  // column bounds it directly, regardless of how radius/radius2/distance compare.
  const height = (x) =>
    Math.min(
      Math.sqrt(Math.max(r1 * r1 - (x - c1) ** 2, 0)),
      Math.sqrt(Math.max(r2 * r2 - (x - c2) ** 2, 0)),
    );
  const centerX = (uMin + uMax) / 2;

  return sweptArc({
    segments,
    innerSegments,
    uMin,
    uMax,
    mapping,
    center: [centerX, 0],
    sx: (uMax - uMin) / 2,
    sy: height(centerX),
    bounds: (x) => {
      const h = height(x);
      return [-h, h];
    },
    point: (x, y) => [x, y],
  });
}
