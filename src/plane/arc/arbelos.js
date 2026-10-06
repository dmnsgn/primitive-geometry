/**
 * @module primitiveGeometry
 * @ignore
 */
import { computeSweptArc } from "../../utils/polar.js";
import { rectangular } from "../../mappings.js";
import { concatGeometries } from "../../utils/common.js";

/**
 * @typedef {object} ArbelosOptions
 * @property {number} [radius=0.5] Outer semicircle radius.
 * @property {number} [innerRadius=radius*0.25] Left inner semicircle radius.
 *   The right one fills the rest.
 * @property {import("../../../types.js").PositiveInteger} [segments=32]
 *   Columns, left to right.
 * @property {import("../../../types.js").PositiveInteger} [innerSegments=16]
 *   Rows between the bottom and top boundaries.
 * @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
 *   Use `uRatio`/`vRatio` to follow the arcs.
 */

/**
 * An arbelos: a semicircle minus 2 tangent semicircles on its diameter.
 *
 * @param {ArbelosOptions} [options={}]
 * @returns {import("../../../types.js").SimplicialComplex}
 * @see [Wolfram MathWorld – Arbelos]{@link https://mathworld.wolfram.com/Arbelos.html}
 */
export function arbelos({
  radius = 0.5,
  innerRadius = radius * 0.25,
  segments = 32,
  innerSegments = 16,
  mapping = rectangular,
} = {}) {
  const R = radius;
  const r1 = innerRadius;
  const r2 = R - r1;
  const leftCenter = -R + r1;
  const rightCenter = r1;
  const splitX = leftCenter + r1;

  const outer = (x) => Math.sqrt(Math.max(R * R - x * x, 0));
  // Exactly 0 at the tangent point, where both formulas only agree up to noise
  const leftInner = (x) =>
    x === splitX ? 0 : Math.sqrt(Math.max(r1 * r1 - (x - leftCenter) ** 2, 0));
  const rightInner = (x) =>
    x === splitX ? 0 : Math.sqrt(Math.max(r2 * r2 - (x - rightCenter) ** 2, 0));

  const center = [0, R / 2];
  const sx = R;
  const sy = R / 2;
  const point = (x, y) => [x, y];

  return concatGeometries([
    computeSweptArc({
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
    computeSweptArc({
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
